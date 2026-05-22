import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { db } from '../db';
import * as schema from '../db/schema';
import { and, eq, or, count, inArray, desc, sql } from 'drizzle-orm';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dtos/update-appointment-status.dto';
import { AppointmentStatus } from './enum/appointmentStatus';
import { SocketGateway } from 'src/socket/socket.gateway';

@Injectable()
export class AppointmentsService {
    private readonly db = db;
    constructor(
        private readonly socketGateway: SocketGateway,
    ) { }
async bookAppointment(dto: CreateAppointmentDto) {
        return await this.db.transaction(async (tx: any) => {

            const doctor = await tx.select()
                .from(schema.doctors)
                .where(eq(schema.doctors.doctorId, dto.doctorId))
                .limit(1);

            if (doctor.length === 0) throw new NotFoundException('Doctor not found');
            if (doctor[0].status !== 'ACTIVE') throw new BadRequestException('Doctor is currently unavailable');

            const doctorClinic = await tx.select({
                requiresPrepayment: schema.clinics.requiresPrepayment,
                paymentInstructions: schema.clinics.paymentInstructions,
            })
                .from(schema.clinics)
                .where(eq(schema.clinics.clinicId, dto.clinicId))
                .limit(1);

            if (doctorClinic.length === 0) throw new NotFoundException('Requested clinic not found');
             
            const clinicPolicy = doctorClinic[0];

            if (clinicPolicy.requiresPrepayment && !dto.paymentReference) {
                throw new BadRequestException(
                    `This clinic requires prepayment to confirm the booking. Please transfer the amount first and enter the reference number. Clinic instructions: ${clinicPolicy.paymentInstructions}`
                );
            }

            const emergencyHoliday = await tx.select()
                .from(schema.doctorExceptions)
                .where(
                    and(
                        eq(schema.doctorExceptions.doctorId, dto.doctorId),
                        eq(schema.doctorExceptions.clinicId, dto.clinicId),
                        eq(schema.doctorExceptions.specificDate, dto.appointmentDate),
                        eq(schema.doctorExceptions.isClosed, true)
                    )
                )
                .limit(1);

            if (emergencyHoliday.length > 0) {
                throw new BadRequestException(`Clinic is closed due to an emergency: ${emergencyHoliday[0].reason}`);
            }

            const activeStatuses = [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] as const;
            
            const totalActiveAppointments = await tx.select({ value: count() })
                .from(schema.appointments)
                .where(
                    and(
                        eq(schema.appointments.patientId, dto.patientId),
                        inArray(schema.appointments.status, activeStatuses)
                    )
                );

            if ((totalActiveAppointments[0]?.value || 0) >= 3) {
                throw new BadRequestException('Sorry, you have reached the maximum allowed active appointments in the system (maximum 3 appointments per account)');
            }

            const clinicActiveAppointments = await tx.select({ value: count() })
                .from(schema.appointments)
                .where(
                    and(
                        eq(schema.appointments.patientId, dto.patientId),
                        eq(schema.appointments.clinicId, dto.clinicId),
                        inArray(schema.appointments.status, activeStatuses)
                    )
                );

            if ((clinicActiveAppointments[0]?.value || 0) >= 3) {
                throw new BadRequestException('Sorry, you already have 3 active appointments in this clinic. You cannot add a new appointment until one is completed or cancelled.');
            }

            
            const dateObj = new Date(dto.appointmentDate);
            const dayOfWeek = dateObj.getUTCDay(); 

            const availability = await tx.select()
                .from(schema.doctorAvailability)
                .where(
                    and(
                        eq(schema.doctorAvailability.doctorId, dto.doctorId),
                        eq(schema.doctorAvailability.dayOfWeek, dayOfWeek)
                    )
                )
                .limit(1);

            if (availability.length === 0) {
                throw new BadRequestException('The doctor does not work on this day of the week');
            }

            const reqTime = dto.appointmentTime;
            const startTime = availability[0].startTime;
            const endTime = availability[0].endTime;

            if (reqTime < startTime || reqTime > endTime) {
                throw new BadRequestException(`Appointment time is outside working hours (${startTime} - ${endTime})`);
            }

            const conflictingAppointment = await tx.select()
                .from(schema.appointments)
                .where(
                    and(
                        eq(schema.appointments.doctorId, dto.doctorId),
                        eq(schema.appointments.clinicId, dto.clinicId),
                        eq(schema.appointments.appointmentDate, dto.appointmentDate),
                        eq(schema.appointments.appointmentTime, dto.appointmentTime),
                        inArray(schema.appointments.status, activeStatuses)
                    )
                )
                .limit(1);

            if (conflictingAppointment.length > 0) {
                throw new ConflictException('This time slot is already booked, please choose another time.');
            }

            const existingAppointmentsCount = await tx.select({ value: count() })
                .from(schema.appointments)
                .where(
                    and(
                        eq(schema.appointments.doctorId, dto.doctorId),
                        eq(schema.appointments.appointmentDate, dto.appointmentDate)
                    )
                );

            const nextQueueNumber = (existingAppointmentsCount[0]?.value || 0) + 1;

            const hour = parseInt(reqTime.split(':')[0], 10);
            const periodType = hour < 12 ? 'morning' : 'evening';

            const [newAppointment] = await tx.insert(schema.appointments).values({
                patientId: dto.patientId,
                doctorId: dto.doctorId,
                clinicId: dto.clinicId,
                availabilityId: availability[0].availabilityId,
                appointmentDate: dto.appointmentDate,
                appointmentTime: dto.appointmentTime,
                periodType: periodType,
                queueNumber: nextQueueNumber,
                status: 'PENDING',
                notes: dto.notes || null,
                paymentReference: dto.paymentReference || null,
                paymentAttachment: dto.paymentAttachment || null,
                isPaymentVerified: false,
            }).returning();

            await tx.insert(schema.notifications).values([
                {
                    userId: doctor[0].userId,
                    title: '🗓️ طلب حجز جديد وثابت القيود',
                    message: `المريض طلب حجزاً مع تطبيق سياسة حماية السقف، رقم الدور الحالي (${nextQueueNumber})`,
                    isRead: false,
                }
            ]);

            return {
                message: clinicPolicy.requiresPrepayment 
                    ? 'Appointment requested successfully, please wait for secretary confirmation.' 
                    : 'Appointment booked successfully.',
                data: newAppointment
            };
        });
    }

    async getPatientAppointments(patientId: number) {
        // التحقق أولاً من وجود المريض
        const patientExists = await this.db.select()
            .from(schema.patients)
            .where(eq(schema.patients.patientId, patientId))
            .limit(1);

        if (patientExists.length === 0) {
            throw new NotFoundException('Requested patient not found in the system');
        }

        // جلب الحجوزات مع تفاصيل العيادة، الطبيب، وتجميع تخصصاته من الجدول الوسيط
        const data = await this.db.select({
            appointmentId: schema.appointments.appointmentId,
            appointmentDate: schema.appointments.appointmentDate,
            appointmentTime: schema.appointments.appointmentTime,
            periodType: schema.appointments.periodType,
            queueNumber: schema.appointments.queueNumber,
            status: schema.appointments.status,
            notes: schema.appointments.notes,
            createdAt: schema.appointments.createdAt,
            // بيانات العيادة
            clinic: {
                clinicId: schema.clinics.clinicId,
                name: schema.clinics.name,
                location: schema.clinics.location,
                city: schema.clinics.city,
                price: schema.clinics.price,
                clinicImage: schema.clinics.clinicImage
            },
            // بيانات الطبيب وتخصصاته المجمعة
            doctor: {
                doctorId: schema.doctors.doctorId,
                fullName: schema.doctors.fullName,
                phone: schema.doctors.phone,
                bio: schema.doctors.bio,
                yearsOfExperience: schema.doctors.yearsOfExperience,
                // 🌟 دمج التخصصات في مصفوفة JSON باستخدام Postgres aggregation لكي لا يتكرر الحجز
                specializations: sql<string[]>`COALESCE(
          json_agg(
            json_build_object(
              'id', ${schema.specializations.specializationId},
              'name', ${schema.specializations.name}
            )
          ) FILTER (WHERE ${schema.specializations.specializationId} IS NOT NULL), 
          '[]'::json
        )`
            }
        })
            .from(schema.appointments)
            .leftJoin(schema.clinics, eq(schema.appointments.clinicId, schema.clinics.clinicId))
            .leftJoin(schema.doctors, eq(schema.appointments.doctorId, schema.doctors.doctorId))
            // الربط بجدول الوسيط للأطباء والتخصصات (Many to Many)
            .leftJoin(schema.doctorsToSpecializations, eq(schema.doctors.doctorId, schema.doctorsToSpecializations.doctorId))
            .leftJoin(schema.specializations, eq(schema.doctorsToSpecializations.specializationId, schema.specializations.specializationId))
            .where(eq(schema.appointments.patientId, patientId))
            // تجميع البيانات حول الحقول الأساسية للحجز والطبيب والعيادة لضمان سلامة الـ GROUP BY
            .groupBy(
                schema.appointments.appointmentId,
                schema.clinics.clinicId,
                schema.doctors.doctorId
            )
            .orderBy(desc(schema.appointments.appointmentDate), desc(schema.appointments.appointmentTime));

        return {
            message: 'Patient appointments retrieved successfully',
            data: data
        };
    }

    /**
     * 🩺 2. جلب قائمة حجوزات طبيب معين مع بيانات المريض الكاملة
     * المسار: GET /appointments/doctor/:doctorId
     */
    async getDoctorAppointments(doctorId: number) {
        // التحقق من وجود الطبيب أولاً
        const doctorExists = await this.db.select()
            .from(schema.doctors)
            .where(eq(schema.doctors.doctorId, doctorId))
            .limit(1);

        if (doctorExists.length === 0) {
            throw new NotFoundException('Requested doctor not found in the system');
        }

        // جلب حجوزات الطبيب مع بيانات المريض المعني لكل حجز
        const data = await this.db.select({
            appointmentId: schema.appointments.appointmentId,
            appointmentDate: schema.appointments.appointmentDate,
            appointmentTime: schema.appointments.appointmentTime,
            periodType: schema.appointments.periodType,
            queueNumber: schema.appointments.queueNumber,
            status: schema.appointments.status,
            notes: schema.appointments.notes,
            createdAt: schema.appointments.createdAt,
            // بيانات المريض الذي قام بالحجز
            patient: {
                patientId: schema.patients.patientId,
                fullName: schema.patients.fullName,
                phone: schema.patients.phone,
                gender: schema.patients.gender,
                birthDate: schema.patients.birthDate
            }
        })
            .from(schema.appointments)
            .leftJoin(schema.patients, eq(schema.appointments.patientId, schema.patients.patientId))
            .where(eq(schema.appointments.doctorId, doctorId))
            .orderBy(desc(schema.appointments.appointmentDate), schema.appointments.appointmentTime);

        return {
            message: 'Doctor appointments retrieved successfully',
            data: data
        };
    }

    async updateAppointmentStatus(appointmentId: number, newStatus: UpdateAppointmentStatusDto) {
        return await this.db.transaction(async (tx) => {

            // 1️⃣ جلب الحجز الحالي للتأكد من وجوده ومعرفة حالته السابقة وبيانات المريض
            const appointment = await tx.select({
                appointmentId: schema.appointments.appointmentId,
                status: schema.appointments.status,
                appointmentDate: schema.appointments.appointmentDate,
                appointmentTime: schema.appointments.appointmentTime,
                patientId: schema.appointments.patientId,
                doctorId: schema.appointments.doctorId,
            })
                .from(schema.appointments)
                .where(eq(schema.appointments.appointmentId, appointmentId))
                .limit(1);

            if (appointment.length === 0) {
                throw new NotFoundException('Requested appointment not found in the system');
            }

            const currentStatus = appointment[0].status;

            // 2️⃣ 🛡️ [حماية منطق العمل]: منع التلاعب بالحجوزات المنتهية
            // إذا كان الحجز ملغياً أو مكتملاً أو سجل غياب بالفعل، فلا يجوز تعديله مجدداً
            if (currentStatus === AppointmentStatus.CANCELLED || currentStatus === AppointmentStatus.COMPLETED || currentStatus === AppointmentStatus.NO_SHOW) {
                throw new BadRequestException(`Cannot update status because the appointment is already closed with status (${currentStatus})`);
            }

            // 3️⃣ التحديث الفعلي للحالة في قاعدة البيانات
            const [updatedAppointment] = await tx.update(schema.appointments)
                .set({ status: newStatus.status })
                .where(eq(schema.appointments.appointmentId, appointmentId))
                .returning();

            const patientId = appointment[0].patientId;
            if (patientId === null) {
                throw new BadRequestException('Cannot send notification because patient ID is not available for this appointment');
            }

            const patientUser = await tx.select({ userId: schema.patients.userId })
                .from(schema.patients)
                .where(eq(schema.patients.patientId, patientId))
                .limit(1);

            if (patientUser.length > 0 && patientUser[0].userId) {
                let title = '🔄 Update in your appointment';
                let message = `The status of your appointment on ${appointment[0].appointmentDate} was changed to ${newStatus.status}`;

                if (newStatus.status === AppointmentStatus.CONFIRMED) {
                    title = '✅ Appointment Confirmed!';
                    message = `Hello, your appointment has been confirmed successfully for ${appointment[0].appointmentDate} at ${appointment[0].appointmentTime}. Please attend on time.`;
                } else if (newStatus.status === AppointmentStatus.CANCELLED) {
                    title = '❌ Appointment Cancelled';
                    message = `We apologize, your appointment scheduled on ${appointment[0].appointmentDate} has been cancelled. You can reschedule for a later time.`;
                } else if (newStatus.status === AppointmentStatus.COMPLETED) {
                    title = '🩺 Wishing you a speedy recovery';
                    message = `Your visit to the doctor has been completed successfully. Thank you for trusting Dori platform!`;
                }

                // إدخال الإشعار في جدول الإشعارات (Notifications Table) الخاص بك
                await tx.insert(schema.notifications).values({
                    userId: patientUser[0].userId,
                    title: title,
                    message: message,
                    type: 'APPOINTMENT_UPDATE',
                    isRead: false,
                });
            }

            const roomName = `patient_room_${patientId}`;
            this.socketGateway.emitToRoom(roomName, 'appointment_status_changed', {
                appointmentId: updatedAppointment.appointmentId,
                status: updatedAppointment.status,
            });

            return {
                message: `Appointment status updated successfully from (${currentStatus}) to (${newStatus.status}).`,
                data: updatedAppointment,
            };
        });
    }

    async getAppointmentById(appointmentId: number) {
        const appointment = await this.db.select({
            appointmentId: schema.appointments.appointmentId,
            appointmentDate: schema.appointments.appointmentDate,
            appointmentTime: schema.appointments.appointmentTime,
            periodType: schema.appointments.periodType,
            queueNumber: schema.appointments.queueNumber,
            status: schema.appointments.status,
            notes: schema.appointments.notes,
            createdAt: schema.appointments.createdAt,
            doctor: {
                doctorId: schema.doctors.doctorId,
                fullName: schema.doctors.fullName
            },
            clinic: {
                clinicId: schema.clinics.clinicId,
                name: schema.clinics.name,
                location: schema.clinics.location
            }
        })
            .from(schema.appointments)
            .leftJoin(schema.doctors, eq(schema.appointments.doctorId, schema.doctors.doctorId))
            .leftJoin(schema.clinics, eq(schema.appointments.clinicId, schema.clinics.clinicId))
            .where(eq(schema.appointments.appointmentId, appointmentId))
            .limit(1);

        if (appointment.length === 0) {
            throw new NotFoundException('Requested appointment not found');
        }

        return { message: 'Appointment retrieved successfully', data: appointment[0] };
    }

    /**
     * 🏥 2. جلب جميع حجوزات عيادة معينة (لوحة تحكم السكرتارية / Staff)
     */
    async getClinicAppointments(clinicId: number) {
        const data = await this.db.select()
            .from(schema.appointments)
            .where(eq(schema.appointments.clinicId, clinicId))
            .orderBy(desc(schema.appointments.appointmentDate));

        return { message: 'Clinic appointments retrieved successfully', data: data };
    }
}