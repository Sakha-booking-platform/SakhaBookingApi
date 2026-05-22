import { Injectable, BadRequestException, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import * as schema from '../db/schema';
import { and, eq, avg, count, desc } from 'drizzle-orm';
import { CreateReviewDto } from './dtos/create_review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @Inject('DRIZZLE') private readonly db: any
  ) {}

  async createReview(dto: CreateReviewDto) {
    return await this.db.transaction(async (tx : any) => {
      
      // 1. التحقق من وجود الحجز وصلاحيته للمريض الحالي
      const appointment = await tx.select()
        .from(schema.appointments)
        .where(
          and(
            eq(schema.appointments.appointmentId, dto.appointmentId),
            eq(schema.appointments.patientId, dto.patientId)
          )
        )
        .limit(1);

      if (appointment.length === 0) {
        throw new NotFoundException('Requested appointment not found or does not belong to this patient');
      }

      // 2. 🛡️ الشرط الصارم: يجب أن تكون حالة الحجز COMPLETED
      if (appointment[0].status !== 'COMPLETED') {
        throw new BadRequestException('Doctor can only be reviewed after the visit is completed and marked as COMPLETED');
      }

      // 3. 🛡️ منع التكرار: التحقق مما إذا كان هذا الحجز قد تم تقييمه مسبقاً (Unique Constraint)
      const existingReview = await tx.select()
        .from(schema.reviews)
        .where(eq(schema.reviews.appointmentId, dto.appointmentId))
        .limit(1);

      if (existingReview.length > 0) {
        throw new ConflictException('You have already submitted a review for this appointment. Duplicate reviews for the same visit are not allowed');
      }

      // 4. إدخال التقييم الجديد في قاعدة البيانات
      const [newReview] = await tx.insert(schema.reviews).values({
        patientId: dto.patientId,
        appointmentId: dto.appointmentId,
        rating: dto.rating,
        comment: dto.comment || null,
      }).returning();

      return {
        message: 'Your review has been submitted successfully. Thank you!',
        data: newReview
      };
    });
  }

async getDoctorReviews(doctorId: number) {
    // 1. التحقق من وجود الطبيب في النظام أولاً
    const doctorExists = await this.db.select()
      .from(schema.doctors)
      .where(eq(schema.doctors.doctorId, doctorId))
      .limit(1);

    if (doctorExists.length === 0) {
      throw new NotFoundException('Requested doctor not found in the system');
    }

    // 2. جلب قائمة التقييمات مع أسماء المرضى (عبر ربط جدول الحجوزات بجدول المراجعات والمرضى)
    const reviewsList = await this.db.select({
      reviewId: schema.reviews.reviewId,
      rating: schema.reviews.rating,
      comment: schema.reviews.comment,
      createdAt: schema.reviews.createdAt,
      patient: {
        patientId: schema.patients.patientId,
        fullName: schema.patients.fullName,
      }
    })
    .from(schema.reviews)
    .leftJoin(schema.appointments, eq(schema.reviews.appointmentId, schema.appointments.appointmentId))
    .leftJoin(schema.patients, eq(schema.reviews.patientId, schema.patients.patientId))
    .where(eq(schema.appointments.doctorId, doctorId))
    .orderBy(desc(schema.reviews.createdAt));

    // 3. حساب متوسط التقييمات وإجمالي عدد المراجعات برمجياً بدقة عالية
    const totalReviews = reviewsList.length;
    const averageRating = totalReviews > 0 
      ? parseFloat((reviewsList.reduce((acc: number, item: any) => acc + item.rating, 0) / totalReviews).toFixed(1))
      : 0.0;

    return {
      message: 'Doctor reviews retrieved successfully',
      data: {
        doctorId,
        averageRating,
        totalReviews,
        records: reviewsList
      }
    };
  }
  async deleteReview(reviewId: number) {
    // 1. التحقق من وجود التقييم في النظام أولاً لقفل الثغرات
    const review = await this.db.select()
      .from(schema.reviews)
      .where(eq(schema.reviews.reviewId, reviewId))
      .limit(1);

    if (review.length === 0) {
      throw new NotFoundException('Requested review not found in the system or has already been deleted');
    }

    // 2. الحذف الفعلي للتقييم من قاعدة البيانات
    await this.db.delete(schema.reviews)
      .where(eq(schema.reviews.reviewId, reviewId));

    return {
      message: 'Review successfully deleted and removed from the doctor records',
      data: null
    };
  }
}