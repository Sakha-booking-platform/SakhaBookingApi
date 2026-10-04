import { Module } from '@nestjs/common';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationsController } from 'src/notifications/notifications.controller';
import { AuthModule } from 'src/auth/auth.module';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [
    AuthModule,
    DbModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}