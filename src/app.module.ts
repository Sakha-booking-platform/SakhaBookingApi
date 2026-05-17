import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';

import { AppController } from './app.controller';

@Module({ 
  imports: [
      ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule, UsersModule , ProfilesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
// trigger recompile
