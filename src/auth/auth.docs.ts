import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RequestLoginDto } from './dto/request-login.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

// ─────────────────────────────────────────────────────────────
// POST /auth/login — Request magic login link
// ─────────────────────────────────────────────────────────────
export function DocRequestLogin() {
  return applyDecorators(
    ApiOperation({
      summary: 'Request a magic login link',
      description: `
Initiates a **passwordless (Magic Link)** authentication flow.

Steps:
1. Receives the user's email and optional role.
2. Generates a secure one-time token, hashes it, and stores it in the database with a **30-minute expiry**.
3. Sends an email to the user containing a magic link with the raw token.
4. The user clicks the link and the token is verified via the \`POST /auth/verify\` endpoint.

> **Note:** The role field defaults to \`PATIENT\` if omitted.
      `,
    }),
    ApiBody({ type: RequestLoginDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Magic link sent successfully to the provided email address.',
      schema: {
        example: {
          message: 'Login link sent',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Bad Request — invalid email format or unsupported role value.',
      schema: {
        example: {
          message: ['يرجى إدخال بريد إلكتروني صالح'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// POST /auth/verify — Verify magic link token
// ─────────────────────────────────────────────────────────────
export function DocVerifyToken() {
  return applyDecorators(
    ApiOperation({
      summary: 'Verify magic link token and obtain JWT tokens',
      description: `
Completes the **Magic Link** authentication flow by verifying the one-time token from the email.

Steps:
1. Hashes the received token and looks it up in the database.
2. Validates that the token is **not used** and **not expired** (30-minute window).
3. Marks the token as \`used = true\` to prevent replay attacks.
4. If the user does **not** exist, a new user account is automatically created.
5. Returns a signed **JWT access token** (valid for **15 days**) and a **refresh token** (valid for **7 days**).
      `,
    }),
    ApiBody({ type: VerifyTokenDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Token verified successfully. Returns JWT access and refresh tokens.',
      schema: {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6IlBBVElFTlQiLCJpYXQiOjE3NTI2MDAwMDAsImV4cCI6MTc1NTIwMDAwMH0.signature',
          refreshToken: 'f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized — token is invalid, already used, or expired.',
      schema: {
        example: {
          message: 'انتهت صلاحية رابط التحقق هذا',
          error: 'Unauthorized',
          statusCode: 401,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// POST /auth/refresh — Refresh JWT access token
// ─────────────────────────────────────────────────────────────
export function DocRefreshToken() {
  return applyDecorators(
    ApiOperation({
      summary: 'Refresh the JWT access token using a refresh token',
      description: `
Exchanges a valid **refresh token** for a new pair of **access token** and **refresh token**.

This endpoint uses a **token rotation** strategy for security:
1. Validates the refresh token (not revoked, not expired).
2. Looks up the associated user.
3. **Revokes** the old refresh token immediately.
4. Issues a brand-new access token and refresh token pair.

> **Important:** Store the new refresh token securely after each call, as the old one is invalidated.
      `,
    }),
    ApiBody({ type: RefreshTokenDto }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Token refreshed successfully. Returns a new access token and refresh token.',
      schema: {
        example: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZSI6IlBBVElFTlQiLCJpYXQiOjE3NTI2MDAwMDAsImV4cCI6MTc1NTIwMDAwMH0.new_signature',
          refreshToken: 'NEW_REFRESH_TOKEN_c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5d4c3b2a1f6e5',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized — refresh token is invalid, revoked, or expired.',
      schema: {
        example: {
          message: 'Invalid or expired refresh token',
          error: 'Unauthorized',
          statusCode: 401,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// GET /auth/me — Get current authenticated user
// ─────────────────────────────────────────────────────────────
export function DocGetCurrentUser() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get the currently authenticated user',
      description: `
Returns the identity of the currently authenticated user extracted from the **JWT access token**.

The \`Authorization: Bearer <token>\` header is required.
Returns the user's \`id\`, \`email\`, and \`role\` as decoded from the JWT payload.
      `,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Current user identity retrieved successfully.',
      schema: {
        example: {
          id: 1,
          email: 'user@example.com',
          role: 'PATIENT',
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized — missing or invalid JWT token.',
      schema: {
        example: {
          message: 'Unauthorized',
          statusCode: 401,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// POST /auth/logout — Logout current user
// ─────────────────────────────────────────────────────────────
export function DocLogout() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Logout the current user',
      description: `
Revokes all active refresh tokens for the currently authenticated user, effectively logging them out.

- If the user has **one active session**, it is revoked and a standard logout message is returned.
- If the user has **multiple active sessions** (multiple devices), all sessions are revoked simultaneously.

> The \`Authorization: Bearer <token>\` header is required.
      `,
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'User logged out successfully.',
      schema: {
        examples: {
          single_session: {
            summary: 'Single session logout',
            value: { message: 'Logged out successfully' },
          },
          all_devices: {
            summary: 'All devices logout',
            value: { message: 'Logged out from all devices successfully' },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized — missing or invalid JWT token.',
      schema: {
        example: {
          message: 'Unauthorized',
          statusCode: 401,
        },
      },
    }),
  );
}
