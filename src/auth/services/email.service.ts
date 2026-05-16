import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly logger = new Logger(EmailService.name); // استخدام الـ Logger القياسي لـ NestJS

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    
    // احتمال: عدم توفر مفتاح الـ API في البيئة
    if (!apiKey) {
      this.logger.error('RESEND_API_KEY غير معرف في ملف البيئة (.env)');
    }

    this.resend = new Resend(apiKey);
  }

  async sendMagicLink(email: string, token: string): Promise<void> {
    this.logger.log(`محاولة إرسال رابط تسجيل الدخول إلى: ${email}`);

    const appUrl = "http://localhost:3000/auth/verify";
    const magicLink = `${appUrl}?token=${token}`;

    try {
      const response = await this.resend.emails.send({
        // تنبيه: onboarding@resend.dev يرسل فقط لإيميلك المسجل في الموقع
        from: 'Auth <onboarding@resend.dev>', 
        to: email,
        subject: 'Login to your account',
        html: ` 
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px;">
          <h2>Sign in</h2>
          <p>Click the button below to access your account:</p>
          <div style="margin: 20px 0;">
            <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Login to Account
            </a>
          </div>
          <p style="color: #777; font-size: 14px;">This link will expire in 10 minutes.</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="color: #999; font-size: 12px;">If you didn't request this email, you can safely ignore it.</p>
        </div>
        `,
      });

      // التحقق من استجابة Resend لوجود أخطاء داخلية
      if (response.error) {
        this.logger.error(`فشل إرسال الإيميل من قبل سرفر Resend: ${response.error.message}`);
        throw new InternalServerErrorException('فشل إرسال بريد التحقق الإلكتروني');
      }

      this.logger.log(`تم إرسال الإيميل بنجاح، المعرف: ${response.data?.id}`);

    } catch (error) {
      // إمساك أي خطأ شبكة أو خطأ غير متوقع
      this.logger.error(`حدث خطأ غير متوقع أثناء إرسال الإيميل: ${error.message}`);
      throw new InternalServerErrorException('حدث خطأ داخلي أثناء محاولة إرسال البريد الإلكتروني');
    }
  }
}