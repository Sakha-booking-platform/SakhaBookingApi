import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  /**
   * Generates a secure, random string to be used as a raw token
   * (e.g., Magic Link token or Refresh Token sent to the client).
   */
  generateToken(): string {
    // Generates 32 random bytes and converts them to a hex string (64 characters)
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hashes a raw token using SHA-256 before storing it in the database.
   * This ensures that if the database is leaked, attackers cannot use the hashes to log in.
   */
  hashToken(token: string): string {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }
}