import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';

export function CreateUserSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Create User', 
      description: 'Creates a new user account with the provided email.' 
    }),
    ApiResponse({ 
      status: 201, 
      description: 'User created successfully.',
      schema: {
        example: {
          message: 'User created successfully',
          data: {
            userId: 1,
            email: 'user@example.com',
            role: 'PATIENT',
            createdAt: '2026-05-22T10:00:00.000Z'
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
          message: 'email must be a valid email',
          error: 'BadRequestException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function GetUserByIdSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get User By ID', 
      description: 'Retrieves a specific user by their unique ID.' 
    }),
    ApiParam({ name: 'id', description: 'User ID', type: 'number' }),
    ApiResponse({ 
      status: 200, 
      description: 'User found successfully.',
      schema: {
        example: {
          message: 'User found successfully',
          data: {
            userId: 1,
            email: 'user@example.com',
            role: 'PATIENT',
            createdAt: '2026-05-22T10:00:00.000Z'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Invalid ID format.',
      schema: {
        example: {
          success: false,
          statusCode: 400,
          message: 'ID must be a valid number',
          error: 'BadRequestException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'User not found.',
      schema: {
        example: {
          success: false,
          statusCode: 404,
          message: 'User with ID 999 not found',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function GetUserByEmailSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Search User By Email', 
      description: 'Retrieves a user account by their email address.' 
    }),
    ApiQuery({ name: 'email', description: 'User email address', type: 'string' }),
    ApiResponse({ 
      status: 200, 
      description: 'User found successfully.',
      schema: {
        example: {
          message: 'User found successfully',
          data: {
            userId: 1,
            email: 'user@example.com',
            role: 'PATIENT',
            createdAt: '2026-05-22T10:00:00.000Z'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Missing email parameter.',
      schema: {
        example: {
          success: false,
          statusCode: 400,
          message: 'Email is required for search',
          error: 'BadRequestException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'User not found.',
      schema: {
        example: {
          success: false,
          statusCode: 404,
          message: 'User with email non-existent@example.com not found',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function UpsertProfileSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Upsert Patient Profile', 
      description: 'Creates or updates the profile details for the currently authenticated patient.' 
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Profile created or updated successfully.',
      schema: {
        example: {
          message: 'Patient profile updated successfully',
          data: {
            patientId: 1,
            userId: 1,
            fullName: 'John Doe',
            phone: '+1234567890',
            birthDate: '1990-01-01',
            gender: 'MALE',
            address: '123 Main St'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized.',
      schema: {
        example: {
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
          error: 'UnauthorizedException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function GetAllUsersSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Get All Users (Admin)', 
      description: 'Retrieves a list of all users along with their associated role details (doctor, patient, staff). Restricted to Admin role.' 
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Users retrieved successfully.',
      schema: {
        example: {
          message: 'Users retrieved successfully',
          data: [
            {
              id: 1,
              email: 'admin@example.com',
              role: 'ADMIN',
              createdAt: '2026-05-01T10:00:00.000Z',
              doctorDetails: null,
              patientDetails: null,
              staffDetails: null
            },
            {
              id: 2,
              email: 'patient@example.com',
              role: 'PATIENT',
              createdAt: '2026-05-02T10:00:00.000Z',
              doctorDetails: null,
              patientDetails: {
                fullName: 'John Doe',
                phone: '+1234567890'
              },
              staffDetails: null
            }
          ]
        }
      }
    }),
    ApiResponse({ 
      status: 403, 
      description: 'Forbidden - Insufficient role.',
      schema: {
        example: {
          success: false,
          statusCode: 403,
          message: 'Forbidden resource',
          error: 'ForbiddenException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}
