import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { SetAvailabilityDto } from '../dto/set-availability.dto';
import { CreateEmergencyHolidayDto } from '../dto/create-emergency-holiday.dto';

export function SetMyAvailabilitySwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Set Doctor Availability', 
      description: 'Sets or updates the recurring weekly availability schedule for the authenticated doctor.' 
    }),
    ApiBody({ type: SetAvailabilityDto }),
    ApiResponse({ 
      status: 201, 
      description: 'Availability updated successfully.',
      schema: {
        example: {
          message: 'Availability updated successfully.',
          data: [
            {
              availabilityId: 1,
              doctorId: 1,
              clinicId: 1,
              dayOfWeek: 1,
              startTime: '09:00:00',
              endTime: '14:00:00',
              maxPatients: 20
            }
          ]
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Doctor profile not found.',
      schema: {
        example: {
          success: false,
          statusCode: 404,
          message: 'Doctor profile associated with this account not found.',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function GetDoctorAvailabilitySwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get Doctor Raw Availability', 
      description: 'Retrieves the raw recurring availability rules from the database for a specific doctor.' 
    }),
    ApiParam({ name: 'doctorId', description: 'Doctor ID', type: 'number' }),
    ApiResponse({ 
      status: 200, 
      description: 'Doctor availability retrieved successfully.',
      schema: {
        example: {
          message: 'Doctor availability retrieved successfully',
          data: [
            {
              availabilityId: 1,
              doctorId: 1,
              clinicId: 1,
              dayOfWeek: 1,
              startTime: '09:00:00',
              endTime: '14:00:00',
              maxPatients: 20
            }
          ]
        }
      }
    })
  );
}

export function GetDoctorCalendarSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get Doctor Calendar', 
      description: 'Generates a real-world calendar over a specified number of days, merging regular rules with emergency exceptions.' 
    }),
    ApiParam({ name: 'doctorId', description: 'Doctor ID', type: 'number' }),
    ApiQuery({ name: 'days', description: 'Number of days to generate (default 30)', type: 'number', required: false }),
    ApiResponse({ 
      status: 200, 
      description: 'Doctor calendar retrieved successfully.',
      schema: {
        example: {
          message: 'Doctor calendar retrieved successfully',
          data: [
            {
              date: '2026-05-22',
              dayName: 'الجمعة',
              status: 'available',
              note: 'دوام اعتيادي',
              periods: [
                {
                  availabilityId: 1,
                  clinicId: 1,
                  startTime: '09:00:00',
                  endTime: '14:00:00',
                  periodType: 'morning'
                }
              ]
            }
          ]
        }
      }
    })
  );
}

export function HandleEmergencyHolidaySwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Create Emergency Holiday', 
      description: 'Creates an emergency holiday for a doctor, closes the schedule for that day, and cancels active appointments.' 
    }),
    ApiBody({ type: CreateEmergencyHolidayDto }),
    ApiResponse({ 
      status: 201, 
      description: 'Emergency holiday created and appointments cancelled.',
      schema: {
        example: {
          message: 'Emergency holiday created successfully, existing appointments cancelled, and notifications are being sent.',
          data: {
            cancelledCount: 5
          }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Validation failed.',
      schema: {
        example: {
          success: false,
          statusCode: 400,
          message: 'Specific date is required',
          error: 'BadRequestException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}
