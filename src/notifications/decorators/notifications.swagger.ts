import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

export function GetUserNotificationsSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Get User Notifications', 
      description: 'Retrieves all notifications for a specific user, along with the count of unread notifications.' 
    }),
    ApiParam({ name: 'userId', description: 'User ID', type: 'number' }),
    ApiResponse({ 
      status: 200, 
      description: 'Notifications retrieved successfully.',
      schema: {
        example: {
          message: 'Notifications retrieved successfully',
          data: {
            unreadCount: 2,
            records: [
              {
                notificationId: 1,
                userId: 1,
                title: '✅ Appointment Confirmed!',
                message: 'Hello, your appointment has been confirmed successfully.',
                isRead: false,
                createdAt: '2026-05-22T10:00:00.000Z'
              }
            ]
          }
        }
      }
    })
  );
}

export function MarkAsReadSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Mark Notification as Read', 
      description: 'Updates a specific notification status to read.' 
    }),
    ApiParam({ name: 'id', description: 'Notification ID', type: 'number' }),
    ApiResponse({ 
      status: 200, 
      description: 'Notification successfully marked as read.',
      schema: {
        example: {
          message: 'Notification successfully marked as read',
          data: {
            notificationId: 1,
            isRead: true
          }
        }
      }
    }),
    ApiResponse({ 
      status: 404, 
      description: 'Notification not found.',
      schema: {
        example: {
          success: false,
          statusCode: 404,
          message: 'Requested notification not found',
          error: 'NotFoundException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}

export function MarkAllAsReadSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Mark All Notifications as Read', 
      description: 'Updates all notifications for a specific user to read.' 
    }),
    ApiParam({ name: 'userId', description: 'User ID', type: 'number' }),
    ApiResponse({ 
      status: 200, 
      description: 'All notifications successfully marked as read.',
      schema: {
        example: {
          message: 'All notifications successfully marked as read',
          data: null
        }
      }
    })
  );
}
