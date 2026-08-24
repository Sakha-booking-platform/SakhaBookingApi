import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { AuthModule } from 'src/auth/auth.module';
import { SocketModule } from 'src/socket/socket.module';

@Module({
   imports: [
        AuthModule,
        SocketModule
      ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
