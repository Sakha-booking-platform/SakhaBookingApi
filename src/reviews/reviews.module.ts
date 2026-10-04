import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { AuthModule } from 'src/auth/auth.module';
import { DbModule } from 'src/db/db.module';

@Module({
  imports : [
    AuthModule,
        DbModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
