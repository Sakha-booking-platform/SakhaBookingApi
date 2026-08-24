import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
// ⚠️ تأكد من وجود كلمة export وأن الاسم مطابق تماماً بالحروف الكبيرة والصغيرة
export class FlattenDoctorProfileInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (!data || !data.doctorsToSpecializations) {
          return data;
        }

        // تسطيح التخصصات
        const specializations = data.doctorsToSpecializations
          ?.map((item: any) => item.specialization)
          .filter(Boolean) || [];

        const { doctorsToSpecializations, ...doctorData } = data;

        return {
          ...doctorData,
          specializations,
        };
      }),
    );
  }
}