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
        throw new NotFoundException('الحجز المطلوب غير موجود أو لا ينتمي لهذا المريض');
      }

      // 2. 🛡️ الشرط الصارم: يجب أن تكون حالة الحجز COMPLETED
      if (appointment[0].status !== 'COMPLETED') {
        throw new BadRequestException('لا يمكن تقييم الطبيب إلا بعد إتمام الزيارة وكتابة الحجز كـ COMPLETED');
      }

      // 3. 🛡️ منع التكرار: التحقق مما إذا كان هذا الحجز قد تم تقييمه مسبقاً (Unique Constraint)
      const existingReview = await tx.select()
        .from(schema.reviews)
        .where(eq(schema.reviews.appointmentId, dto.appointmentId))
        .limit(1);

      if (existingReview.length > 0) {
        throw new ConflictException('لقد قمت بوضع تقييم لهذا الحجز مسبقاً، لا يمكن تكرار التقييم لنفس الزيارة');
      }

      // 4. إدخال التقييم الجديد في قاعدة البيانات
      const [newReview] = await tx.insert(schema.reviews).values({
        patientId: dto.patientId,
        appointmentId: dto.appointmentId,
        rating: dto.rating,
        comment: dto.comment || null,
      }).returning();

      return {
        success: true,
        message: 'تم تسجيل تقييمك بنجاح، شكراً لك!',
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
      throw new NotFoundException('الطبيب المطلوب غير موجود في النظام');
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
      success: true,
      message: 'تم جلب تقييمات الطبيب بنجاح',
      doctorId,
      averageRating, // مثال: 4.8
      totalReviews,  // مثال: 15 تقييم
      data: reviewsList
    };
  }
  async deleteReview(reviewId: number) {
    // 1. التحقق من وجود التقييم في النظام أولاً لقفل الثغرات
    const review = await this.db.select()
      .from(schema.reviews)
      .where(eq(schema.reviews.reviewId, reviewId))
      .limit(1);

    if (review.length === 0) {
      throw new NotFoundException('التقييم المطلوب غير موجود في النظام أو تم حذفه مسبقاً');
    }

    // 2. الحذف الفعلي للتقييم من قاعدة البيانات
    await this.db.delete(schema.reviews)
      .where(eq(schema.reviews.reviewId, reviewId));

    return {
      success: true,
      message: 'تم حذف التقييم بنجاح وإزالته من سجلات الطبيب',
    };
  }
}