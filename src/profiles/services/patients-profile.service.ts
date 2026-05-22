import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { UpdatePatientProfileDto } from '../dto/update-patient-profile.dto';
import { db } from 'src/db';
import { patients } from 'src/db/schema';

@Injectable()
export class PatientsProfileService {
  async getProfile(userId: number) {

    console.log(userId )
        console.log("==========================" )

    const profile = await db.query.patients.findFirst({
      where: eq(patients.userId, userId),
    });
 
    if (!profile) {
      throw new NotFoundException('Patient profile not found');
    }

    return { message: 'Patient profile retrieved successfully', data: profile };
  }

  async updateProfile(userId: number, dto: UpdatePatientProfileDto) {
    const existingProfile = await db.query.patients.findFirst({
      where: eq(patients.userId, userId),
    });

    if (existingProfile) {
      const updated = await db
        .update(patients)
        .set({
          fullName: dto.fullName,
          phone: dto.phone,
          gender: dto.gender,
          birthDate: dto.birthDate,
          address: dto.address,
        })
        .where(eq(patients.userId, userId))
        .returning();
      
      return { message: 'Patient profile updated successfully', data: updated[0] };
    }

    const created = await db
      .insert(patients)
      .values({
        userId,
        fullName: dto.fullName,
        phone: dto.phone,
        gender: dto.gender,
        birthDate: dto.birthDate,
        address: dto.address,
      })
      .returning();

    return { message: 'Patient profile created successfully', data: created[0] };
  }
}