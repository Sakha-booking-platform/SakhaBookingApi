import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule'; // ⭐ جديد
import { db } from '../db';
import * as schema from '../db/schema';
import { and, eq, count, inArray, desc, sql, lt } from 'drizzle-orm'; // ⭐ أضفنا lt
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UpdateAppointmentDto } from './dtos/update-appointment.dto';
import { UpdateAppointmentStatusDto } from './dtos/update-appointment-status.dto';
import { AppointmentStatus } from './enum/appointmentStatus';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class AppointmentsService {
  private readonly db = db;
  constructor(private readonly socketGateway: SocketGateway) {}

  // ⭐⭐⭐ Cron Job: يشتغل كل يوم الساعة 00:00
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredAppointments() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    try {
      // 1️⃣ جلب المواعيد الماضية اللي لسه PENDING
      const expiredAppointments = await this.db
        .select({
          appointmentId: schema.appointments.appointmentId,
          status: schema.appointments.status,
          appointmentDate: schema.appointments.appointmentDate,
          patientId: schema.appointments.patientId, // ⭐ جديد: نحتاج patientId
        })
        .from(schema.appointments)
        .where(
          and(
            eq(schema.appointments.status, 'PENDING'),
            lt(schema.appointments.appointmentDate, today),
          ),
        );

      if (expiredAppointments.length === 0) {
        console.log('✅ لا يوجد مواعيد منتهية بحاجة تحديث');
        return;
      }

      // 2️⃣ ⭐⭐⭐ نحدّث واحد واحد + نرسل WebSocket لكل مريض
      for (const appointment of expiredAppointments) {
        // تحديث الحالة
        await this.db
          .update(schema.appointments)
          .set({ status: 'NO_SHOW' })
          .where(
            eq(schema.appointments.appointmentId, appointment.appointmentId),
          );

        // ⭐⭐⭐ إرسال WebSocket للمريض
        if (appointment.patientId) {
          const roomName = `patient_room_${appointment.patientId}`;
          this.socketGateway.emitToRoom(
            roomName,
            'appointment_status_changed',
            {
              appointmentId: appointment.appointmentId,
              status: 'NO_SHOW',
            },
          );
          console.log(
            `📢 Notified patient ${appointment.patientId} about appointment ${appointment.appointmentId} → NO_SHOW`,
          );
        }
      }

      console.log(
        `✅ تم تحديث ${expiredAppointments.length} موعد منتهي لـ NO_SHOW وإشعار المرضى`,
      );
    } catch (error) {
      console.error('❌ خطأ في تحديث المواعيد المنتهية:', error);
    }
  }

  async bookAppointment(dto: CreateAppointmentDto) {
    return await this.db.transaction(async (tx) => {
      const doctor = await tx
        .select()
        .from(schema.doctors)
        .where(eq(schema.doctors.doctorId, dto.doctorId))
        .limit(1);

      if (doctor.length === 0) throw new NotFoundException('الطبيب غير موجود');
      if (doctor[0].status !== 'ACTIVE')
        throw new BadRequestException('الطبيب غير متاح حالياً');

      const doctorClinic = await tx
        .select({
          requiresPrepayment: schema.clinics.requiresPrepayment,
          paymentInstructions: schema.clinics.paymentInstructions,
        })
        .from(schema.clinics)
        .where(eq(schema.clinics.clinicId, dto.clinicId))
        .limit(1);

      if (doctorClinic.length === 0)
        throw new NotFoundException('العيادة المطلوبة غير موجودة');

      const clinicPolicy = doctorClinic[0];

      if (clinicPolicy.requiresPrepayment && !dto.paymentReference) {
        throw new BadRequestException(
          `هذه العيادة تتطلب الدفع المسبق لتأكيد الحجز. يرجى تحويل المبلغ أولاً وإدخال رقم مرجع الحوالة. تعليمات العيادة: ${clinicPolicy.paymentInstructions}`,
        );
      }

      const emergencyHoliday = await tx
        .select()
        .from(schema.doctorExceptions)
        .where(
          and(
            eq(schema.doctorExceptions.doctorId, dto.doctorId),
            eq(schema.doctorExceptions.clinicId, dto.clinicId),
            eq(schema.doctorExceptions.specificDate, dto.appointmentDate),
            eq(schema.doctorExceptions.isClosed, true),
          ),
        )
        .limit(1);

      if (emergencyHoliday.length > 0) {
        throw new BadRequestException(
          `العيادة مغلقة طارئاً: ${emergencyHoliday[0].reason}`,
        );
      }

      const activeStatuses = [
        AppointmentStatus.PENDING,
        AppointmentStatus.CONFIRMED,
      ] as const;

      const totalActiveAppointments = await tx
        .select({ value: count() })
        .from(schema.appointments)
        .where(
          and(
            eq(schema.appointments.patientId, dto.patientId),
            inArray(schema.appointments.status, activeStatuses),
          ),
        );

      if ((totalActiveAppointments[0]?.value || 0) >= 3) {
        throw new BadRequestException(
          'عذراً، لقد وصلت للحد الأقصى المسموح به للحجوزات النشطة في النظام (3 حجوزات كحد أقصى للـ حساب الواحد)',
        );
      }

      const clinicActiveAppointments = await tx
        .select({ value: count() })
        .from(schema.appointments)
        .where(
          and(
            eq(schema.appointments.patientId, dto.patientId),
            eq(schema.appointments.clinicId, dto.clinicId),
            inArray(schema.appointments.status, activeStatuses),
          ),
        );

      if ((clinicActiveAppointments[0]?.value || 0) >= 3) {
        throw new BadRequestException(
          'عذراً، لديك بالفعل 3 حجوزات نشطة في هذه العيادة. لا يمكنك إضافة حجز جديد حتى يتم استكمال أو إلغاء أحدها.',
        );
      }

      const dateObj = new Date(dto.appointmentDate);
      const dayOfWeek = dateObj.getUTCDay();

      const availability = await tx
        .select()
        .from(schema.doctorAvailability)
        .where(
          and(
            eq(schema.doctorAvailability.doctorId, dto.doctorId),
            eq(schema.doctorAvailability.dayOfWeek, dayOfWeek),
          ),
        )
        .limit(1);

      if (availability.length === 0) {
        throw new BadRequestException('الطبيب لا يعمل في هذا اليوم من الأسبوع');
      }

      const reqTime = dto.appointmentTime;
      const startTime = availability[0].startTime;
      const endTime = availability[0].endTime;

      if (reqTime < startTime || reqTime > endTime) {
        throw new BadRequestException(
          `وقت الحجز خارج ساعات العمل (${startTime} - ${endTime})`,
        );
      }

      const conflictingAppointment = await tx
        .select()
        .from(schema.appointments)
        .where(
          and(
            eq(schema.appointments.doctorId, dto.doctorId),
            eq(schema.appointments.clinicId, dto.clinicId),
            eq(schema.appointments.appointmentDate, dto.appointmentDate),
            eq(schema.appointments.appointmentTime, dto.appointmentTime),
            inArray(schema.appointments.status, activeStatuses),
          ),
        )
        .limit(1);

      if (conflictingAppointment.length > 0) {
        throw new ConflictException('هذا الموعد محجوز مسبقاً، اختر وقتاً آخر.');
      }

      const existingAppointmentsCount = await tx
        .select({ value: count() })
        .from(schema.appointments)
        .where(
          and(
            eq(schema.appointments.doctorId, dto.doctorId),
            eq(schema.appointments.appointmentDate, dto.appointmentDate),
          ),
        );

      const nextQueueNumber = (existingAppointmentsCount[0]?.value || 0) + 1;

      const hour = parseInt(reqTime.split(':')[0], 10);
      const periodType = hour < 12 ? 'morning' : 'evening';

      const [newAppointment] = await tx
        .insert(schema.appointments)
        .values({
          patientId: dto.patientId,
          doctorId: dto.doctorId,
          clinicId: dto.clinicId,
          availabilityId: availability[0].availabilityId,
          appointmentDate: dto.appointmentDate,
          appointmentTime: dto.appointmentTime,
          periodType: periodType,
          queueNumber: nextQueueNumber,
          status: 'PENDING',
          notes: dto.notes || null,
          paymentReference: dto.paymentReference || null,
          paymentAttachment: dto.paymentAttachment || null,
          isPaymentVerified: false,
        })
        .returning();

      await tx.insert(schema.notifications).values([
        {
          userId: doctor[0].userId,
          title: '🗓️ طلب حجز جديد وثابت القيود',
          message: `المريض طلب حجزاً مع تطبيق سياسة حماية السقف، رقم الدور الحالي (${nextQueueNumber})`,
          isRead: false,
        },
      ]);

      // ⭐⭐⭐ إرسال WebSocket — موعد جديد
      const roomName = `patient_room_${dto.patientId}`;
      this.socketGateway.emitToRoom(roomName, 'new_appointment', {
        appointmentId: newAppointment.appointmentId,
        status: newAppointment.status,
        appointmentDate: newAppointment.appointmentDate,
        appointmentTime: newAppointment.appointmentTime,
        doctorId: newAppointment.doctorId,
        clinicId: newAppointment.clinicId,
      });
      console.log(
        `📢 Notified patient ${dto.patientId} about new appointment ${newAppointment.appointmentId}`,
      );

      return {
        success: true,
        message: clinicPolicy.requiresPrepayment
          ? 'تم رفع طلب الحجز بنجاح وإرسال إثبات الدفع، يرجى انتظار تأكيد السكرتيرة.'
          : 'تم الحجز بنجاح في انتظار حضورك للعيادة.',
        data: newAppointment,
      };
    });
  }

  async getPatientAppointments(patientId: number) {
    const patientExists = await this.db
      .select()
      .from(schema.patients)
      .where(eq(schema.patients.patientId, patientId))
      .limit(1);

    if (patientExists.length === 0) {
      throw new NotFoundException('المريض المطلوب غير موجود في النظام');
    }

    const data = await this.db
      .select({
        appointmentId: schema.appointments.appointmentId,
        appointmentDate: schema.appointments.appointmentDate,
        appointmentTime: schema.appointments.appointmentTime,
        periodType: schema.appointments.periodType,
        queueNumber: schema.appointments.queueNumber,
        status: schema.appointments.status,
        notes: schema.appointments.notes,
        paymentReference: schema.appointments.paymentReference,
        paymentAttachment: schema.appointments.paymentAttachment,
        isPaymentVerified: schema.appointments.isPaymentVerified,
        createdAt: schema.appointments.createdAt,
        clinic: {
          clinicId: schema.clinics.clinicId,
          name: schema.clinics.name,
          location: schema.clinics.location,
          city: schema.clinics.city,
          price: schema.clinics.price,
          clinicImage: schema.clinics.clinicImage,
        },
        doctor: {
          doctorId: schema.doctors.doctorId,
          fullName: schema.doctors.fullName,
          phone: schema.doctors.phone,
          bio: schema.doctors.bio,
          yearsOfExperience: schema.doctors.yearsOfExperience,
          specializations: sql<string[]>`COALESCE(
          json_agg(
            json_build_object(
              'id', ${schema.specializations.specializationId},
              'name', ${schema.specializations.name}
            )
          ) FILTER (WHERE ${schema.specializations.specializationId} IS NOT NULL), 
          '[]'::json
        )`,
        },
      })
      .from(schema.appointments)
      .leftJoin(
        schema.clinics,
        eq(schema.appointments.clinicId, schema.clinics.clinicId),
      )
      .leftJoin(
        schema.doctors,
        eq(schema.appointments.doctorId, schema.doctors.doctorId),
      )
      .leftJoin(
        schema.doctorsToSpecializations,
        eq(schema.doctors.doctorId, schema.doctorsToSpecializations.doctorId),
      )
      .leftJoin(
        schema.specializations,
        eq(
          schema.doctorsToSpecializations.specializationId,
          schema.specializations.specializationId,
        ),
      )
      .where(eq(schema.appointments.patientId, patientId))
      .groupBy(
        schema.appointments.appointmentId,
        schema.clinics.clinicId,
        schema.doctors.doctorId,
      )
      .orderBy(
        desc(schema.appointments.appointmentDate),
        desc(schema.appointments.appointmentTime),
      );

    return {
      success: true,
      message: 'تم جلب سجل حجوزات المريض مع التخصصات بنجاح',
      count: data.length,
      data: data,
    };
  }

  async getDoctorAppointments(doctorId: number) {
    const doctorExists = await this.db
      .select()
      .from(schema.doctors)
      .where(eq(schema.doctors.doctorId, doctorId))
      .limit(1);

    if (doctorExists.length === 0) {
      throw new NotFoundException('الطبيب المطلوب غير موجود في النظام');
    }

    const data = await this.db
      .select({
        appointmentId: schema.appointments.appointmentId,
        appointmentDate: schema.appointments.appointmentDate,
        appointmentTime: schema.appointments.appointmentTime,
        periodType: schema.appointments.periodType,
        queueNumber: schema.appointments.queueNumber,
        status: schema.appointments.status,
        notes: schema.appointments.notes,
        createdAt: schema.appointments.createdAt,
        patient: {
          patientId: schema.patients.patientId,
          fullName: schema.patients.fullName,
          phone: schema.patients.phone,
          gender: schema.patients.gender,
          birthDate: schema.patients.birthDate,
        },
      })
      .from(schema.appointments)
      .leftJoin(
        schema.patients,
        eq(schema.appointments.patientId, schema.patients.patientId),
      )
      .where(eq(schema.appointments.doctorId, doctorId))
      .orderBy(
        desc(schema.appointments.appointmentDate),
        schema.appointments.appointmentTime,
      );

    return {
      success: true,
      message: 'تم جلب جدول مواعيد الطبيب بنجاح',
      count: data.length,
      data: data,
    };
  }

  async updateAppointment(appointmentId: number, dto: UpdateAppointmentDto) {
    const existingAppointment = await this.db
      .select()
      .from(schema.appointments)
      .where(eq(schema.appointments.appointmentId, appointmentId))
      .limit(1);

    if (existingAppointment.length === 0) {
      throw new NotFoundException('الحجز المطلوب غير موجود');
    }

    const currentAppointment = existingAppointment[0];

    if (
      currentAppointment.status === AppointmentStatus.CANCELLED ||
      currentAppointment.status === AppointmentStatus.COMPLETED ||
      currentAppointment.status === AppointmentStatus.NO_SHOW
    ) {
      throw new BadRequestException(
        'لا يمكن تعديل هذا الحجز لأنه مغلق أو مكتمل',
      );
    }

    const updateData: Partial<typeof schema.appointments.$inferInsert> = {};

    if (dto.appointmentDate !== undefined) {
      updateData.appointmentDate = dto.appointmentDate;
    }
    if (dto.appointmentTime !== undefined) {
      updateData.appointmentTime = dto.appointmentTime;
    }
    if (dto.notes !== undefined) {
      updateData.notes = dto.notes;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('لا يوجد بيانات لتحديث الحجز');
    }

    const [updatedAppointment] = await this.db
      .update(schema.appointments)
      .set(updateData)
      .where(eq(schema.appointments.appointmentId, appointmentId))
      .returning();

    return {
      success: true,
      message: 'تم تحديث بيانات الحجز بنجاح',
      data: updatedAppointment,
    };
  }

  async updateAppointmentStatus(
    appointmentId: number,
    newStatus: UpdateAppointmentStatusDto,
  ) {
    return await this.db.transaction(async (tx) => {
      const appointment = await tx
        .select({
          appointmentId: schema.appointments.appointmentId,
          status: schema.appointments.status,
          appointmentDate: schema.appointments.appointmentDate,
          appointmentTime: schema.appointments.appointmentTime,
          patientId: schema.appointments.patientId,
          doctorId: schema.appointments.doctorId,
        })
        .from(schema.appointments)
        .where(eq(schema.appointments.appointmentId, appointmentId))
        .limit(1);

      if (appointment.length === 0) {
        throw new NotFoundException('الحجز المطلوب غير موجود في النظام');
      }

      const currentStatus = appointment[0].status;

      if (
        currentStatus === AppointmentStatus.CANCELLED ||
        currentStatus === AppointmentStatus.COMPLETED ||
        currentStatus === AppointmentStatus.NO_SHOW
      ) {
        throw new BadRequestException(
          `لا يمكن تعديل حالة هذا الحجز لأنه مغلق حالياً بحالة (${currentStatus})`,
        );
      }

      const updateData: Partial<typeof schema.appointments.$inferInsert> = {
        status: newStatus.status,
      };

      if (newStatus.reason) {
        updateData.notes = newStatus.reason;
      }

      const [updatedAppointment] = await tx
        .update(schema.appointments)
        .set(updateData)
        .where(eq(schema.appointments.appointmentId, appointmentId))
        .returning();

      const patientId = appointment[0].patientId;
      if (patientId === null) {
        throw new BadRequestException(
          'لا يمكن إرسال إشعار لأن معرف المريض غير متوفر لهذا الحجز',
        );
      }

      const patientUser = await tx
        .select({ userId: schema.patients.userId })
        .from(schema.patients)
        .where(eq(schema.patients.patientId, patientId))
        .limit(1);

      if (patientUser.length > 0 && patientUser[0].userId) {
        let title = '🔄 تحديث في موعدك';
        let message = `تم تغيير حالة موعدك بتاريخ ${appointment[0].appointmentDate} إلى ${newStatus.status}`;

        if (newStatus.status === AppointmentStatus.CONFIRMED) {
          title = '✅ تم تأكيد موعدك!';
          message = `مرحباً، تم تأكيد حجزك بنجاح ليوم ${appointment[0].appointmentDate} الساعة ${appointment[0].appointmentTime}. يرجى الحضور في الموعد.`;
        } else if (newStatus.status === AppointmentStatus.CANCELLED) {
          title = '❌ تم إلغاء الموعد';
          message = newStatus.reason
            ? `نعتذر منك، تم إلغاء موعدك المقرر في ${appointment[0].appointmentDate}. السبب: ${newStatus.reason}. يمكنك إعادة الجدولة في وقت لاحق.`
            : `نعتذر منك، تم إلغاء موعدك المقرر في ${appointment[0].appointmentDate}. يمكنك إعادة الجدولة في وقت لاحق.`;
        } else if (newStatus.status === AppointmentStatus.COMPLETED) {
          title = '🩺 نتمنى لك الشفاء العاجل';
          message = `تم إكمال زيارتك للطبيب بنجاح. شكراً لثقتك بمنصة Dori، يمكنك الآن تقييم الخدمة!`;
        }

        await tx.insert(schema.notifications).values({
          userId: patientUser[0].userId,
          title: title,
          message: message,
          type: 'APPOINTMENT_UPDATE',
          isRead: false,
        });
      }

      const roomName = `patient_room_${patientId}`;
      this.socketGateway.emitToRoom(roomName, 'appointment_status_changed', {
        appointmentId: updatedAppointment.appointmentId,
        status: updatedAppointment.status,
      });

      return {
        success: true,
        message: `تم تحديث حالة الحجز بنجاح من (${currentStatus}) إلى (${newStatus.status}) وإشعار المريض وبث التحديث بالوقت الفعلي.`,
        data: updatedAppointment,
      };
    });
  }

  async getAppointmentById(appointmentId: number) {
    const appointment = await this.db
      .select({
        appointmentId: schema.appointments.appointmentId,
        appointmentDate: schema.appointments.appointmentDate,
        appointmentTime: schema.appointments.appointmentTime,
        periodType: schema.appointments.periodType,
        queueNumber: schema.appointments.queueNumber,
        status: schema.appointments.status,
        notes: schema.appointments.notes,
        paymentReference: schema.appointments.paymentReference,
        paymentAttachment: schema.appointments.paymentAttachment,
        isPaymentVerified: schema.appointments.isPaymentVerified,
        createdAt: schema.appointments.createdAt,
        doctor: {
          doctorId: schema.doctors.doctorId,
          fullName: schema.doctors.fullName,
        },
        clinic: {
          clinicId: schema.clinics.clinicId,
          name: schema.clinics.name,
          location: schema.clinics.location,
        },
      })
      .from(schema.appointments)
      .leftJoin(
        schema.doctors,
        eq(schema.appointments.doctorId, schema.doctors.doctorId),
      )
      .leftJoin(
        schema.clinics,
        eq(schema.appointments.clinicId, schema.clinics.clinicId),
      )
      .where(eq(schema.appointments.appointmentId, appointmentId))
      .limit(1);

    if (appointment.length === 0) {
      throw new NotFoundException('الحجز المطلوب غير موجود');
    }

    return { success: true, data: appointment[0] };
  }

  async getClinicAppointments(clinicId: number) {
    const data = await this.db
      .select()
      .from(schema.appointments)
      .where(eq(schema.appointments.clinicId, clinicId))
      .orderBy(desc(schema.appointments.appointmentDate));

    return { success: true, count: data.length, data };
  }
}
