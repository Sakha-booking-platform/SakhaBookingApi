import { Controller, Get, Param, Patch, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { DocGetUserNotifications, DocMarkAsRead, DocMarkAllAsRead } from './notifications.docs';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('user/:userId')
  @DocGetUserNotifications()
  async getUserNotifications(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @Patch(':id/read')
  @DocMarkAsRead()
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('user/:userId/read-all')
  @DocMarkAllAsRead()
  async markAllAsRead(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }
}