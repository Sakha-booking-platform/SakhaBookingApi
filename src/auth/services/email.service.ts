import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey: string;

  constructor(private configService?: ConfigService) {
    // ✅ استخدام optional chaining لتجنب undefined
    this.apiKey = this.configService?.get<string>('RESEND_API_KEY') || '';
    
    if (!this.apiKey) {
      this.logger.warn('⚠️ RESEND_API_KEY غير معرف، سيتم استخدام dummy key للتشغيل');
    }

    this.resend = new Resend(this.apiKey || 'dummy_key');
  }

  async sendMagicLink(email: string, token: string): Promise<void> {
    this.logger.log(`محاولة إرسال رابط تسجيل الدخول إلى: ${email}`);

    // ✅ إذا لم يكن هناك API key، لا ترسل الإيميل
    if (!this.apiKey) {
      this.logger.warn('⚠️ لا يمكن إرسال الإيميل: RESEND_API_KEY غير معرف');
      return; // تخطي الإرسال بدون خطأ
    }

    const appUrl = "http://localhost:3000/auth/verify";
    const magicLink = `${appUrl}?token=${token}`;

    try {
      const response = await this.resend.emails.send({
        from: 'Auth <onboarding@resend.dev>',
        to: email,
        subject: 'Login to your account',
        html: `...`, // نفس المحتوى
      });

      if (response.error) {
        this.logger.error(`فشل إرسال الإيميل: ${response.error.message}`);
        throw new InternalServerErrorException('فشل إرسال بريد التحقق');
      }

      this.logger.log(`تم إرسال الإيميل بنجاح، المعرف: ${response.data?.id}`);

    } catch (error: any) {
      this.logger.error(`خطأ غير متوقع: ${error.message}`);
      throw new InternalServerErrorException('حدث خطأ داخلي');
    }
  }
}