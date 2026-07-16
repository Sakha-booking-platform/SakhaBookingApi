import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

// ─────────────────────────────────────────────────────────────
// GET /notifications/user/:userId
// ─────────────────────────────────────────────────────────────
export function DocGetUserNotifications() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: "Get all notifications for a specific user",
      description: `
Retrieves all notifications for a user, sorted by **newest first**.

Also returns \`unreadCount\` — the number of unread notifications — which should be used
to display the **red badge** counter on the notification bell icon in the app.
      `,
    }),
    ApiParam({
      name: 'userId',
      type: Number,
      description: 'The unique numeric ID of the user',
      example: 5,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Notifications retrieved successfully.',
      schema: {
        example: {
          success: true,
          message: 'تم جلب الإشعارات بنجاح',
          unreadCount: 2,
          data: [
            {
              notificationId: 10,
              userId: 5,
              title: '✅ تم تأكيد موعدك!',
              message: 'مرحباً، تم تأكيد حجزك بنجاح ليوم 2026-08-20 الساعة 10:30:00. يرجى الحضور في الموعد.',
              type: 'APPOINTMENT_UPDATE',
              isRead: false,
              createdAt: '2026-07-15T18:00:00.000Z',
            },
            {
              notificationId: 9,
              userId: 5,
              title: '🗓️ طلب حجز جديد',
              message: 'تم استقبال طلب الحجز بنجاح، رقم الدور (5)',
              type: null,
              isRead: true,
              createdAt: '2026-07-15T17:30:00.000Z',
            },
          ],
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// PATCH /notifications/:id/read
// ─────────────────────────────────────────────────────────────
export function DocMarkAsRead() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Mark a single notification as read',
      description: 'Sets \`isRead = true\` for a specific notification by its ID. Returns the updated notification record.',
    }),
    ApiParam({
      name: 'id',
      type: Number,
      description: 'The unique numeric ID of the notification',
      example: 10,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Notification marked as read successfully.',
      schema: {
        example: {
          success: true,
          message: 'تم تحديث حالة الإشعار إلى مقروء بنجاح',
          data: {
            notificationId: 10,
            userId: 5,
            title: '✅ تم تأكيد موعدك!',
            message: 'مرحباً، تم تأكيد حجزك بنجاح ليوم 2026-08-20 الساعة 10:30:00.',
            type: 'APPOINTMENT_UPDATE',
            isRead: true,
            createdAt: '2026-07-15T18:00:00.000Z',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Not Found — the specified notification does not exist.',
      schema: {
        example: {
          message: 'الإشعار المطلوب غير موجود',
          error: 'Not Found',
          statusCode: 404,
        },
      },
    }),
  );
}

// ─────────────────────────────────────────────────────────────
// PATCH /notifications/user/:userId/read-all
// ─────────────────────────────────────────────────────────────
export function DocMarkAllAsRead() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: "Mark all notifications for a user as read",
      description: `
Sets \`isRead = true\` for **all** notifications belonging to the specified user in a single query.
Use this when the user opens the notifications screen to clear the badge count.
      `,
    }),
    ApiParam({
      name: 'userId',
      type: Number,
      description: 'The unique numeric ID of the user',
      example: 5,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'All notifications marked as read successfully.',
      schema: {
        example: {
          success: true,
          message: 'تم تحويل جميع الإشعارات إلى مقروءة بنجاح',
        },
      },
    }),
  );
}
