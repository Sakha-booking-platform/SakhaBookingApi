import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UsersService } from 'src/users/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') { // تحديد اسم الاستراتيجية 'jwt' صراحة
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    
    if (!jwtSecret) {
      throw new InternalServerErrorException('خطأ في الخادم: مفتاح التشفير JWT_SECRET غير معرف في ملف البيئة');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, 
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('توكن غير صالحة: محتوى التوكن ناقص');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('غير مصرح لك: المستخدم لم يعد موجوداً في النظام');
    }

    return user; 
  }
}