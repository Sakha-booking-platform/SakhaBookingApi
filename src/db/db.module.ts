import { Module } from '@nestjs/common';
import { db } from './index';

@Module({
  providers: [
    {
      provide: 'DRIZZLE',
      useValue: db,
    },
  ],
  exports: ['DRIZZLE'],
})
export class DbModule {}
