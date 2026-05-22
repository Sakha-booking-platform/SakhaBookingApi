import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

export function UploadImageSwagger() {
  return applyDecorators(
    ApiOperation({ 
      summary: 'Upload an Image', 
      description: 'Uploads an image file to the server (max 5MB, formats: jpg, jpeg, png, webp).' 
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'The image file to upload',
          },
        },
      },
    }),
    ApiResponse({ 
      status: 201, 
      description: 'Image uploaded successfully.',
      schema: {
        example: {
          message: 'Image uploaded successfully',
          data: {
            url: 'http://localhost:3000/uploads/1234567890-123456789.png'
          }
        }
      }
    }),
    ApiResponse({ 
      status: 400, 
      description: 'Invalid file or file missing.',
      schema: {
        example: {
          success: false,
          statusCode: 400,
          message: 'No file was uploaded',
          error: 'BadRequestException',
          timestamp: '2026-05-22T10:00:00.000Z'
        }
      }
    })
  );
}
