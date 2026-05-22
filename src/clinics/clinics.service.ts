import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { db } from 'src/db'; // تأكد من مطابقة مسار استيراد ملف الـ db لديك
import * as schema from 'src/db/schema';
import { eq } from 'drizzle-orm';
import { CreateClinicDto } from './dto/create_clinic.dto';
import { CreateSpecializationDto } from './dto/create-specialization.dto';

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
      const data = await db
        .select({
          id: schema.clinics.clinicId,
          name: schema.clinics.name,
          address: schema.clinics.location,
          phone: schema.clinics.phone,

        })
        .from(schema.clinics);
        
      return { message: 'Clinics retrieved successfully', data };
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while fetching the list of clinics');
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
      throw new NotFoundException(`The requested clinic with ID (${clinicId}) does not exist in the system`);
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
      message: 'Clinic details retrieved successfully',
      data: {
        ...clinic,
        doctors,
        staff,
      }
    };
  }

 
  async createClinic(dto: CreateClinicDto) {
    const existingClinic = await db
      .select()
      .from(schema.clinics)
      .where(eq(schema.clinics.phone, dto.phone))
      .limit(1);

    if (existingClinic.length > 0) {
      throw new ConflictException('This phone number is already registered to another clinic in the system');
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

      return {
        message: 'New medical clinic registered successfully',
        data: newClinic,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to insert clinic into the database, please check the inputs');
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
      const data = await db.select().from(schema.specializations);
      return { message: 'Specializations retrieved successfully', data };
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while fetching medical specializations');
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
      throw new ConflictException(`The medical specialization "${dto.name}" already exists in the system`);
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
        message: 'Medical specialization added successfully',
        data: newSpec,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to add medical specialization, please try again later');
    }
  }
}