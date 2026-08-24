import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { db } from 'src/db';
import * as schema from 'src/db/schema';
import {
  hasNearbyIntent,
  meaningfulSearchTokens,
  normalizeArabicSearch,
} from 'src/utils/arabic-search';
import { CreateClinicDto } from './dto/create_clinic.dto';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { ListClinicsQueryDto } from './dto/list-clinics-query.dto';
import { SearchClinicsQueryDto } from './dto/search-clinics-query.dto';
import { NearbyClinicsQueryDto } from './dto/nearby-clinics-query.dto';

type ClinicSpecialization = { id: number; name: string };
type DoctorAvatar = { id: number; name: string; image: string | null };

type ClinicBaseCard = {
  id: number;
  name: string;
  image: string | null;
  address: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  description: string | null;
  specializations: ClinicSpecialization[];
  distanceKm: number | null;
  doctorAvatars: DoctorAvatar[];
};

@Injectable()
export class ClinicsService {
  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private validateCoordinatePair(lat?: number, lng?: number) {
    if ((lat == null) !== (lng == null)) {
      throw new BadRequestException('lat و lng يجب إرسالهما معاً أو تركهما معاً');
    }
  }

  private async clinicSpecializations(clinicIds: number[]) {
    const map = new Map<number, ClinicSpecialization[]>();
    clinicIds.forEach((id) => map.set(id, []));
    if (!clinicIds.length) return map;

    const rows = await db
      .select({
        clinicId: schema.doctors.clinicId,
        id: schema.specializations.specializationId,
        name: schema.specializations.name,
      })
      .from(schema.doctors)
      .innerJoin(
        schema.doctorsToSpecializations,
        eq(schema.doctorsToSpecializations.doctorId, schema.doctors.doctorId),
      )
      .innerJoin(
        schema.specializations,
        eq(schema.specializations.specializationId, schema.doctorsToSpecializations.specializationId),
      )
      .where(and(inArray(schema.doctors.clinicId, clinicIds), eq(schema.doctors.status, 'ACTIVE')))
      .orderBy(asc(schema.specializations.name));

    for (const row of rows) {
      if (row.clinicId == null) continue;
      const current = map.get(row.clinicId) ?? [];
      if (!current.some((item) => item.id === row.id)) {
        current.push({ id: row.id, name: row.name });
      }
      map.set(row.clinicId, current);
    }
    return map;
  }

  private async clinicDoctorAvatars(clinicIds: number[]) {
    const map = new Map<number, DoctorAvatar[]>();
    clinicIds.forEach((id) => map.set(id, []));
    if (!clinicIds.length) return map;

    const rows = await db
      .select({
        clinicId: schema.doctors.clinicId,
        id: schema.doctors.doctorId,
        name: schema.doctors.fullName,
        image: schema.doctors.profileImage,
      })
      .from(schema.doctors)
      .where(and(inArray(schema.doctors.clinicId, clinicIds), eq(schema.doctors.status, 'ACTIVE')))
      .orderBy(asc(schema.doctors.doctorId));

    for (const row of rows) {
      if (row.clinicId == null) continue;
      const current = map.get(row.clinicId) ?? [];
      if (current.length < 3) {
        current.push({ id: row.id, name: row.name, image: row.image });
      }
      map.set(row.clinicId, current);
    }
    return map;
  }

  private async clinicAvailability(clinicIds: number[]) {
    const result = new Map<number, boolean>();
    clinicIds.forEach((id) => result.set(id, false));
    if (!clinicIds.length) return result;

    const rows = await db
      .select({
        clinicId: schema.doctorAvailability.clinicId,
        startTime: schema.doctorAvailability.startTime,
        endTime: schema.doctorAvailability.endTime,
        dayOfWeek: schema.doctorAvailability.dayOfWeek,
      })
      .from(schema.doctorAvailability)
      .innerJoin(schema.doctors, eq(schema.doctors.doctorId, schema.doctorAvailability.doctorId))
      .where(and(inArray(schema.doctorAvailability.clinicId, clinicIds), eq(schema.doctors.status, 'ACTIVE')));

    const now = new Date();
    const day = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const row of rows) {
      if (row.clinicId == null || row.dayOfWeek !== day) continue;
      const start = String(row.startTime).slice(0, 5);
      const end = String(row.endTime).slice(0, 5);
      if (currentTime >= start && currentTime <= end) result.set(row.clinicId, true);
    }
    return result;
  }

  private async loadBaseCards(lat?: number, lng?: number, limit = 50, offset = 0): Promise<ClinicBaseCard[]> {
    this.validateCoordinatePair(lat, lng);

    const rows = await db
      .select({
        id: schema.clinics.clinicId,
        name: schema.clinics.name,
        image: schema.clinics.clinicImage,
        address: schema.clinics.location,
        city: schema.clinics.city,
        latitude: schema.clinics.latitude,
        longitude: schema.clinics.longitude,
        phone: schema.clinics.phone,
        description: schema.clinics.description,
      })
      .from(schema.clinics)
      .orderBy(asc(schema.clinics.clinicId))
      .limit(limit)
      .offset(offset);

    if (rows.length === 0) return [];

    const clinicIds = rows.map((row) => row.id);

    const [specMap, avatarMap] = await Promise.all([
      this.clinicSpecializations(clinicIds),
      this.clinicDoctorAvatars(clinicIds),
    ]);

    return rows.map((row) => ({
      ...row,
      specializations: specMap.get(row.id) ?? [],
      doctorAvatars: avatarMap.get(row.id) ?? [],
      distanceKm:
        lat != null && lng != null && row.latitude != null && row.longitude != null
          ? Number(this.haversineKm(lat, lng, row.latitude, row.longitude).toFixed(2))
          : null,
    }));
  }

  private inferSpecializationIds(cards: ClinicBaseCard[], search?: string) {
    const normalized = normalizeArabicSearch(search ?? '');
    if (!normalized) return new Set<number>();
    const result = new Set<number>();
    for (const card of cards) {
      for (const spec of card.specializations) {
        const specName = normalizeArabicSearch(spec.name);
        if (specName && normalized.includes(specName)) result.add(spec.id);
      }
    }
    return result;
  }

  private relevantClinicTokens(cards: ClinicBaseCard[], search?: string, inferredSpecIds = new Set<number>()) {
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
        [card.name, card.city ?? '', card.address ?? '']
          .map(normalizeArabicSearch)
          .some((field) => field.includes(token)),
      ),
    );
  }

  private matchedClinicFields(card: ClinicBaseCard, search?: string) {
    const tokens = meaningfulSearchTokens(search);
    const result = new Set<string>();
    const name = normalizeArabicSearch(card.name);
    const city = normalizeArabicSearch(card.city ?? '');
    const location = normalizeArabicSearch(card.address ?? '');
    const specialization = normalizeArabicSearch(card.specializations.map((item) => item.name).join(' '));

    for (const token of tokens) {
      if (name.includes(token)) result.add('clinicName');
      if (specialization.includes(token)) result.add('specialization');
      if (city.includes(token)) result.add('city');
      if (location.includes(token)) result.add('location');
    }
    return [...result];
  }

  private async getTotalCount() {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.clinics);
    return Number(result[0]?.count ?? 0);
  }

  private paginate<T>(items: T[], page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
      },
    };
  }

  async findAllClinics(query: ListClinicsQueryDto = new ListClinicsQueryDto()) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const cards = await this.loadBaseCards(query.lat, query.lng, limit, offset);
    const total = await this.getTotalCount();

    return this.paginate(cards, page, limit, total);
  }

  // ✅ البحث المحسن - يدعم الجمل والكلمات
  async searchClinics(query: SearchClinicsQueryDto = new SearchClinicsQueryDto()) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    
    const hasSearch = query.search != null && query.search.trim().length > 0;
    const hasLocation = query.lat != null && query.lng != null;
    const hasSpecialization = query.specializationId != null;
    const nearbyIntent = hasNearbyIntent(query.search);

    if (nearbyIntent && !hasLocation) {
      throw new BadRequestException('lat و lng مطلوبان للبحث القريب من موقع المستخدم');
    }

    let cards = await this.loadBaseCards(
      query.lat ?? undefined,
      query.lng ?? undefined,
      200,
      0
    );

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
          const cityMatch = card.city != null && normalizeArabicSearch(card.city!).includes(normalizedWord);
          const addressMatch = card.address != null && normalizeArabicSearch(card.address!).includes(normalizedWord);
          
          return nameMatch || specMatch || cityMatch || addressMatch;
        });
      });
    }

    if (hasLocation) {
      cards = cards
        .filter((card) => card.distanceKm != null)
        .sort((a, b) => (a.distanceKm ?? Number.MAX_VALUE) - (b.distanceKm ?? Number.MAX_VALUE));
    }

    const total = cards.length;
    const paginatedCards = cards.slice(offset, offset + limit);

    const withSearchMeta = paginatedCards.map((card) => ({
      ...card,
      matchedFields: this.matchedClinicFields(card, query.search),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: withSearchMeta,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
      },
    };
  }

  async findNearbyClinics(query: NearbyClinicsQueryDto) {
    let cards = await this.loadBaseCards(query.lat, query.lng, 200, 0);
    
    cards = cards
      .filter((card) => card.distanceKm != null)
      .sort((a, b) => (a.distanceKm ?? Number.MAX_VALUE) - (b.distanceKm ?? Number.MAX_VALUE))
      .slice(0, 20);

    const availabilityMap = await this.clinicAvailability(cards.map((card) => card.id));

    return {
      data: cards.map((card) => {
        const isAvailableNow = availabilityMap.get(card.id) ?? false;
        return {
          ...card,
          isAvailableNow,
          availabilityStatus: isAvailableNow ? 'OPEN_NOW' : 'CLOSED',
        };
      }),
    };
  }

  async findClinicDetails(clinicId: number) {
    const clinicRows = await db
      .select()
      .from(schema.clinics)
      .where(eq(schema.clinics.clinicId, clinicId))
      .limit(1);

    if (clinicRows.length === 0) {
      throw new NotFoundException(`العيادة المطلوبة ذات الرقم (${clinicId}) غير موجودة في النظام`);
    }

    const clinic = clinicRows[0];
    const [doctors, staff] = await Promise.all([
      db
        .select({
          id: schema.doctors.doctorId,
          fullName: schema.doctors.fullName,
          phone: schema.doctors.phone,
          status: schema.doctors.status,
        })
        .from(schema.doctors)
        .where(eq(schema.doctors.clinicId, clinicId)),
      db
        .select({
          id: schema.staff.staffId,
          fullName: schema.staff.fullName,
          position: schema.staff.position,
        })
        .from(schema.staff)
        .where(eq(schema.staff.clinicId, clinicId)),
    ]);

    return { ...clinic, doctors, staff };
  }

  async createClinic(dto: CreateClinicDto) {
    const existingClinic = await db
      .select()
      .from(schema.clinics)
      .where(eq(schema.clinics.phone, dto.phone))
      .limit(1);

    if (existingClinic.length > 0) {
      throw new ConflictException('رقم الهاتف هذا مسجل بالفعل لعيادة أخرى في النظام');
    }

    try {
      const [newClinic] = await db
        .insert(schema.clinics)
        .values({
          name: dto.name,
          location: dto.address,
          city: dto.city,
          phone: dto.phone,
          description: dto.description || null,
        })
        .returning();
      return { message: 'تم تسجيل العيادة الطبية الجديدة بنجاح', clinic: newClinic };
    } catch {
      throw new InternalServerErrorException('فشل إدخال العيادة في قاعدة البيانات، يرجى مراجعة المدخلات');
    }
  }

  async findAllSpecializations() {
    return db
      .select({
        id: schema.specializations.specializationId,
        name: schema.specializations.name,
        icon: schema.specializations.icon,
      })
      .from(schema.specializations)
      .orderBy(asc(schema.specializations.name));
  }

  async createSpecialization(dto: CreateSpecializationDto) {
    const existingSpec = await db
      .select()
      .from(schema.specializations)
      .where(eq(schema.specializations.name, dto.name))
      .limit(1);

    if (existingSpec.length > 0) {
      throw new ConflictException(`التخصص الطبي "${dto.name}" موجود بالفعل في النظام`);
    }

    try {
      const [newSpec] = await db
        .insert(schema.specializations)
        .values({
          name: dto.name,
          description: dto.description || null,
          icon: dto.icon || null,
        })
        .returning();
      return { message: 'تم إضافة التخصص الطبي بنجاح', specialization: newSpec };
    } catch {
      throw new InternalServerErrorException('فشل إضافة التخصص الطبي، حاول مرة أخرى لاحقاً');
    }
  }
}