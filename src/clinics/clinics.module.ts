import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ClinicsService } from './clinics.service';
import { ClinicsController } from './clinics.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    CacheModule.register(),
  ],
  controllers: [ClinicsController],
  providers: [ClinicsService],
  exports: [ClinicsService],
})
export class ClinicsModule {}