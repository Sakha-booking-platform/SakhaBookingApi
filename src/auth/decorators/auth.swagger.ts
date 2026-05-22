import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

export function RequestLoginSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Request Login OTP', 
      description: 'Sends a One-Time Password (OTP) to the user\'s email address to initiate the login process.' 
    }),
    ApiResponse({ 
      status: 200, 
      description: 'OTP successfully sent to the provided email address.',
      schema: {
        example: {
          message: 'OTP has been sent successfully',
          data: {
            email: 'user@example.com',
            expiresIn: 300
          }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Validation failed (e.g., invalid email format).',
      schema: {
        example: {
          success: false,
          statusCode: 400,
          message: 'email must be a valid email',
          error: 'BadRequestException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    }),
    ApiResponse({ 
      status: 429, 
      description: 'Too Many Requests - Rate limit exceeded.',
      schema: {
        example: {
          success: false,
          statusCode: 429,
          message: 'ThrottlerException: Too Many Requests',
          error: 'ThrottlerException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function VerifyTokenSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Verify OTP & Login', 
      description: 'Verifies the provided OTP. If valid, returns the access and refresh tokens for the authenticated session.' 
    }),
    ApiResponse({ 
      status: 200, 
      description: 'OTP verified successfully. User is logged in.',
      schema: {
        example: {
          message: 'Login successful',
          data: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            user: {
              id: 5,
              email: 'user@example.com',
              role: 'PATIENT'
            }
          }
        }
      }
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Invalid or expired OTP.',
      schema: {
        example: {
          success: false,
          statusCode: 401,
          message: 'Invalid or expired OTP',
          error: 'UnauthorizedException',
          timestamp: '2026-05-22T10:05:00.000Z'
        }
      }
    })
  );
}

export function RefreshTokenSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Refresh Access Token', 
      description: 'Generates a new access token using a valid refresh token.' 
    }),
    ApiResponse({ 
      status: 200, 
      description: 'Access token refreshed successfully.',
      schema: {
        example: {
          message: 'Token refreshed successfully',
          data: {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCIJ5DFJOG43XMCdeNHJec6KHU6IkpXVCJ9...'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Invalid or expired refresh token.',
      schema: {
        example: {
          success: false,
          statusCode: 401,
          message: 'Invalid refresh token',
          error: 'UnauthorizedException',
          timestamp: '2026-05-22T10:10:00.000Z'
        }
      }
    })
  );
}

export function CurrentUserSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Get Current User Profile', 
      description: 'Retrieves the profile information of the currently authenticated user.' 
    }),
    ApiResponse({ 
      status: 200, 
      description: 'User profile retrieved successfully.',
      schema: {
        example: {
          message: 'Profile retrieved successfully',
          data: {
            id: 5,
            email: 'user@example.com',
            role: 'PATIENT',
          }
        }
      }
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Missing or invalid bearer token.',
      schema: {
        example: {
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
          error: 'UnauthorizedException',
          timestamp: '2026-05-22T10:15:00.000Z'
        }
      }
    })
  );
}

export function LogoutSwagger() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ 
      summary: 'Logout User', 
      description: 'Invalidates the current user session and refresh token.' 
    }),
    ApiResponse({ 
      status: 200, 
      description: 'User logged out successfully.',
      schema: {
        example: {
          message: 'Logged out successfully',
          data: null
        }
      }
    }),
    ApiResponse({ 
      status: 401, 
      description: 'Unauthorized - Missing or invalid bearer token.',
      schema: {
        example: {
          success: false,
          statusCode: 401,
          message: 'Unauthorized',
          error: 'UnauthorizedException',
          timestamp: '2026-05-22T10:20:00.000Z'
        }
      }
    })
  );
}
