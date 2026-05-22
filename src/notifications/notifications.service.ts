import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import * as schema from '../db/schema';
import { eq, desc, and } from 'drizzle-orm';

@Injectable()
export class NotificationsService {
  constructor(
    @Inject('DRIZZLE') private readonly db: any
  ) {}

 
  async getUserNotifications(userId: number) {
    const data = await this.db.select()
      .from(schema.notifications)
      .where(eq(schema.notifications.userId, userId))
      .orderBy(desc(schema.notifications.createdAt));

    // حساب عدد الإشعارات غير المقروءة لتظهر شارة (Badge) حمراء في التطبيق
    const unreadCount = data.filter((notif: any) => !notif.isRead).length;

    return {
      message: 'Notifications retrieved successfully',
      data: {
        unreadCount,
        records: data,
      },
    };
  }


  async markAsRead(notificationId: number) {
    // التحقق من وجود الإشعار أولاً
    const exists = await this.db.select()
      .from(schema.notifications)
      .where(eq(schema.notifications.notificationId, notificationId))
      .limit(1);

    if (exists.length === 0) {
      throw new NotFoundException('Requested notification not found');
    }

    // التحديث
    const [updated] = await this.db.update(schema.notifications)
      .set({ isRead: true })
      .where(eq(schema.notifications.notificationId, notificationId))
      .returning();

    return {
      message: 'Notification successfully marked as read',
      data: updated,
    };
  }

 
  async markAllAsRead(userId: number) {
    await this.db.update(schema.notifications)
      .set({ isRead: true })
      .where(eq(schema.notifications.userId, userId));

    return {
      message: 'All notifications successfully marked as read',
      data: null
    };
  }
}