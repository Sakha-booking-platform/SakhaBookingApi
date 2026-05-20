import { Controller, Get, Param, Patch, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // 1. جلب إشعارات مستخدم محدد
  @Get('user/:userId')
  async getUserNotifications(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.getUserNotifications(userId);
  }

  // 2. تحويل إشعار محدد إلى مقروء
  @Patch(':id/read')
  async markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }

  // 3. تحويل كل إشعارات المستخدم إلى مقروءة دفعة واحدة
  @Patch('user/:userId/read-all')
  async markAllAsRead(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }
}