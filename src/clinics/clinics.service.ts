import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { db } from 'src/db'; // تأكد من مطابقة مسار استيراد ملف الـ db لديك
import * as schema from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { CreateClinicDto } from './dto/create_clinic.dto';

@Injectable()
export class ClinicsService {
  
  // ==========================================
  // 1. العمليات الخاصة بالعيادات (Clinics)
  // ==========================================

  /**
   * جلب جميع العيادات المتوفرة في النظام
   * أداء محسّن: جلب الحقول المطلوبة فقط لعرضها في القائمة العامة لتقليل استهلاك الذاكرة
   */
  async findAllClinics() {
    try {
      return await db
        .select({
          id: schema.clinics.clinicId,
          name: schema.clinics.name,
          city: schema.clinics.city,
          address: schema.clinics.address,
          phone: schema.clinics.phone,
        })
        .from(schema.clinics);
    } catch (error) {
      throw new InternalServerErrorException('حدث خطأ أثناء جلب قائمة العيادات');
    }
  }

  /**
   * جلب تفاصيل عيادة معينة مع الأطباء والموظفين التابعين لها
   */
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

    // 2. جلب الأطباء التابعين لهذه العيادة
    const doctors = await db
      .select({
        id: schema.doctors.doctorId,
        fullName: schema.doctors.fullName,
        phone: schema.doctors.phone,
        status: schema.doctors.status,
      })
      .from(schema.doctors)
      .where(eq(schema.doctors.clinicId, clinicId));

    // 3. جلب موظفي الاستقبال/السكرتارية التابعين للعيادة
    const staff = await db
      .select({
        id: schema.staff.staffId,
        fullName: schema.staff.fullName,
        position: schema.staff.position,
      })
      .from(schema.staff)
      .where(eq(schema.staff.clinicId, clinicId));

    return {
      ...clinic,
      doctors,
      staff,
    };
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
          address: dto.address,
          city: dto.city,
          phone: dto.phone,
          description: dto.description || null,
        })
        .returning();

      return {
        message: 'تم تسجيل العيادة الطبية الجديدة بنجاح',
        clinic: newClinic,
      };
    } catch (error) {
      throw new InternalServerErrorException('فشل إدخال العيادة في قاعدة البيانات، يرجى مراجعة المدخلات');
    }
  }


  // ==========================================
  // 2. العمليات الخاصة بالتخصصات (Specializations)
  // ==========================================

  /**
   * جلب جميع التخصصات الطبية المتوفرة
   */
  async findAllSpecializations() {
    try {
      return await db.select().from(schema.specializations);
    } catch (error) {
      throw new InternalServerErrorException('حدث خطأ أثناء جلب التخصصات الطبية');
    }
  }

  /**
   * إنشاء تخصص طبي جديد
   * مراجعة الثغرات: فحص الاسم لمنع تكرار نفس التخصص (مثل منع إدخال "طب أطفال" مرتين في لوحة التحكم)
   */
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
        })
        .returning();

      return {
        message: 'تم إضافة التخصص الطبي بنجاح',
        specialization: newSpec,
      };
    } catch (error) {
      throw new InternalServerErrorException('فشل إضافة التخصص الطبي، حاول مرة أخرى لاحقاً');
    }
  }
}