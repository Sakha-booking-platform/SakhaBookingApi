import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException 
        ? exception.getResponse() 
        : null;

    // استخراج رسالة الخطأ سواء كانت سلسلة نصية أو مصفوفة من Class Validator
    const message = typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as any).message || (exceptionResponse as any).error
        : (exception as any).message || 'Internal server error';

    response.status(status).json({
      success: false,
      statusCode: status,
      message: Array.isArray(message) ? message[0] : message, // نأخذ أول خطأ من الفلترة لتبسيط العرض في فلاتر
      error: exception instanceof HttpException ? exception.name : 'InternalServerError',
      timestamp: new Date().toISOString(),
    });
  }
}