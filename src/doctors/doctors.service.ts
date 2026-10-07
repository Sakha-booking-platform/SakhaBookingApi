import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { db } from 'src/db';
import * as schema from 'src/db/schema';
import { ilike } from 'drizzle-orm';

@Injectable()
export class DoctorsService {
  async findAllDoctors(page: number = 1) {
    const limit = 10;
    const offset = (page - 1) * limit;
    try {
      return await db
        .select({
          id: schema.doctors.doctorId,
          fullName: schema.doctors.fullName,
          phone: schema.doctors.phone,
          yearsOfExperience: schema.doctors.yearsOfExperience,
          bio: schema.doctors.bio,
          status: schema.doctors.status,
          clinicId: schema.doctors.clinicId,
        })
        .from(schema.doctors)
        .limit(limit)
        .offset(offset);
    } catch (error) {
      throw new InternalServerErrorException('حدث خطأ أثناء جلب الأطباء');
    }
  }

  async searchDoctors(query: string, page: number = 1) {
    const limit = 10;
    const offset = (page - 1) * limit;
    try {
      return await db
        .select({
          id: schema.doctors.doctorId,
          fullName: schema.doctors.fullName,
          phone: schema.doctors.phone,
          yearsOfExperience: schema.doctors.yearsOfExperience,
          bio: schema.doctors.bio,
          status: schema.doctors.status,
          clinicId: schema.doctors.clinicId,
        })
        .from(schema.doctors)
        .where(ilike(schema.doctors.fullName, `%${query}%`))
        .limit(limit)
        .offset(offset);
    } catch (error) {
      throw new InternalServerErrorException('حدث خطأ أثناء البحث عن الأطباء');
    }
  }
}
