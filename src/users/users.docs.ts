import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create_user.dyo';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';

// ─────────────────────────────────────────────────────────────
// POST /users — Create a new user (Base account)
// ─────────────────────────────────────────────────────────────
export function DocCreateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new user account (Base)',
      description: `
Creates a new base user account in the system with just an email address.
Typically called internally or during a sign-up process before setting up a specific profile (like Patient or Doctor).
      `,
    }),
    ApiBody({ type: CreateUserDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'User created successfully.',
      schema: {
        example: {
          userId: 10,
          email: 'user@example.com',
          role: 'PATIENT',
          createdAt: '2026-07-15T21:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad Request — invalid email format.',
      schema: {
        example: {
          message: ['صيغة البريد الإلكتروني غير صحيحة'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// GET /users/:id — Get user by ID
// ─────────────────────────────────────────────────────────────
export function DocGetUserById() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a user by their numeric ID',
      description: 'Retrieves the base user account details using their unique ID.',
    }),
    ApiParam({
      name: 'id',
      type: String,
      description: 'The unique numeric ID of the user',
      example: '10',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User retrieved successfully.',
      schema: {
        example: {
          userId: 10,
          email: 'user@example.com',
          role: 'PATIENT',
          createdAt: '2026-07-15T21:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not Found — the specified user does not exist.',
      schema: {
        example: {
          message: 'المستخدم ذو الرقم 99 غير موجود',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad Request — the ID is not a valid number.',
      schema: {
        example: {
          message: 'المعرف (ID) يجب أن يكون رقماً صالحاً',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// GET /users/search/email — Search user by email
// ─────────────────────────────────────────────────────────────
export function DocGetUserByEmail() {
  return applyDecorators(
    ApiOperation({
      summary: 'Search for a user by their email address',
      description: 'Retrieves the base user account details matching the provided email address.',
    }),
    ApiQuery({
      name: 'email',
      type: String,
      description: 'The email address to search for',
      example: 'user@example.com',
      required: true,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User retrieved successfully.',
      schema: {
        example: {
          userId: 10,
          email: 'user@example.com',
          role: 'PATIENT',
          createdAt: '2026-07-15T21:00:00.000Z',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not Found — no user with this email exists.',
      schema: {
        example: {
          message: 'المستخدم ذو البريد user@example.com غير موجود',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad Request — email query parameter is missing.',
      schema: {
        example: {
          message: 'البريد الإلكتروني مطلوب للبحث',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// POST /users/profile — Upsert Patient Profile
// ─────────────────────────────────────────────────────────────
export function DocUpsertPatientProfile() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create or update the authenticated patient profile',
      description: `
Creates a new patient profile linked to the authenticated user, or updates the existing one.
Returns the newly created or updated patient record.

> **Requires:** \`Authorization: Bearer <token>\`
      `,
    }),
    ApiBody({ type: CreatePatientProfileDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Patient profile created or updated successfully.',
      schema: {
        example: {
          message: 'Patient profile updated',
          patient: {
            patientId: 1,
            userId: 10,
            fullName: 'Ali Al-Hajri',
            phone: '+966501122334',
            birthDate: '1985-11-20',
            gender: 'MALE',
            address: 'Jeddah, Al-Safa District',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized — missing or invalid JWT token.',
      schema: {
        example: { message: 'Unauthorized', statusCode: 401 },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// GET /users/admin/all-users — Get all users (Admin only)
// ─────────────────────────────────────────────────────────────
export function DocGetAllUsersForAdmin() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get all users with their associated profiles — Admin only',
      description: `
Retrieves a comprehensive list of all users in the platform along with their associated profiles (Doctor, Patient, or Staff).

**Protected endpoint — requires \`ADMIN\` role.**
      `,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of all users retrieved successfully.',
      schema: {
        example: [
          {
            id: 1,
            email: 'admin@sakha.com',
            role: 'ADMIN',
            createdAt: '2026-01-01T10:00:00.000Z',
            doctorDetails: null,
            patientDetails: null,
            staffDetails: null,
          },
          {
            id: 2,
            email: 'doctor@sakha.com',
            role: 'DOCTOR',
            createdAt: '2026-02-01T10:00:00.000Z',
            doctorDetails: {
              fullName: 'Dr. Ahmed Al-Farsi',
              phone: '+966501234567',
              status: 'ACTIVE',
            },
            patientDetails: null,
            staffDetails: null,
          },
          {
            id: 3,
            email: 'patient@example.com',
            role: 'PATIENT',
            createdAt: '2026-03-01T10:00:00.000Z',
            doctorDetails: null,
            patientDetails: {
              fullName: 'Ali Al-Hajri',
              phone: '+966501122334',
            },
            staffDetails: null,
          },
          {
            id: 4,
            email: 'staff@sakha.com',
            role: 'STAFF',
            createdAt: '2026-04-01T10:00:00.000Z',
            doctorDetails: null,
            patientDetails: null,
            staffDetails: {
              fullName: 'Sara Al-Otaibi',
              position: 'Receptionist',
            },
          },
        ],
      },
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'Forbidden — the authenticated user does not have ADMIN role.',
      schema: {
        example: {
          message: 'Forbidden resource',
          error: 'Forbidden',
          statusCode: 403,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized — missing or invalid JWT token.',
      schema: {
        example: { message: 'Unauthorized', statusCode: 401 },
      },
    }),
  );
}
