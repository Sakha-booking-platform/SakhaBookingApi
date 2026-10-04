import { Module, forwardRef } from '@nestjs/common';
import { UsersService } from './services/user.service';
import { UsersController } from './controllers/user.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}