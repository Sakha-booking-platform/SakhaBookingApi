import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { doctors, patients, staff, users } from 'src/db/schema';

import { db } from 'src/db';
import { CreateUserDto } from '../dto/create_user.dyo';
import { CreatePatientProfileDto } from '../dto/create-patient-profile.dto';
@Injectable()
export class UsersService {

    async findByEmail(email: string) {
        if (!email) throw new BadRequestException('Email is required for search');

        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }
        return { message: 'User found successfully', data: user };
    }

    async findById(id: String) {
        const numericId = Number(id);
        if (isNaN(numericId)) {
            throw new BadRequestException('ID must be a valid number');
        }

        const user = await db.query.users.findFirst({
            where: eq(users.userId, numericId)
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return { message: 'User found successfully', data: user };
    }

    async create(data: CreateUserDto) {
        const [user] = await db
            .insert(users)
            .values({
                email: data.email.toLowerCase(),
            })
            .returning();

        return { message: 'User created successfully', data: user };
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
                message: 'Patient profile updated successfully',
                data: updated,
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
            message: 'Patient profile created successfully',
            data: created,
        };
    }


    async findAllUsersForAdmin() {
        const allUsers = await db
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
            
        return { message: 'Users retrieved successfully', data: allUsers };
    }


}