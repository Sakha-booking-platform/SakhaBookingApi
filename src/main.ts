import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws'; // 👈 1. استيراد الـ Adapter الجديد
import { join } from 'path';
import { AllExceptionsFilter } from './auth/utils/interceptor/http-exception.filter';
import { TransformInterceptor } from './auth/utils/interceptor/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // 👈 استيراد الحزمة

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.useWebSocketAdapter(new WsAdapter(app)); 

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Dori Booking System API')
    .setDescription('The core architectural backend API documentation for Dori appointment management platform.')
    .setVersion('1.0')
    .addBearerAuth() // 👈 تفعيل زر قفل الأمان لتوثيق الـ JWT Tokens
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // سيتواجد التوثيق التفاعلي على الرابط: http://localhost:3000/docs
  SwaggerModule.setup('docs', app, document);

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalFilters(new AllExceptionsFilter());
  
  await app.listen(3000, '0.0.0.0'); 
}
bootstrap();