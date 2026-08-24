import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { and, eq, gt } from 'drizzle-orm';
import { db } from '../../db/index';
import { TokenService } from './token.service';
import { EmailService } from './email.service';
import { authTokens, refreshTokens, users } from '../../db/schema';
import { VerifyTokenDto } from '../dto/verify-token.dto';
import { RequestLoginDto } from '../dto/request-login.dto';
import { UsersService } from 'src/users/services/user.service';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { userRoles } from '../decorators/user_roll.decorator';

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
        console.log("Login request received for email:", email, "with role:", dto.role);
        const role = dto.role
        const rawToken = this.tokenService.generateToken();
        const hashedToken = this.tokenService.hashToken(rawToken);

        await db.insert(authTokens).values({
            email: email,
            tokenHash: hashedToken,
            role: role,
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
        console.log("User found for email:", tokenRecord.email, user);

        if (!user) {
            user = await this.usersService.create({
                email: tokenRecord.email,
            });
        }

        return this.generateTokens(Number(user.userId), user.email, user.role);
    }
    async generateTokens(userId: number, email: string, role: string, dbInstance: any = db) {
        const accessToken = this.jwtService.sign(
            { id: userId, email: email, role: role },
            { expiresIn: '15d' }
        );

        const rawRefreshToken = this.tokenService.generateToken();
        const refreshHash = this.tokenService.hashToken(rawRefreshToken);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        await dbInstance.insert(refreshTokens).values({
            userId,
            tokenHash: refreshHash,
            revoked: false,
            expiresAt: expiresAt,
        });

        return {
            accessToken,
            refreshToken: rawRefreshToken,
        };
    }
    async refresh(dto: RefreshTokenDto) {
        const hashed = this.tokenService.hashToken(dto.refreshToken);

        return await db.transaction(async (tx) => {
            const token = await tx.query.refreshTokens.findFirst({
                where: and(
                    eq(refreshTokens.tokenHash, hashed),
                    eq(refreshTokens.revoked, false),
                    gt(refreshTokens.expiresAt, new Date()),
                ),
            });

            if (!token) {
                throw new UnauthorizedException('Invalid or expired refresh token');
            }

            const user = await tx.query.users.findFirst({
                where: eq(users.userId, token.userId),
            });

            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            await tx
                .update(refreshTokens)
                .set({ revoked: true })
                .where(eq(refreshTokens.id, token.id));

            const tokens = await this.generateTokens(user.userId, user.email, user.role, tx);

            return tokens;
        });
    }

    async logout(userId: string) {
        const result = await db
            .update(refreshTokens)
            .set({ revoked: true })
            .where(
                and(
                    eq(refreshTokens.userId, Number(userId)),
                    eq(refreshTokens.revoked, false)
                )
            )
            .returning();

        if (result.length > 1) {
            console.warn(`Warning: Multiple active sessions revoked for user ID ${userId}.`);
            return { message: 'Logged out from all devices successfully' };
        }

        return { message: 'Logged out successfully' };
    }
    async getCurrentUser(user: any) {

        console.log("Current User Payload:", user);
        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    }

    
}