import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateReviewDto } from './dtos/create_review.dto';

// ─────────────────────────────────────────────────────────────
// POST /reviews — Submit a new review
// ─────────────────────────────────────────────────────────────
export function DocCreateReview() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Submit a review for a completed appointment',
      description: `
Allows a patient to submit a **star rating and optional comment** for a doctor after a completed visit.

**Business rules enforced:**
- The \`appointmentId\` must exist and belong to the provided \`patientId\`.
- The appointment status must be \`COMPLETED\` — reviews on pending or cancelled appointments are rejected.
- **One review per appointment** — submitting a second review for the same appointment is rejected with \`409 Conflict\`.
      `,
    }),
    ApiBody({ type: CreateReviewDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Review submitted successfully.',
      schema: {
        example: {
          success: true,
          message: 'تم تسجيل تقييمك بنجاح، شكراً لك!',
          data: {
            reviewId: 7,
            patientId: 1,
            appointmentId: 42,
            rating: 5,
            comment: 'Very professional and knowledgeable doctor. Highly recommended!',
            createdAt: '2026-07-15T21:00:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad Request — the appointment has not been completed yet.',
      schema: {
        example: {
          message: 'لا يمكن تقييم الطبيب إلا بعد إتمام الزيارة وكتابة الحجز كـ COMPLETED',
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not Found — the appointment does not exist or does not belong to this patient.',
      schema: {
        example: {
          message: 'الحجز المطلوب غير موجود أو لا ينتمي لهذا المريض',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: 'Conflict — a review for this appointment has already been submitted.',
      schema: {
        example: {
          message: 'لقد قمت بوضع تقييم لهذا الحجز مسبقاً، لا يمكن تكرار التقييم لنفس الزيارة',
          error: 'Conflict',
          statusCode: 409,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// GET /reviews/doctor/:doctorId — Get doctor reviews
// ─────────────────────────────────────────────────────────────
export function DocGetDoctorReviews() {
  return applyDecorators(
    ApiOperation({
      summary: "Get all reviews for a specific doctor",
      description: `
Retrieves all reviews submitted for a doctor, sorted by **newest first**.

In addition to the list, the response includes:
- \`averageRating\`: the calculated average star rating rounded to **1 decimal place** (e.g. \`4.8\`).
- \`totalReviews\`: the total count of reviews received.
- Each review includes the **patient's name** for display on the doctor's public profile.
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
      description: "Doctor's reviews retrieved successfully.",
      schema: {
        example: {
          success: true,
          message: 'تم جلب تقييمات الطبيب بنجاح',
          doctorId: 3,
          averageRating: 4.8,
          totalReviews: 15,
          data: [
            {
              reviewId: 7,
              rating: 5,
              comment: 'Very professional and knowledgeable doctor. Highly recommended!',
              createdAt: '2026-07-15T21:00:00.000Z',
              patient: {
                patientId: 1,
                fullName: 'Mohammed Al-Zahrani',
              },
            },
            {
              reviewId: 6,
              rating: 4,
              comment: 'Good doctor, slightly long waiting time.',
              createdAt: '2026-07-10T14:30:00.000Z',
              patient: {
                patientId: 2,
                fullName: 'Fatima Al-Shehri',
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
          message: 'الطبيب المطلوب غير موجود في النظام',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// DELETE /reviews/:id — Delete a review
// ─────────────────────────────────────────────────────────────
export function DocDeleteReview() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Delete a review by ID',
      description: `
Permanently deletes a review from the system. Intended for **admin or moderation** use.

The review must exist — attempting to delete a non-existent or already-deleted review returns \`404\`.
      `,
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'The unique numeric ID of the review to delete',
      example: 7,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Review deleted successfully.',
      schema: {
        example: {
          success: true,
          message: 'تم حذف التقييم بنجاح وإزالته من سجلات الطبيب',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not Found — the specified review does not exist or was already deleted.',
      schema: {
        example: {
          message: 'التقييم المطلوب غير موجود في النظام أو تم حذفه مسبقاً',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
  );
}
