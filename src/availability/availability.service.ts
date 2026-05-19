import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from 'src/db';
import { doctorAvailability, doctors } from 'src/db/schema'; // 👈 تأكد من استيراد جدول doctors هنا
import { SetAvailabilityDto } from './dto/set-availability.dto';

@Injectable()
export class AvailabilityService {
  
  // 🟢 قمنا بتغيير اسم المعامل الأول إلى userId ليعكس الحقيقة
  async setAvailability(userId: number, dto: SetAvailabilityDto) {
    
    // 1. جلب سجل الطبيب المقابل للمستخدم الحالي لاستخراج الـ doctorId الحقيقي
    const doctorRecord = await db.query.doctors.findFirst({
      where: eq(doctors.userId, userId), // افترضنا أن اسم الحقل في جدول الأطباء هو userId
    });

    // إذا لم يجد ملف طبيب مرتبط بهذا المستخدم
    if (!doctorRecord) {
      throw new NotFoundException('لم يتم العثور على ملف طبيب مرتبط بهذا الحساب.');
    }

    const realDoctorId = doctorRecord.doctorId; // 👈 هذا هو المعرف الصحيح المطلوب في الـ Foreign Key (مثلاً: 1)

    return await db.transaction(async (tx) => {
      
      // 2. استخراج العيادات المذكورة في الطلب لمسح مواعيدها القديمة لهذا الطبيب فقط
      const clinicIds = [...new Set(dto.availability.map(item => item.clinicId))];
      
      for (const clinicId of clinicIds) {
        await tx
          .delete(doctorAvailability)
          .where(
            and( 
              eq(doctorAvailability.doctorId, realDoctorId), // 👈 استخدام المعرف الحقيقي هنا
              eq(doctorAvailability.clinicId, clinicId)
            )
          );
      }

      // 3. إدخال المواعيد الجديدة دفعة واحدة
      if (dto.availability.length > 0) {
        const records = dto.availability.map((item) => ({
          doctorId: realDoctorId, // 👈 استخدام المعرف الحقيقي هنا
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

  // تذكر تحديث هذه الدالة أيضاً لتجلب باستخدام الـ doctorId الحقيقي أو تعديلها لاحقاً
  async getDoctorAvailability(doctorId: number) {
    return await db.query.doctorAvailability.findMany({
      where: eq(doctorAvailability.doctorId, doctorId),
    });
  }
}