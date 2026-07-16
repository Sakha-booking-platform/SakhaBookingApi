import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { UpdateStaffProfileDto } from '../dto/update-staff-profile.dto';
import { staff } from 'src/db/schema';
import { db } from 'src/db';

@Injectable()
export class StaffProfileService {
  async getProfile(userId: number) {
    const profile = await db.query.staff.findFirst({
      where: eq(staff.userId, userId),
    });

    if (!profile) {
      throw new NotFoundException('Staff profile not found');
    }

    return profile;
  }

  async updateProfile(userId: number, dto: UpdateStaffProfileDto) {
    const existingProfile = await db.query.staff.findFirst({
      where: eq(staff.userId, userId),
    });

    if (existingProfile) {
      const updated = await db
        .update(staff)
        .set({
          fullName: dto.fullName,
          position: dto.position,
          clinicId: dto.clinicId,
          phone: dto.phone,
        })
        .where(eq(staff.userId, userId))
        .returning();
      
      return updated[0];
    }

    const created = await db
      .insert(staff)
      .values({
        userId,
        fullName: dto.fullName,
        position: dto.position,
        clinicId: dto.clinicId,
        phone: dto.phone,
      })
      .returning();

    return created[0];
  }
}