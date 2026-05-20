import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws'; // 👈 1. استيراد الـ Adapter الجديد
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 👈 2. تفعيل الـ WebSockets النقية على مستوى المشروع بالكامل ليتحرر من قيود الـ Prefix
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
  
  await app.listen(3000, '0.0.0.0');
}
bootstrap();