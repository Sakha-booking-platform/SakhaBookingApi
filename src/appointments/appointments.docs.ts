import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateAppointmentDto } from './dtos/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dtos/update-appointment-status.dto';

// ─────────────────────────────────────────────────────────────
// POST /appointments — Book a new appointment
// ─────────────────────────────────────────────────────────────
export function DocCreateAppointment() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Book a new appointment',
      description: `
Creates a new appointment after passing a series of business-rule checks:
- Verifies the doctor exists and is **ACTIVE**.
- Verifies the clinic exists.
- Checks for emergency clinic closures (doctor exceptions) on the requested date.
- Enforces a maximum of **3 active appointments** (PENDING or CONFIRMED) per patient globally.
- Enforces a maximum of **3 active appointments** per patient per clinic.
- Validates the requested time falls within the doctor's working hours for that day of the week.
- Detects and rejects **double-booking** (same doctor, clinic, date and time).
- Automatically assigns a **queue number** based on existing bookings for that doctor on that date.
- If the clinic requires **prepayment**, the \`paymentReference\` field becomes mandatory.
- Sends an in-app notification to the doctor upon successful booking.
      `,
    }),
    ApiBody({ type: CreateAppointmentDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Appointment successfully booked.',
      schema: {
        example: {
          success: true,
          message: 'Appointment booked successfully. Please arrive at the clinic on time.',
          data: {
            appointmentId: 42,
            patientId: 1,
            doctorId: 3,
            clinicId: 2,
            availabilityId: 7,
            appointmentDate: '2026-08-20',
            appointmentTime: '10:30:00',
            periodType: 'morning',
            queueNumber: 5,
            status: 'PENDING',
            notes: 'I have an allergy to penicillin',
            paymentReference: null,
            paymentAttachment: null,
            isPaymentVerified: false,
            createdAt: '2026-07-15T17:00:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad Request — one of the business-rule validations failed.',
      schema: {
        example: {
          message: "This time slot is outside the doctor's working hours (08:00:00 - 14:00:00)",
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not Found — the specified doctor or clinic does not exist.',
      schema: {
        example: {
          message: 'Doctor not found',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Conflict — the requested time slot is already booked.',
      schema: {
        example: {
          message: 'This time slot is already taken. Please choose a different time.',
          error: 'Conflict',
          statusCode: 409,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// GET /appointments/patient/:patientId — Get patient appointments
// ─────────────────────────────────────────────────────────────
export function DocGetPatientAppointments() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: "Get all appointments for a specific patient",
      description: `
Retrieves the complete appointment history for a patient, sorted by date (newest first).
Each appointment includes full **clinic** details (name, location, city, price, image) and
**doctor** details with an aggregated array of their **specializations**.
      `,
    }),
    ApiParam({
      name: 'patientId',
      type: Number,
      description: 'The unique numeric ID of the patient',
      example: 1,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "Patient's appointment list retrieved successfully.",
      schema: {
        example: {
          success: true,
          message: 'Patient appointment history retrieved successfully',
          count: 2,
          data: [
            {
              appointmentId: 42,
              appointmentDate: '2026-08-20',
              appointmentTime: '10:30:00',
              periodType: 'morning',
              queueNumber: 5,
              status: 'CONFIRMED',
              notes: 'I have an allergy to penicillin',
              createdAt: '2026-07-15T17:00:00.000Z',
              clinic: {
                clinicId: 2,
                name: 'Al-Noor Medical Center',
                location: 'King Fahd Street',
                city: 'Riyadh',
                price: '150.00',
                clinicImage: 'https://cdn.example.com/clinics/al-noor.jpg',
              },
              doctor: {
                doctorId: 3,
                fullName: 'Dr. Ahmed Al-Farsi',
                phone: '+966501234567',
                bio: 'Specialist in internal medicine with 12 years of experience.',
                yearsOfExperience: 12,
                specializations: [
                  { id: 1, name: 'Internal Medicine' },
                  { id: 4, name: 'Cardiology' },
                ],
              },
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not Found — the specified patient does not exist.',
      schema: {
        example: {
          message: 'Patient not found in the system',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// GET /appointments/doctor/:doctorId — Get doctor appointments
// ─────────────────────────────────────────────────────────────
export function DocGetDoctorAppointments() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: "Get all appointments for a specific doctor",
      description: `
Retrieves the full appointment schedule for a doctor, sorted by date (newest first).
Each appointment includes the **patient's** basic information (name, phone, gender, birth date).
Intended for use by the doctor or clinic staff dashboard.
      `,
    }),
    ApiParam({
      name: 'doctorId',
      type: Number,
      description: 'The unique numeric ID of the doctor',
      example: 3,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "Doctor's appointment schedule retrieved successfully.",
      schema: {
        example: {
          success: true,
          message: 'Doctor appointment schedule retrieved successfully',
          count: 3,
          data: [
            {
              appointmentId: 42,
              appointmentDate: '2026-08-20',
              appointmentTime: '10:30:00',
              periodType: 'morning',
              queueNumber: 5,
              status: 'PENDING',
              notes: null,
              createdAt: '2026-07-15T17:00:00.000Z',
              patient: {
                patientId: 1,
                fullName: 'Mohammed Al-Zahrani',
                phone: '+966509876543',
                gender: 'MALE',
                birthDate: '1990-05-15',
              },
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not Found — the specified doctor does not exist.',
      schema: {
        example: {
          message: 'Doctor not found in the system',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// PATCH /appointments/:id/status — Update appointment status
// ─────────────────────────────────────────────────────────────
export function DocUpdateAppointmentStatus() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update the status of an appointment',
      description: `
Updates the status of an existing appointment. Enforces strict business rules:
- **Cannot** modify an appointment already in a closed state (\`CANCELLED\`, \`COMPLETED\`, or \`NO_SHOW\`).
- On success, sends an **in-app notification** to the patient with a status-specific message.
- Broadcasts a real-time \`appointment_status_changed\` event via **WebSocket** to the patient's room (\`patient_room_{patientId}\`).

**Allowed values for \`status\`:** \`PENDING\` | \`CONFIRMED\` | \`CANCELLED\` | \`COMPLETED\` | \`NO_SHOW\`
      `,
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'The unique numeric ID of the appointment to update',
      example: 42,
    }),
    ApiBody({ type: UpdateAppointmentStatusDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Status updated successfully. Patient notified via in-app notification and WebSocket.',
      schema: {
        example: {
          success: true,
          message: 'Appointment status updated from (PENDING) to (CONFIRMED). Patient has been notified in real-time.',
          data: {
            appointmentId: 42,
            patientId: 1,
            doctorId: 3,
            clinicId: 2,
            availabilityId: 7,
            appointmentDate: '2026-08-20',
            appointmentTime: '10:30:00',
            periodType: 'morning',
            queueNumber: 5,
            status: 'CONFIRMED',
            notes: null,
            paymentReference: null,
            paymentAttachment: null,
            isPaymentVerified: false,
            createdAt: '2026-07-15T17:00:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad Request — attempting to modify a closed appointment.',
      schema: {
        example: {
          message: 'Cannot modify this appointment because it is already closed with status (CANCELLED)',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not Found — the specified appointment does not exist.',
      schema: {
        example: {
          message: 'Appointment not found in the system',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// GET /appointments/:id — Get single appointment by ID
// ─────────────────────────────────────────────────────────────
export function DocGetAppointmentById() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get a single appointment by ID',
      description:
        'Retrieves the full details of one specific appointment, including the associated doctor (name) and clinic (name, location).',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'The unique numeric ID of the appointment',
      example: 42,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Appointment details retrieved successfully.',
      schema: {
        example: {
          success: true,
          data: {
            appointmentId: 42,
            appointmentDate: '2026-08-20',
            appointmentTime: '10:30:00',
            periodType: 'morning',
            queueNumber: 5,
            status: 'CONFIRMED',
            notes: 'I have an allergy to penicillin',
            createdAt: '2026-07-15T17:00:00.000Z',
            doctor: {
              doctorId: 3,
              fullName: 'Dr. Ahmed Al-Farsi',
            },
            clinic: {
              clinicId: 2,
              name: 'Al-Noor Medical Center',
              location: 'King Fahd Street',
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not Found — the specified appointment does not exist.',
      schema: {
        example: {
          message: 'Appointment not found',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// GET /appointments/clinic/:clinicId — Get clinic appointments (Staff)
// ─────────────────────────────────────────────────────────────
export function DocGetClinicAppointments() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get all appointments for a clinic (Staff / Reception dashboard)',
      description: `
Retrieves all appointments associated with a specific clinic, sorted by date (newest first).
Returns raw appointment records. Intended for **clinic staff and receptionists**.
      `,
    }),
    ApiParam({
      name: 'clinicId',
      type: Number,
      description: 'The unique numeric ID of the clinic',
      example: 2,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "Clinic's full appointment list retrieved successfully.",
      schema: {
        example: {
          success: true,
          count: 10,
          data: [
            {
              appointmentId: 42,
              patientId: 1,
              doctorId: 3,
              clinicId: 2,
              availabilityId: 7,
              appointmentDate: '2026-08-20',
              appointmentTime: '10:30:00',
              periodType: 'morning',
              queueNumber: 5,
              status: 'PENDING',
              notes: null,
              paymentReference: null,
              paymentAttachment: null,
              isPaymentVerified: false,
              createdAt: '2026-07-15T17:00:00.000Z',
            },
          ],
        },
      },
    }),
  );
}
