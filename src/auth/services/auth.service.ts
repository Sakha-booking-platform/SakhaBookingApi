import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db/index';
import { TokenService } from './token.service';
import { EmailService } from './email.service';
import { authTokens, refreshTokens, users } from '../../db/schema';
import { VerifyTokenDto } from '../dto/verify-token.dto';
import { RequestLoginDto } from '../dto/request-login.dto';
import { UsersService } from 'src/users/services/user.service';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
        private readonly tokenService: TokenService,
        private readonly emailService: EmailService,
    ) { }

    async requestLogin(dto: RequestLoginDto) {
        const email = dto.email.toLowerCase();
        const rawToken = this.tokenService.generateToken();
        const hashedToken = this.tokenService.hashToken(rawToken);

        await db.insert(authTokens).values({
            email,
            tokenHash: hashedToken,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            used: false,
        });

        await this.emailService.sendMagicLink(email, rawToken);

        return { message: 'Login link sent' };
    }

    async verifyToken(dto: VerifyTokenDto) {
        const hashedToken = this.tokenService.hashToken(dto.token);

        const tokenRecord = await db.query.authTokens.findFirst({
            where: and(
                eq(authTokens.tokenHash, hashedToken),
                eq(authTokens.used, false),
            ),
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('Invalid token');
        }

      const nowInUtc = new Date().getTime();
        const expiresAtUtc = new Date(tokenRecord.expiresAt).getTime();

        if (expiresAtUtc < nowInUtc) {
            throw new UnauthorizedException('انتهت صلاحية رابط التحقق هذا');
        }

        await db
            .update(authTokens)
            .set({ used: true })
            .where(eq(authTokens.id, tokenRecord.id));


        let user = await db.query.users.findFirst({
            where: eq(users.email, tokenRecord.email),
        });

        if (!user) {
            user = await this.usersService.create({
                email: tokenRecord.email,
            });
        }

        return this.generateTokens(Number(user.userId), user.email);
    }

    async generateTokens(userId: number, email: string) {
        const accessToken = this.jwtService.sign(
            { id: userId, email },
            { expiresIn: 15 * 24 * 60 * 60 } // 15 days in seconds
        );

        const rawRefreshToken = this.tokenService.generateToken();
        const refreshHash = this.tokenService.hashToken(rawRefreshToken);

        await db.insert(refreshTokens).values({
            userId,
            tokenHash: refreshHash,
            revoked: false,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        return {
            accessToken,
            refreshToken: rawRefreshToken,
        };
    }

    async refresh(dto: RefreshTokenDto) {
        const hashed = this.tokenService.hashToken(dto.refreshToken);

        const token = await db.query.refreshTokens.findFirst({
            where: and(
                eq(refreshTokens.tokenHash, hashed),
                eq(refreshTokens.revoked, false),
            ),
        });

        if (!token) {
            throw new UnauthorizedException();
        }

        return this.generateTokens(token.userId, '');
    }

    async logout(userId: string) {
        await db
            .update(refreshTokens)
            .set({ revoked: true })
            .where(eq(refreshTokens.userId, Number(userId)));

        return { success: true };
    }
    async getCurrentUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
}