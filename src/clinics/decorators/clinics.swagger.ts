import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateClinicDto } from '../dto/create_clinic.dto';
import { CreateSpecializationDto } from '../dto/create-specialization.dto';

export function GetAllClinicsSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get All Clinics', 
      description: 'Retrieves a list of all clinics available in the platform.' 
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Clinics retrieved successfully.',
      schema: {
        example: {
          message: 'Clinics retrieved successfully',
          data: [
            {
              id: 1,
              name: 'Al-Noor Clinic',
              address: '60th Street',
              phone: '+967770000000'
            }
          ]
        }
      }
    })
  );
}

export function GetClinicDetailsSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get Clinic Details', 
      description: 'Retrieves detailed information about a specific clinic, including its doctors and staff.' 
    }),
    ApiParam({ name: 'id', description: 'Clinic ID', type: 'number' }),
    ApiResponse({ 
      status: 200, 
      description: 'Clinic details retrieved successfully.',
      schema: {
        example: {
          message: 'Clinic details retrieved successfully',
          data: {
            clinicId: 1,
            name: 'Al-Noor Clinic',
            location: '60th Street',
            city: 'Sanaa',
            phone: '+967770000000',
            doctors: [
              {
                id: 1,
                fullName: 'Dr. Ahmed',
                phone: '+967770000001',
                status: 'ACTIVE'
              }
            ],
            staff: [
              {
                id: 1,
                fullName: 'Ali',
                position: 'Receptionist'
              }
            ]
          }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Clinic not found.',
      schema: {
        example: {
          success: false,
          statusCode: 404,
          message: 'The requested clinic with ID (1) does not exist in the system',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function GetAllSpecializationsSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get All Specializations', 
      description: 'Retrieves all medical specializations available in the system.' 
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Specializations retrieved successfully.',
      schema: {
        example: {
          message: 'Specializations retrieved successfully',
          data: [
            {
              specializationId: 1,
              name: 'Cardiology',
              description: 'Heart and blood vessels'
            }
          ]
        }
      }
    })
  );
}

export function CreateClinicSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Create Clinic', 
      description: 'Creates a new clinic in the system. Allowed only for Admins.' 
    }),
    ApiBody({ type: CreateClinicDto }),
    ApiResponse({ 
      status: 201, 
      description: 'Clinic created successfully.',
      schema: {
        example: {
          message: 'New medical clinic registered successfully',
          data: [
            {
              clinicId: 1,
              name: 'Al-Noor Clinic',
              location: '60th Street',
              city: 'Sanaa',
              phone: '+967770000000'
            }
          ]
        }
      }
    }),
    ApiResponse({ 
      status: 409, 
      description: 'Phone number conflict.',
      schema: {
        example: {
          success: false,
          statusCode: 409,
          message: 'This phone number is already registered to another clinic in the system',
          error: 'ConflictException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function CreateSpecializationSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Create Specialization', 
      description: 'Adds a new medical specialization to the system. Allowed only for Admins.' 
    }),
    ApiBody({ type: CreateSpecializationDto }),
    ApiResponse({ 
      status: 201, 
      description: 'Specialization created successfully.',
      schema: {
        example: {
          message: 'Medical specialization added successfully',
          data: [
            {
              specializationId: 1,
              name: 'Cardiology',
              description: 'Heart and blood vessels'
            }
          ]
        }
      }
    }),
    ApiResponse({ 
      status: 409, 
      description: 'Specialization name conflict.',
      schema: {
        example: {
          success: false,
          statusCode: 409,
          message: 'The medical specialization "Cardiology" already exists in the system',
          error: 'ConflictException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}
