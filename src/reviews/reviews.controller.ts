import { Controller, Post, Body, Get, Param, Delete, ParseIntPipe, UsePipes, ValidationPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dtos/create_review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createReview(@Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(dto);
  }

  @Get('doctor/:doctorId')
  async getDoctorReviews(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.reviewsService.getDoctorReviews(doctorId);
  }

  @Delete(':id')
  async deleteReview(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.deleteReview(id);
  }
}