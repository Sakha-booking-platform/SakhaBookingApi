import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateClinicDto } from './dto/create_clinic.dto';
import { CreateSpecializationDto } from './dto/create-specialization.dto';

// ─────────────────────────────────────────────────────────────
// GET /clinics — Get all clinics
// ─────────────────────────────────────────────────────────────
export function DocGetAllClinics() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all clinics (Public)',
      description: `
Returns a lightweight list of all clinics available on the platform.

**Public endpoint — no authentication required.**

Returns only the fields needed for listing views to reduce payload size:
\`id\`, \`name\`, \`address\` (mapped from \`location\`), \`phone\`.
      `,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of all clinics retrieved successfully.',
      schema: {
        example: [
          {
            id: 1,
            name: 'Al-Noor Medical Center',
            address: 'King Fahd Road, Al-Olaya District',
            phone: '+967712345678',
          },
          {
            id: 2,
            name: 'Al-Salam Clinic',
            address: 'Tahrir Square, Downtown',
            phone: '+967798765432',
          },
        ],
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal Server Error — unexpected database failure.',
      schema: {
        example: {
          message: 'حدث خطأ أثناء جلب قائمة العيادات',
          error: 'Internal Server Error',
          statusCode: 500,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// GET /clinics/:id — Get clinic details
// ─────────────────────────────────────────────────────────────
export function DocGetClinicDetails() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get full details of a specific clinic (Public)',
      description: `
Returns the **complete details** of a single clinic, including:
- All clinic fields (name, location, city, phone, description, price, etc.).
- **doctors[]**: list of doctors associated with this clinic (id, fullName, phone, status).
- **staff[]**: list of reception/secretariat staff members (id, fullName, position).

**Public endpoint — no authentication required.**
      `,
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'The unique numeric ID of the clinic',
      example: 1,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Clinic details retrieved successfully.',
      schema: {
        example: {
          clinicId: 1,
          name: 'Al-Noor Medical Center',
          location: 'King Fahd Road, Al-Olaya District',
          city: 'Riyadh',
          phone: '+967712345678',
          description: 'A leading medical center specializing in cardiology and internal medicine since 2005.',
          price: '150.00',
          clinicImage: null,
          requiresPrepayment: false,
          paymentInstructions: null,
          doctors: [
            {
              id: 3,
              fullName: 'Dr. Ahmed Al-Farsi',
              phone: '+966501234567',
              status: 'ACTIVE',
            },
            {
              id: 5,
              fullName: 'Dr. Layla Al-Mansouri',
              phone: '+966509988776',
              status: 'ACTIVE',
            },
          ],
          staff: [
            {
              id: 1,
              fullName: 'Sara Al-Otaibi',
              position: 'Receptionist',
            },
          ],
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not Found — the specified clinic does not exist.',
      schema: {
        example: {
          message: 'العيادة المطلوبة ذات الرقم (99) غير موجودة في النظام',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// GET /clinics/specializations/all — Get all specializations
// ─────────────────────────────────────────────────────────────
export function DocGetAllSpecializations() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all medical specializations (Public)',
      description: `
Returns the full list of all medical specializations registered in the system.

**Public endpoint — no authentication required.**

Used by the frontend to populate filter dropdowns, search screens, and doctor profile forms.
      `,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of all specializations retrieved successfully.',
      schema: {
        example: [
          {
            specializationId: 1,
            name: 'Internal Medicine',
            description: 'Deals with the prevention, diagnosis, and treatment of internal diseases.',
          },
          {
            specializationId: 2,
            name: 'Cardiology',
            description: 'Focuses on disorders of the heart and the cardiovascular system.',
          },
          {
            specializationId: 3,
            name: 'Pediatrics',
            description: null,
          },
        ],
      },
    }),
    ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Internal Server Error — unexpected database failure.',
      schema: {
        example: {
          message: 'حدث خطأ أثناء جلب التخصصات الطبية',
          error: 'Internal Server Error',
          statusCode: 500,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// POST /clinics — Create a new clinic (Admin only)
// ─────────────────────────────────────────────────────────────
export function DocCreateClinic() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a new clinic — Admin only',
      description: `
Registers a new clinic in the system.

**Protected endpoint — requires \`ADMIN\` role.**

- Checks for **duplicate phone number** before inserting. If another clinic already has the same phone, a \`409 Conflict\` is returned.
- Returns the full newly created clinic record on success.
      `,
    }),
    ApiBody({ type: CreateClinicDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Clinic created successfully.',
      schema: {
        example: {
          message: 'تم تسجيل العيادة الطبية الجديدة بنجاح',
          clinic: {
            clinicId: 3,
            name: 'Al-Noor Medical Center',
            location: 'King Fahd Road, Al-Olaya District',
            city: 'Riyadh',
            phone: '+967712345678',
            description: 'A leading medical center specializing in cardiology and internal medicine since 2005.',
            price: null,
            clinicImage: null,
            requiresPrepayment: false,
            paymentInstructions: null,
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Conflict — a clinic with this phone number already exists.',
      schema: {
        example: {
          message: 'رقم الهاتف هذا مسجل بالفعل لعيادة أخرى في النظام',
          error: 'Conflict',
          statusCode: 409,
        },
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

// ─────────────────────────────────────────────────────────────
// POST /clinics/specializations — Create a specialization (Admin only)
// ─────────────────────────────────────────────────────────────
export function DocCreateSpecialization() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Add a new medical specialization — Admin only',
      description: `
Adds a new medical specialization to the system (e.g. Cardiology, Pediatrics, Neurosurgery).

**Protected endpoint — requires \`ADMIN\` role.**

- Checks for **duplicate name** to prevent adding the same specialization twice. Returns \`409 Conflict\` if a match is found.
- Returns the full newly created specialization record on success.
      `,
    }),
    ApiBody({ type: CreateSpecializationDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Specialization created successfully.',
      schema: {
        example: {
          message: 'تم إضافة التخصص الطبي بنجاح',
          specialization: {
            specializationId: 4,
            name: 'Cardiology',
            description: 'Focuses on disorders of the heart and the cardiovascular system.',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Conflict — a specialization with this name already exists.',
      schema: {
        example: {
          message: 'التخصص الطبي "Cardiology" موجود بالفعل في النظام',
          error: 'Conflict',
          statusCode: 409,
        },
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
