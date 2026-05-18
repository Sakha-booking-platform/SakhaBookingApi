import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module'; // 👈 أضفنا استيراد موديول المستخدمين هنا
import { ClinicsService } from './clinics.service';
import { ClinicsController } from './clinics.controller';

@Module({
  imports: [
    AuthModule, 
    UsersModule // 🔥 لتوفير الـ UsersService لأي حارس أو استراتيجية تعمل في هذا النطاق
  ],
  controllers: [ClinicsController],
  providers: [
    ClinicsService 
    // 🧹 قمنا بحذف AuthRollGuard و JwtStrategy من هنا تماماً!
  ]
})
export class ClinicsModule {}