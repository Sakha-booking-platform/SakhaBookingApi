import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateAppointmentDto } from '../dtos/create-appointment.dto';
import { UpdateAppointmentStatusDto } from '../dtos/update-appointment-status.dto';

export function CreateAppointmentSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Book an Appointment', 
      description: 'Creates a new appointment for a patient with a specific doctor at a clinic.' 
    }),
    ApiBody({ type: CreateAppointmentDto }),
    ApiResponse({ 
      status: 201, 
      description: 'Appointment booked successfully.',
      schema: {
        example: {
          message: 'Appointment booked successfully.',
          data: {
            appointmentId: 1,
            patientId: 1,
            doctorId: 2,
            clinicId: 1,
            availabilityId: 1,
            appointmentDate: '2026-05-20',
            appointmentTime: '14:30:00',
            periodType: 'evening',
            queueNumber: 1,
            status: 'PENDING',
            notes: 'Patient has a history of asthma.',
            paymentReference: null,
            paymentAttachment: null,
            isPaymentVerified: false
          }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Validation Error or Business Rule Violation.',
      schema: {
        example: {
          success: false,
          statusCode: 400,
          message: 'Sorry, you have reached the maximum allowed active appointments in the system',
          error: 'BadRequestException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Doctor or Clinic not found.',
      schema: {
        example: {
          success: false,
          statusCode: 404,
          message: 'Doctor not found',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    }),
    ApiResponse({ 
      status: 409, 
      description: 'Time Slot Conflict.',
      schema: {
        example: {
          success: false,
          statusCode: 409,
          message: 'This time slot is already booked, please choose another time.',
          error: 'ConflictException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function GetPatientAppointmentsSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get Patient Appointments', 
      description: 'Retrieves all appointments for a specific patient.' 
    }),
    ApiParam({ name: 'patientId', description: 'Patient ID', type: 'number' }),
    ApiResponse({ 
      status: 200, 
      description: 'Patient appointments retrieved successfully.',
      schema: {
        example: {
          message: 'Patient appointments retrieved successfully',
          data: [
            {
              appointmentId: 1,
              appointmentDate: '2026-05-20',
              appointmentTime: '14:30:00',
              periodType: 'evening',
              queueNumber: 1,
              status: 'PENDING',
              notes: 'Patient has a history of asthma.',
              createdAt: '2026-05-18T10:00:00.000Z',
              clinic: { 
                clinicId: 1,
                name: 'Health Center',
                location: '60th Street',
                city: 'Sanaa',
                price: '5000',
                clinicImage: 'http://localhost:3000/uploads/clinic.jpg'
              },
              doctor: { 
                doctorId: 2,
                fullName: 'Dr. Smith',
                phone: '+967770000000',
                bio: 'Experienced cardiologist',
                yearsOfExperience: 10,
                specializations: [
                  { id: 1, name: 'Cardiology' }
                ]
              }
            }
          ]
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Patient not found.',
      schema: {
        example: {
          success: false,
          statusCode: 404,
          message: 'Requested patient not found in the system',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function GetDoctorAppointmentsSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get Doctor Appointments', 
      description: 'Retrieves all appointments for a specific doctor.' 
    }),
    ApiParam({ name: 'doctorId', description: 'Doctor ID', type: 'number' }),
    ApiResponse({ 
      status: 200, 
      description: 'Doctor appointments retrieved successfully.',
      schema: {
        example: {
          message: 'Doctor appointments retrieved successfully',
          data: [
            {
              appointmentId: 1,
              appointmentDate: '2026-05-20',
              appointmentTime: '14:30:00',
              periodType: 'evening',
              queueNumber: 1,
              status: 'PENDING',
              notes: 'Patient has a history of asthma.',
              createdAt: '2026-05-18T10:00:00.000Z',
              patient: { 
                patientId: 1,
                fullName: 'John Doe', 
                phone: '+967770000000',
                gender: 'male',
                birthDate: '1990-01-01'
              }
            }
          ]
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Doctor not found.',
      schema: {
        example: {
          success: false,
          statusCode: 404,
          message: 'Requested doctor not found in the system',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function UpdateAppointmentStatusSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Update Appointment Status', 
      description: 'Updates the status of an existing appointment (e.g., CONFIRMED, CANCELLED, COMPLETED).' 
    }),
    ApiParam({ name: 'id', description: 'Appointment ID', type: 'number' }),
    ApiBody({ type: UpdateAppointmentStatusDto }),
    ApiResponse({ 
      status: 200, 
      description: 'Appointment status updated successfully.',
      schema: {
        example: {
          message: 'Appointment status updated successfully from (PENDING) to (CONFIRMED).',
          data: {
            appointmentId: 1,
            patientId: 1,
            doctorId: 2,
            clinicId: 1,
            availabilityId: 1,
            appointmentDate: '2026-05-20',
            appointmentTime: '14:30:00',
            periodType: 'evening',
            queueNumber: 1,
            status: 'CONFIRMED',
            notes: 'Patient has a history of asthma.',
            paymentReference: null,
            paymentAttachment: null,
            isPaymentVerified: false,
            createdAt: '2026-05-18T10:00:00.000Z',
            updatedAt: '2026-05-19T10:00:00.000Z'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Status update not allowed.',
      schema: {
        example: {
          success: false,
          statusCode: 400,
          message: 'Cannot update status because the appointment is already closed with status (CANCELLED)',
          error: 'BadRequestException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Appointment not found.',
      schema: {
        example: {
          success: false,
          statusCode: 404,
          message: 'Requested appointment not found in the system',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function GetAppointmentByIdSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get Appointment By ID', 
      description: 'Retrieves details of a specific appointment.' 
    }),
    ApiParam({ name: 'id', description: 'Appointment ID', type: 'number' }),
    ApiResponse({ 
      status: 200, 
      description: 'Appointment retrieved successfully.',
      schema: {
        example: {
          message: 'Appointment retrieved successfully',
          data: {
            appointmentId: 1,
            appointmentDate: '2026-05-20',
            appointmentTime: '14:30:00',
            periodType: 'evening',
            queueNumber: 1,
            status: 'PENDING',
            notes: 'Patient has a history of asthma.',
            createdAt: '2026-05-18T10:00:00.000Z',
            doctor: { 
              doctorId: 2,
              fullName: 'Dr. Smith' 
            },
            clinic: { 
              clinicId: 1,
              name: 'Health Center',
              location: '60th Street'
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Appointment not found.',
      schema: {
        example: {
          success: false,
          statusCode: 404,
          message: 'Requested appointment not found',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function GetClinicAppointmentsSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get Clinic Appointments', 
      description: 'Retrieves all appointments for a specific clinic (usually for receptionist/staff dashboard).' 
    }),
    ApiParam({ name: 'clinicId', description: 'Clinic ID', type: 'number' }),
    ApiResponse({ 
      status: 200, 
      description: 'Clinic appointments retrieved successfully.',
      schema: {
        example: {
          message: 'Clinic appointments retrieved successfully',
          data: [
            {
              appointmentId: 1,
              patientId: 1,
              doctorId: 2,
              clinicId: 1,
              availabilityId: 1,
              appointmentDate: '2026-05-20',
              appointmentTime: '14:30:00',
              periodType: 'evening',
              queueNumber: 1,
              status: 'PENDING',
              notes: 'Patient has a history of asthma.',
              paymentReference: null,
              paymentAttachment: null,
              isPaymentVerified: false,
              createdAt: '2026-05-18T10:00:00.000Z',
              updatedAt: '2026-05-18T10:00:00.000Z'
            }
          ]
        }
      }
    })
  );
}
