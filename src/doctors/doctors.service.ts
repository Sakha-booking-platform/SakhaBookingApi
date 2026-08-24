import { Injectable } from '@nestjs/common';
import { asc, avg, count, eq, inArray } from 'drizzle-orm';
import { db } from 'src/db';
import * as schema from 'src/db/schema';
import {
  hasRatingIntent,
  meaningfulSearchTokens,
  normalizeArabicSearch,
} from 'src/utils/arabic-search';
import { ListDoctorsQueryDto } from './dto/list-doctors-query.dto';
import { SearchDoctorsQueryDto } from './dto/search-doctors-query.dto';

type DoctorSpecialization = { id: number; name: string };

type DoctorCard = {
  id: number;
  name: string;
  image: string | null;
  specialization: string | null;
  specializations: DoctorSpecialization[];
  location: string | null;
  city: string | null;
  clinicName: string | null;
  availability: { startTime: string; endTime: string; isAvailableNow: boolean } | null;
  rating: number;
  reviewsCount: number;
};

@Injectable()
export class DoctorsService {
  private async doctorSpecializations(doctorIds: number[]) {
    const map = new Map<number, DoctorSpecialization[]>();
    doctorIds.forEach((id) => map.set(id, []));
    if (!doctorIds.length) return map;

    const rows = await db
      .select({
        doctorId: schema.doctorsToSpecializations.doctorId,
        id: schema.specializations.specializationId,
        name: schema.specializations.name,
      })
      .from(schema.doctorsToSpecializations)
      .innerJoin(
        schema.specializations,
        eq(schema.specializations.specializationId, schema.doctorsToSpecializations.specializationId),
      )
      .where(inArray(schema.doctorsToSpecializations.doctorId, doctorIds))
      .orderBy(asc(schema.specializations.name));

    for (const row of rows) {
      const current = map.get(row.doctorId) ?? [];
      if (!current.some((item) => item.id === row.id)) current.push({ id: row.id, name: row.name });
      map.set(row.doctorId, current);
    }
    return map;
  }

  private async doctorRatings(doctorIds: number[]) {
    const map = new Map<number, { rating: number; reviewsCount: number }>();
    doctorIds.forEach((id) => map.set(id, { rating: 0, reviewsCount: 0 }));
    if (!doctorIds.length) return map;

    const rows = await db
      .select({
        doctorId: schema.appointments.doctorId,
        rating: avg(schema.reviews.rating),
        reviewsCount: count(schema.reviews.reviewId),
      })
      .from(schema.reviews)
      .innerJoin(schema.appointments, eq(schema.appointments.appointmentId, schema.reviews.appointmentId))
      .where(inArray(schema.appointments.doctorId, doctorIds))
      .groupBy(schema.appointments.doctorId);

    for (const row of rows) {
      if (row.doctorId == null) continue;
      map.set(row.doctorId, {
        rating: Number(Number(row.rating ?? 0).toFixed(1)),
        reviewsCount: Number(row.reviewsCount ?? 0),
      });
    }
    return map;
  }

  private async doctorAvailability(doctorIds: number[]) {
    const map = new Map<number, { startTime: string; endTime: string; isAvailableNow: boolean } | null>();
    doctorIds.forEach((id) => map.set(id, null));
    if (!doctorIds.length) return map;

    const rows = await db
      .select({
        doctorId: schema.doctorAvailability.doctorId,
        dayOfWeek: schema.doctorAvailability.dayOfWeek,
        startTime: schema.doctorAvailability.startTime,
        endTime: schema.doctorAvailability.endTime,
      })
      .from(schema.doctorAvailability)
      .where(inArray(schema.doctorAvailability.doctorId, doctorIds))
      .orderBy(asc(schema.doctorAvailability.startTime));

    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const row of rows) {
      if (row.doctorId == null || row.dayOfWeek !== currentDay) continue;
      const startTime = String(row.startTime).slice(0, 5);
      const endTime = String(row.endTime).slice(0, 5);
      const isAvailableNow = currentTime >= startTime && currentTime <= endTime;
      const current = map.get(row.doctorId);
      if (!current || isAvailableNow) {
        map.set(row.doctorId, { startTime, endTime, isAvailableNow });
      }
    }
    return map;
  }

  private async loadCards(): Promise<DoctorCard[]> {
    const rows = await db
      .select({
        id: schema.doctors.doctorId,
        fullName: schema.doctors.fullName,
        clinicName: schema.clinics.name,
        location: schema.clinics.location,
        city: schema.clinics.city,
        profileImage: schema.doctors.profileImage,
      })
      .from(schema.doctors)
      .leftJoin(
        schema.clinics,
        eq(schema.clinics.clinicId, schema.doctors.clinicId),
      )
      .where(eq(schema.doctors.status, 'ACTIVE'))
      .orderBy(asc(schema.doctors.doctorId));

    const ids = rows.map((row) => row.id);

    const [specMap, ratingMap, availabilityMap] = await Promise.all([
      this.doctorSpecializations(ids),
      this.doctorRatings(ids),
      this.doctorAvailability(ids),
    ]);

    return rows.map((row) => {
      const specializations = specMap.get(row.id) ?? [];
      const ratingInfo = ratingMap.get(row.id) ?? { rating: 0, reviewsCount: 0 };

      return {
        id: row.id,
        name: row.fullName,
        image: row.profileImage,
        specialization: specializations[0]?.name ?? null,
        specializations,
        location: row.location,
        city: row.city,
        clinicName: row.clinicName,
        availability: availabilityMap.get(row.id) ?? null,
        rating: ratingInfo.rating,
        reviewsCount: ratingInfo.reviewsCount,
      };
    });
  }

  private inferSpecializationIds(cards: DoctorCard[], search?: string) {
    const normalized = normalizeArabicSearch(search ?? '');
    const result = new Set<number>();
    if (!normalized) return result;
    for (const card of cards) {
      for (const spec of card.specializations) {
        const specName = normalizeArabicSearch(spec.name);
        if (specName && normalized.includes(specName)) result.add(spec.id);
      }
    }
    return result;
  }

  private relevantDoctorTokens(cards: DoctorCard[], search?: string, inferredSpecIds = new Set<number>()) {
    const specNames = new Set(
      cards.flatMap((card) =>
        card.specializations
          .filter((spec) => inferredSpecIds.has(spec.id))
          .flatMap((spec) => meaningfulSearchTokens(spec.name)),
      ),
    );
    const tokens = meaningfulSearchTokens(search).filter((token) => !specNames.has(token));
    return tokens.filter((token) =>
      cards.some((card) =>
        [card.name, card.clinicName ?? '', card.city ?? '', card.location ?? '']
          .map(normalizeArabicSearch)
          .some((field) => field.includes(token)),
      ),
    );
  }

  private matchedDoctorFields(card: DoctorCard, search?: string) {
    const tokens = meaningfulSearchTokens(search);
    const result = new Set<string>();
    const name = normalizeArabicSearch(card.name);
    const clinic = normalizeArabicSearch(card.clinicName ?? '');
    const city = normalizeArabicSearch(card.city ?? '');
    const location = normalizeArabicSearch(card.location ?? '');
    const specialization = normalizeArabicSearch(card.specializations.map((item) => item.name).join(' '));

    for (const token of tokens) {
      if (name.includes(token)) result.add('doctorName');
      if (specialization.includes(token)) result.add('specialization');
      if (clinic.includes(token)) result.add('clinicName');
      if (city.includes(token)) result.add('city');
      if (location.includes(token)) result.add('location');
    }
    return [...result];
  }

  private paginate<T>(items: T[], page: number, limit: number) {
    const total = items.length;
    const offset = (page - 1) * limit;
    const data = items.slice(offset, offset + limit);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    return { data, meta: { page, limit, total, totalPages, hasNextPage: page < totalPages } };
  }

  async findAll(query: ListDoctorsQueryDto = new ListDoctorsQueryDto()) {
    const cards = await this.loadCards();
    cards.sort((a, b) => b.rating - a.rating || a.id - b.id);
    return this.paginate(cards, query.page ?? 1, query.limit ?? 10);
  }

  // ✅ البحث المحسن - يدعم الجمل والكلمات
  async search(query: SearchDoctorsQueryDto = new SearchDoctorsQueryDto()) {
    let cards = await this.loadCards();
    
    const hasSearch = query.search != null && query.search.trim().length > 0;
    const hasSpecialization = query.specializationId != null;
    
    if (hasSpecialization) {
      cards = cards.filter((card) =>
        card.specializations.some((spec) => spec.id === query.specializationId)
      );
    }

    // ✅ البحث بالجمل - تقسيم النص إلى كلمات والبحث عن أي كلمة
    if (hasSearch) {
      const searchText = query.search!.trim();
      // تقسيم النص إلى كلمات منفصلة
      const searchWords = searchText.split(' ').filter(word => word.length > 0);
      
      cards = cards.filter((card) => {
        // البحث عن أي كلمة من الجملة
        return searchWords.some((word) => {
          const normalizedWord = normalizeArabicSearch(word);
          const nameMatch = normalizeArabicSearch(card.name).includes(normalizedWord);
          const specMatch = card.specializations.some((spec) =>
            normalizeArabicSearch(spec.name).includes(normalizedWord)
          );
          const clinicMatch = card.clinicName != null && 
                              normalizeArabicSearch(card.clinicName!).includes(normalizedWord);
          const cityMatch = card.city != null && 
                            normalizeArabicSearch(card.city!).includes(normalizedWord);
          const locationMatch = card.location != null && 
                                normalizeArabicSearch(card.location!).includes(normalizedWord);
          
          return nameMatch || specMatch || clinicMatch || cityMatch || locationMatch;
        });
      });
    }

    if (query.sortBy === 'rating' || hasRatingIntent(query.search) || !query.sortBy) {
      cards.sort((a, b) => b.rating - a.rating || a.id - b.id);
    }

    const withSearchMeta = cards.map((card) => ({
      ...card,
      matchedFields: this.matchedDoctorFields(card, query.search),
    }));

    return this.paginate(withSearchMeta, query.page ?? 1, query.limit ?? 10);
  }
}