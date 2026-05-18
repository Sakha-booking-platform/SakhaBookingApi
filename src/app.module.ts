import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ClinicsModule } from './clinics/clinics.module';

@Module({
  imports: [
      ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule, UsersModule , ClinicsModule , ClinicsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
