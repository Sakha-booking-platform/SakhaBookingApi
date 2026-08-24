// dto/find-user-by-id.dto.ts
import { IsNotEmpty, IsNumberString } from 'class-validator';

export class FindUserByIdDto {
  @IsNotEmpty({ message: 'معرف المستخدم (ID) مطلوب' })
  @IsNumberString({}, { message: 'معرف المستخدم يجب أن يكون عبارة عن رقم صالح' })
  id: String | undefined;
}