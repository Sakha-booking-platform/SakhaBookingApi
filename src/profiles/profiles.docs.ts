import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';
import { UpdateStaffProfileDto } from './dto/update-staff-profile.dto';

// ══════════════════════════════════════════════════════════════
// DOCTOR PROFILE — GET /doctors/profile
// ══════════════════════════════════════════════════════════════
export function DocGetDoctorProfile() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: "Get the authenticated doctor's profile",
      description: `
Retrieves the full profile of the currently authenticated doctor, resolved from the **JWT token**.

The response is processed by the \`FlattenDoctorProfileInterceptor\`, which transforms the nested
\`doctorsToSpecializations\` relation into a clean flat \`specializations\` array.
      `,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "Doctor's profile retrieved successfully.",
      schema: {
        example: {
          doctorId: 3,
          userId: 10,
          fullName: 'Dr. Ahmed Al-Farsi',
          clinicId: 2,
          phone: '+966501234567',
          bio: 'Specialist in internal medicine with 12 years of experience.',
          yearsOfExperience: 12,
          status: 'ACTIVE',
          specializations: [
            { specializationId: 1, name: 'Internal Medicine' },
            { specializationId: 4, name: 'Cardiology' },
          ],
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not Found — no doctor profile is linked to the authenticated user.',
      schema: {
        example: {
          message: 'Doctor profile not found',
          error: 'Not Found',
          statusCode: 404,
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

// ══════════════════════════════════════════════════════════════
// DOCTOR PROFILE — PUT /doctors/profile
// ══════════════════════════════════════════════════════════════
export function DocUpdateDoctorProfile() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: "Create or update the authenticated doctor's profile",
      description: `
Creates the doctor's profile if it does not yet exist, or fully updates it if it does (**upsert**).

**Specializations behavior:**
- If \`specializationIds\` is provided, **all existing specializations are deleted** and replaced with the new list in a single transaction.
- If \`specializationIds\` is omitted, existing specializations remain unchanged.

> **Requires:** \`Authorization: Bearer <token>\` with a valid doctor account.
      `,
    }),
    ApiBody({ type: UpdateDoctorProfileDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "Doctor's profile created or updated successfully. Returns the updated doctor record.",
      schema: {
        example: {
          doctorId: 3,
          userId: 10,
          fullName: 'Dr. Ahmed Al-Farsi',
          clinicId: 2,
          phone: '+966501234567',
          bio: 'Specialist in internal medicine with 12 years of experience.',
          yearsOfExperience: 12,
          status: 'ACTIVE',
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

// ══════════════════════════════════════════════════════════════
// PATIENT PROFILE — GET /patients/profile
// ══════════════════════════════════════════════════════════════
export function DocGetPatientProfile() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: "Get the authenticated patient's profile",
      description: `
Retrieves the full profile of the currently authenticated patient, resolved from the **JWT token**.
      `,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "Patient's profile retrieved successfully.",
      schema: {
        example: {
          patientId: 1,
          userId: 5,
          fullName: 'Mohammed Al-Zahrani',
          phone: '+966509876543',
          gender: 'male',
          birthDate: '1990-05-15',
          address: 'King Abdullah Road, Riyadh',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not Found — no patient profile is linked to the authenticated user.',
      schema: {
        example: {
          message: 'Patient profile not found',
          error: 'Not Found',
          statusCode: 404,
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

// ══════════════════════════════════════════════════════════════
// PATIENT PROFILE — PUT /patients/profile
// ══════════════════════════════════════════════════════════════
export function DocUpdatePatientProfile() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: "Create or update the authenticated patient's profile",
      description: `
Creates the patient's profile if it does not exist, or updates it if it does (**upsert**).
Returns the resulting patient record directly (the updated or newly created row).

> **Requires:** \`Authorization: Bearer <token>\` with a valid patient account.
      `,
    }),
    ApiBody({ type: UpdatePatientProfileDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "Patient's profile created or updated successfully. Returns the patient record.",
      schema: {
        example: {
          patientId: 1,
          userId: 5,
          fullName: 'Mohammed Al-Zahrani',
          phone: '+966509876543',
          gender: 'male',
          birthDate: '1990-05-15',
          address: 'King Abdullah Road, Riyadh',
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

// ══════════════════════════════════════════════════════════════
// STAFF PROFILE — GET /staff/profile
// ══════════════════════════════════════════════════════════════
export function DocGetStaffProfile() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: "Get the authenticated staff member's profile",
      description: `
Retrieves the full profile of the currently authenticated staff member (receptionist), resolved from the **JWT token**.
      `,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "Staff member's profile retrieved successfully.",
      schema: {
        example: {
          staffId: 1,
          userId: 8,
          fullName: 'Sara Al-Otaibi',
          position: 'Receptionist',
          clinicId: 2,
          phone: '+966507654321',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not Found — no staff profile is linked to the authenticated user.',
      schema: {
        example: {
          message: 'Staff profile not found',
          error: 'Not Found',
          statusCode: 404,
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

// ══════════════════════════════════════════════════════════════
// STAFF PROFILE — PUT /staff/profile
// ══════════════════════════════════════════════════════════════
export function DocUpdateStaffProfile() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: "Create or update the authenticated staff member's profile",
      description: `
Creates the staff member's profile if it does not exist, or updates it if it does (**upsert**).
Returns the resulting staff record directly.

> **Requires:** \`Authorization: Bearer <token>\` with a valid staff account.
      `,
    }),
    ApiBody({ type: UpdateStaffProfileDto }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "Staff member's profile created or updated successfully. Returns the staff record.",
      schema: {
        example: {
          staffId: 1,
          userId: 8,
          fullName: 'Sara Al-Otaibi',
          position: 'Receptionist',
          clinicId: 2,
          phone: '+966507654321',
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
