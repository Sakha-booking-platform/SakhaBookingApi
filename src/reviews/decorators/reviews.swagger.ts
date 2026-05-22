import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CreateReviewDto } from '../dtos/create_review.dto';

export function CreateReviewSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Submit a Review', 
      description: 'Creates a new review for a completed appointment.' 
    }),
    ApiBody({ type: CreateReviewDto }),
    ApiResponse({ 
      status: 201, 
      description: 'Review submitted successfully.',
      schema: {
        example: {
          message: 'Your review has been submitted successfully. Thank you!',
          data: {
            reviewId: 1,
            patientId: 1,
            appointmentId: 1,
            rating: 5,
            comment: 'Great doctor!'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Appointment is not COMPLETED.',
      schema: {
        example: {
          success: false,
          statusCode: 400,
          message: 'Doctor can only be reviewed after the visit is completed and marked as COMPLETED',
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
          message: 'Requested appointment not found or does not belong to this patient',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    }),
    ApiResponse({ 
      status: 409, 
      description: 'Duplicate review.',
      schema: {
        example: {
          success: false,
          statusCode: 409,
          message: 'You have already submitted a review for this appointment. Duplicate reviews for the same visit are not allowed',
          error: 'ConflictException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function GetDoctorReviewsSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get Doctor Reviews', 
      description: 'Retrieves all reviews and average rating for a specific doctor.' 
    }),
    ApiParam({ name: 'doctorId', description: 'Doctor ID', type: 'number' }),
    ApiResponse({ 
      status: 200, 
      description: 'Doctor reviews retrieved successfully.',
      schema: {
        example: {
          message: 'Doctor reviews retrieved successfully',
          data: {
            doctorId: 1,
            averageRating: 4.8,
            totalReviews: 15,
            records: [
              {
                reviewId: 1,
                rating: 5,
                comment: 'Great doctor!',
                createdAt: '2026-05-22T10:00:00.000Z',
                patient: {
                  patientId: 1,
                  fullName: 'John Doe'
                }
              }
            ]
          }
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

export function DeleteReviewSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Delete Review', 
      description: 'Deletes a review by its ID.' 
    }),
    ApiParam({ name: 'id', description: 'Review ID', type: 'number' }),
    ApiResponse({ 
      status: 200, 
      description: 'Review deleted successfully.',
      schema: {
        example: {
          message: 'Review successfully deleted and removed from the doctor records',
          data: null
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Review not found.',
      schema: {
        example: {
          success: false,
          statusCode: 404,
          message: 'Requested review not found in the system or has already been deleted',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}
