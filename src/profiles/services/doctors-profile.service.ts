import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { UpdateDoctorProfileDto } from '../dto/update-doctor-profile.dto';
import { db } from 'src/db';
import { doctors, doctorsToSpecializations } from 'src/db/schema';

@Injectable()
export class DoctorsProfileService {
    async getProfile(userId: number) {
        const profile = await db.query.doctors.findFirst({
            where: eq(doctors.userId, userId),
            with: {
                doctorsToSpecializations: {
                    with: {
                        specialization: true,
                    }
                }
            }
        });

        if (!profile) {
            throw new NotFoundException('Doctor profile not found');
        }

        return profile;
    }

    async updateProfile(userId: number, dto: UpdateDoctorProfileDto) {
        return await db.transaction(async (tx) => {
            // 1. التحقق من وجود الملف أو إنشائه
            let doctor = await tx.query.doctors.findFirst({
                where: eq(doctors.userId, userId),
            });

            if (doctor) {
                const updated = await tx
                    .update(doctors)
                    .set({
                        fullName: dto.fullName,
                        clinicId: dto.clinicId,
                        phone: dto.phone,
                        yearsOfExperience: dto.yearsOfExperience,
                        bio: dto.bio,
                        status: dto.status,
                    })
                    .where(eq(doctors.userId, userId))
                    .returning();
                doctor = updated[0];
            } else {
                const created = await tx
                    .insert(doctors)
                    .values({
                        userId,
                        fullName: dto.fullName,
                        clinicId: dto.clinicId,
                        phone: dto.phone,
                        yearsOfExperience: dto.yearsOfExperience,
                        bio: dto.bio,
                        status: dto.status,
                    })
                    .returning();
                doctor = created[0];
            }

            // 2. تحديث التخصصات الطبية في جدول الربط (Junction Table) إذا تم إرسالها
            if (dto.specializationIds) {
                // مسح التخصصات القديمة أولاً للطبيب الحالي
                await tx
                    .delete(doctorsToSpecializations)
                    .where(eq(doctorsToSpecializations.doctorId, doctor.doctorId));

                // إضافة التخصصات الجديدة دفعة واحدة
                if (dto.specializationIds.length > 0) {
                    const specializationRecords = dto.specializationIds.map((specId) => ({
                        doctorId: doctor.doctorId,
                        specializationId: specId,
                    }));
                    await tx.insert(doctorsToSpecializations).values(specializationRecords);
                }
            }

            return doctor;
        });
    }
} 