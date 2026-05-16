import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './controllers/user.controller';
import { UsersService } from './services/user.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    // استخدم forwardRef لحل مشكلة الدوران المنطقي
    forwardRef(() => AuthModule), 
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}