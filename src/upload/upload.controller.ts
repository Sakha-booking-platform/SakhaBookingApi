import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags } from '@nestjs/swagger';
import { UploadImageSwagger } from './decorators/upload.swagger';

@ApiTags('Uploads')
@Controller('upload')
export class UploadController {
  
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // مكان حفظ الصور في السيرفر
        filename: (req, file, callback) => {
          // توليد اسم فريد للملف لمنع التداخل: timestamp + رقم عشوائي
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        // قبول صور الامتدادات الشهيرة فقط لحماية السيرفر
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return callback(new BadRequestException('Only images of type (png, jpg, jpeg, webp) are allowed!'), false);
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // الحد الأقصى لحجم الصورة: 5 ميجابايت
      },
    }),
  )
  @UploadImageSwagger()
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file was uploaded');
    }

    // إرجاع الرابط المباشر للصورة لكي يحفظه مطور الفلاتر في قاعدة البيانات
    const fileUrl = `http://localhost:3000/uploads/${file.filename}`;
    return {
      message: 'Image uploaded successfully',
      data: {
        url: fileUrl, // 👈 هذا الرابط الذي سيتم إرساله مع الحجز أو بيانات الطبيب
      }
    };
  }
}