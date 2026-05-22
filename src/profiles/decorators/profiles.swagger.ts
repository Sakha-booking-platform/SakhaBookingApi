import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

export function GetDoctorProfileSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Get Doctor Profile', 
      description: 'Retrieves the profile of the currently authenticated doctor.' 
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Doctor profile retrieved successfully.',
      schema: {
        example: {
          message: 'Doctor profile retrieved successfully',
          data: {
            doctorId: 1,
            userId: 5,
            fullName: 'Dr. John Doe',
            clinicId: 1,
            phone: '+1234567890',
            yearsOfExperience: 10,
            bio: 'Experienced cardiologist.',
            status: 'AVAILABLE'
          }
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
          message: 'Doctor profile not found',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function UpdateDoctorProfileSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Upsert Doctor Profile', 
      description: 'Creates or updates the profile of the currently authenticated doctor.' 
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Doctor profile updated successfully.',
      schema: {
        example: {
          message: 'Doctor profile updated successfully',
          data: {
            doctorId: 1,
            userId: 5,
            fullName: 'Dr. John Doe',
            clinicId: 1,
            phone: '+1234567890',
            yearsOfExperience: 10,
            bio: 'Experienced cardiologist.',
            status: 'AVAILABLE'
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
          message: 'fullName should not be empty',
          error: 'BadRequestException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function GetPatientProfileSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Get Patient Profile', 
      description: 'Retrieves the profile of the currently authenticated patient.' 
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Patient profile retrieved successfully.',
      schema: {
        example: {
          message: 'Patient profile retrieved successfully',
          data: {
            patientId: 1,
            userId: 5,
            fullName: 'Jane Smith',
            phone: '+1987654321',
            gender: 'female',
            birthDate: '1995-05-15',
            address: '123 Main St, Springfield'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Patient profile not found.',
      schema: {
        example: {
          success: false,
          statusCode: 404,
          message: 'Patient profile not found',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function UpdatePatientProfileSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Upsert Patient Profile', 
      description: 'Creates or updates the profile of the currently authenticated patient.' 
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Patient profile updated successfully.',
      schema: {
        example: {
          message: 'Patient profile updated successfully',
          data: {
            patientId: 1,
            userId: 5,
            fullName: 'Jane Smith',
            phone: '+1987654321',
            gender: 'female',
            birthDate: '1995-05-15',
            address: '123 Main St, Springfield'
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
          message: 'fullName should not be empty',
          error: 'BadRequestException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function GetStaffProfileSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Get Staff Profile', 
      description: 'Retrieves the profile of the currently authenticated staff member.' 
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Staff profile retrieved successfully.',
      schema: {
        example: {
          message: 'Staff profile retrieved successfully',
          data: {
            staffId: 1,
            userId: 5,
            fullName: 'Alice Johnson',
            position: 'Receptionist',
            clinicId: 1,
            phone: '+1122334455'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Staff profile not found.',
      schema: {
        example: {
          success: false,
          statusCode: 404,
          message: 'Staff profile not found',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function UpdateStaffProfileSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Upsert Staff Profile', 
      description: 'Creates or updates the profile of the currently authenticated staff member.' 
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Staff profile updated successfully.',
      schema: {
        example: {
          message: 'Staff profile updated successfully',
          data: {
            staffId: 1,
            userId: 5,
            fullName: 'Alice Johnson',
            position: 'Receptionist',
            clinicId: 1,
            phone: '+1122334455'
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
          message: 'fullName should not be empty',
          error: 'BadRequestException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}
