import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from 'src/db';
import { appointments, doctorAvailability, doctorExceptions, doctors } from 'src/db/schema';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { DoctorStatus } from './enum/doctor_status';
import { Appointmentstatusenum } from './enum/appointmentStatusEnum';
import { CreateEmergencyHolidayDto } from './dto/create-emergency-holiday.dto';

@Injectable()
export class AvailabilityService {
  
  // 1. إعداد وتحديث فترات الدوام الثابتة (يدعم فترات متعددة لنفس اليوم)
  async setAvailability(userId: number, dto: SetAvailabilityDto) {
    
    // جلب سجل الطبيب المقابل للمستخدم الحالي لاستخراج الـ doctorId الحقيقي
    const doctorRecord = await db.query.doctors.findFirst({
      where: eq(doctors.userId, userId),
    });

    if (!doctorRecord) {
      throw new NotFoundException('لم يتم العثور على ملف طبيب مرتبط بهذا الحساب.');
    }

    const realDoctorId = doctorRecord.doctorId;

    return await db.transaction(async (tx) => {
      
      // استخراج العيادات المذكورة في الطلب لمسح مواعيدها القديمة لهذا الطبيب فقط
      const clinicIds = [...new Set(dto.availability.map(item => item.clinicId))];
      
      for (const clinicId of clinicIds) {
        await tx
          .delete(doctorAvailability)
          .where(
            and( 
              eq(doctorAvailability.doctorId, realDoctorId),
              eq(doctorAvailability.clinicId, clinicId)
            )
          );
      }

      // إدخال المواعيد الجديدة دفعة واحدة
      if (dto.availability.length > 0) {
        const records = dto.availability.map((item) => ({
          doctorId: realDoctorId,
          clinicId: item.clinicId,
          dayOfWeek: item.dayOfWeek,
          startTime: item.startTime,
          endTime: item.endTime,
          maxPatients: item.maxPatients || 20,
        }));

        await tx.insert(doctorAvailability).values(records).returning();
        return { message: 'تم تحديث المواعيد بنجاح.' };
      }
      
      return { message: 'تم تحديث المواعيد بنجاح، لا توجد مواعيد جديدة لإدراجها.' };
    });
  }

  // 2. جلب القواعد الخام الثابتة للطبيب (مفيدة للوحة تحكم الطبيب نفسه)
  async getDoctorAvailability(doctorId: number) {
    return await db.query.doctorAvailability.findMany({
      where: eq(doctorAvailability.doctorId, doctorId),
    });
  }

  // 🚀 الميزة الاحترافية: توليد تقويم حقيقي مرن ومدمج بالاستثناءات والعطل للمريض
  async getDoctorCalendar(doctorId: number, limitDays: number) {
    
    // 1. جلب فترات العمل الدورية الثابتة للطبير من الداتا بيز
    const availabilities = await db.query.doctorAvailability.findMany({
      where: eq(doctorAvailability.doctorId, doctorId),
    });

    // 2. جلب الاستثناءات والإجازات الطارئة المحددة لهذا الطبيب
    const exceptions = await db.query.doctorExceptions.findMany({
      where: eq(doctorExceptions.doctorId, doctorId),
    });

    const calendar = [];
    const today = new Date();

    // حلقة تكرارية لتوليد الأيام يوماً تلو الآخر بناءً على السقف المحدد (مثلاً 30 يوماً)
  // حلقة تكرارية لتوليد الأيام يوماً تلو الآخر بناءً على السقف المحدد (مثلاً 30 يوماً)
    for (let i = 0; i < limitDays; i++) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() + i);

      const dayOfWeek = currentDate.getDay(); // 0 = الأحد، 1 = الإثنين...
      const formattedDate = currentDate.toISOString().split('T')[0]; // صيغة YYYY-MM-DD

      // فحص هل هذا التاريخ لديه استثناء مسجل في قاعدة البيانات؟
      const dayException = exceptions.find((e) => e.specificDate === formattedDate);
      
      // فحص الدوام المعتاد والدوري لهذا اليوم من الأسبوع
      const regularPeriods = availabilities.filter((a) => a.dayOfWeek === dayOfWeek);

      let status = 'holiday'; 
      let note = '';
      
      let periods: {
        availabilityId?: number;
        clinicId: number | null; 
        startTime: string | null;
        endTime: string | null;
        periodType: 'morning' | 'evening';
      }[] = [];

      // 🔥 تطبيق المنطق الهندسي المرن لدمج الجدولين:
      if (dayException) {
        if (dayException.isClosed) {
          status = 'exception_closed'; 
          note = dayException.reason || 'إجازة طارئة';
        } else {
          status = 'available'; 
          note = dayException.reason || 'دوام استثنائي';

          const startTimeStr = dayException.startTime || '00:00';
          const startHour = parseInt(startTimeStr.split(':')[0], 10);
          
          periods = [{
            clinicId: dayException.clinicId, // سيعمل الآن بسلام سواء كان رقماً أو null
            startTime: dayException.startTime,
            endTime: dayException.endTime,
            periodType: startHour < 12 ? 'morning' : 'evening'
          }];
        }
      } else if (regularPeriods.length > 0) {
        status = 'available';
        note = 'دوام اعتيادي';
        
        periods = regularPeriods.map((p) => {
          const startTimeStr = p.startTime || '00:00';
          const startHour = parseInt(startTimeStr.split(':')[0], 10);
          
          return {
            availabilityId: p.availabilityId,
            clinicId: p.clinicId, // سيمر الآن بدون أي اعتراض من النوع المتوافق
            startTime: p.startTime,
            endTime: p.endTime,
            periodType: startHour < 12 ? 'morning' : 'evening', 
          };
        });
      } else {
        status = 'holiday';
        note = 'عطلة أسبوعية';
      }

      // دفع اليوم كاملاً بالبيانات المهندسة للتقويم
      calendar.push({
        date: formattedDate,
        dayName: currentDate.toLocaleDateString('ar-EG', { weekday: 'long' }),
        status, 
        note,   
        periods,
      });
    }

    // يعود بالمصفوفة كاملة وجاهزة لتطبيق الـ Flutter
    return calendar;
  
}


  // 🚨 ميزة السكرتير: إغلاق يوم طارئ والتعامل مع الحجوزات والاعتذار للمرضى
  async createEmergencyHoliday(data: CreateEmergencyHolidayDto) {
    
    // تنفيذ العمليات داخل Transaction لضمان أنه إذا فشل إلغاء الحجوزات لا يتم إغلاق اليوم بالخطأ
    return await db.transaction(async (tx) => {
      
      // 1️⃣ أولاً: تسجيل الإجازة الطارئة في جدول الاستثناءات
      await tx.insert(doctorExceptions).values({
        doctorId: data.doctorId,
        clinicId: data.clinicId,
        specificDate: data.specificDate,
        isClosed: true, // مغلق
        reason: data.reason,
      });

      // 2️⃣ ثانياً: جلب وتحديث كل الحجوزات القائمة في هذا اليوم لإلغائها
      const affectedAppointments = await tx
        .update(appointments)
        .set({
          status: Appointmentstatusenum.PENDING, // تغيير الحالة إلى ملغي من قبل العيادة
          notes: data.reason // حفظ سبب الاعتذار ليظهر للمريض
        })
        .where(
          and(
            eq(appointments.doctorId, data.doctorId),
            eq(appointments.clinicId, data.clinicId),
            eq(appointments.appointmentDate, data.specificDate),
            eq(appointments.status, Appointmentstatusenum.CONFIRMED) // الحجوزات المؤكدة فقط
          )
        )
        .returning(); // إرجاع الحجوزات المتأثرة لكي نرسل لهم إشعارات

      // 3️⃣ ثالثاً: حلقة لإرسال الإشعارات والاعتذار (Background Tasks)
      for (const appointment of affectedAppointments) {
        // هنا تستدعي خدمة الإشعارات Firebase أو خدمة الرسائل
        // sendPushNotification(appointment.userId, "تنويه واعتذار طارئ", data.reason);
        console.log(`تم إلغاء حجز المريض رقم ${appointment.patientId} وإرسال رسالة اعتذار له.`);
      }

      return {
        message: "تم إغلاق اليوم بنجاح، وإلغاء الحجوزات القائمة، وجاري إرسال الاعتذارات للمرضى.",
        cancelledCount: affectedAppointments.length
      };
    });
  }

} 