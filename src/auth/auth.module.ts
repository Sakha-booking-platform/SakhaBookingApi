import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { EmailService } from './services/email.service';
import { TokenService } from './services/token.service';

import { UsersModule } from '../users/users.module';

import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthGuard } from './guards/auth.guard';
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    // استخدم forwardRef هنا أيضاً
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    TokenService,
    JwtStrategy,
    AuthGuard
  ],
  exports: [AuthService, JwtModule, AuthGuard], // تأكد من تصدير الـ AuthGuard
})
export class AuthModule {}