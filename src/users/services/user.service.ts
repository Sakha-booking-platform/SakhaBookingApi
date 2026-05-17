import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { doctors, patients, staff, users } from 'src/db/schema';

import { db } from 'src/db';
import { CreateUserDto } from '../dto/create_user.dyo';
import { CreatePatientProfileDto } from '../dto/create-patient-profile.dto';
@Injectable()
export class UsersService {

    async findByEmail(email: string) {
        if (!email) throw new BadRequestException('البريد الإلكتروني مطلوب للبحث');

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            throw new NotFoundException(`المستخدم ذو البريد ${email} غير موجود`);
        }
        return user;
    }

    async findById(id: String) {
        const numericId = Number(id);
        // احتمال: إذا لم يكن المعرف رقماً صالحاً
        if (isNaN(numericId)) {
            throw new BadRequestException('المعرف (ID) يجب أن يكون رقماً صالحاً');
        }

        const user = await db.query.users.findFirst({
            where: eq(users.userId, numericId)
        });

        // احتمال: المستخدم غير موجود
        if (!user) {
            throw new NotFoundException(`المستخدم ذو الرقم ${id} غير موجود`);
        }
        return user;
    }

    async create(data: CreateUserDto) {
        const [user] = await db
            .insert(users)
            .values({
                email: data.email.toLowerCase(),
            })
            .returning();

        return user;
    }


    async upsertProfile(userId: number, dto: CreatePatientProfileDto) {

        const existing = await db.query.patients.findFirst({
            where: eq(patients.userId, userId),
        });

        // 🔵 إذا موجود → update
        if (existing) {
            const [updated] = await db
                .update(patients)
                .set({
                    fullName: dto.fullName,
                    phone: dto.phone,
                    birthDate: dto.dateOfBirth,
                    gender: dto.gender,
                    address: dto.address,
                })
                .where(eq(patients.userId, userId))
                .returning();

            return {
                message: 'Patient profile updated',
                patient: updated,
            };
        }

        // 🟢 إذا غير موجود → create
        const [created] = await db
            .insert(patients)
            .values({
                userId,
                fullName: dto.fullName,
                phone: dto.phone,
                birthDate: dto.dateOfBirth,
                gender: dto.gender,
                address: dto.address,
            })
            .returning();

        return {
            message: 'Patient profile created',
            patient: created,
        };
    }


    async findAllUsersForAdmin() {
        return await db
            .select({
                id: users.userId,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
                // جلب تفاصيل الطبيب إن وجدت
                doctorDetails: {
                    fullName: doctors.fullName,
                    phone: doctors.phone,
                    status: doctors.status,
                },
                // جلب تفاصيل المريض إن وجدت
                patientDetails: {
                    fullName: patients.fullName,
                    phone: patients.phone,
                },
                // جلب تفاصيل الموظف إن وجدت
                staffDetails: {
                    fullName: staff.fullName,
                    position: staff.position,
                },
            })
            .from(users)
            .leftJoin(doctors, eq(users.userId, doctors.userId))
            .leftJoin(patients, eq(users.userId, patients.userId))
            .leftJoin(staff, eq(users.userId, staff.userId));
    }


}