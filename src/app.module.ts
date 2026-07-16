import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ClinicsModule } from './clinics/clinics.module';

import { AppController } from './app.controller';
import { ProfilesModule } from './profiles/profiles.module';
import { AvailabilityModule } from './availability/availability.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SocketModule } from './socket/socket.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
     AuthModule,
     UsersModule, 
     ProfilesModule, 
     ClinicsModule, 
     AvailabilityModule, 
     AppointmentsModule, 
     NotificationsModule, 
     NotificationsModule, 
     ReviewsModule, 
     ReviewsModule,
     SocketModule,
     UploadModule,
     UploadModule
    ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
// trigger recompile
