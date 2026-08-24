import { Controller, Get, Post, Body, UseGuards, Param, ParseIntPipe, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AvailabilityService } from './availability.service';
import { SetAvailabilityDto } from './dto/set-availability.dto';
import { CreateEmergencyHolidayDto } from './dto/create-emergency-holiday.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  // 1. للطبيب: لكي يقوم بإدخال أو تحديث مواعيده الدورية (فترة أو فترتين في نفس اليوم)
  @Post()
  @UseGuards(AuthGuard)
  async setMyAvailability(@CurrentUser() user: any, @Body() dto: SetAvailabilityDto) {
    return this.availabilityService.setAvailability(user.id, dto); 
  }

  // 2. للوحة التحكم أو الفحص السريع: تجلب القواعد الثابتة الخام كما هي في الداتا بيز
  @Get('doctor/:doctorId')
  async getDoctorAvailability(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.availabilityService.getDoctorAvailability(doctorId);
  }

  // 🚀 الزيادة الجوهرية (للمريض): تجلب تقويم حقيقي ممتد لـ 30 يوماً بناءً على قواعد الطبيب
  // مثال الاستدعاء: GET /availability/doctor/5/calendar?days=30
  @Get('doctor/:doctorId/calendar')
  async getDoctorCalendar(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Query('days') days?: number
  ) {
    const limitDays = days ? Number(days) : 30; // افتراضياً 30 يوماً إذا لم يرسلها الموبايل
    return this.availabilityService.getDoctorCalendar(doctorId, limitDays);
  }

 @Post('exceptions')
  @HttpCode(HttpStatus.CREATED)
  async handleEmergencyHoliday(@Body() dto: CreateEmergencyHolidayDto) {
    return this.availabilityService.createEmergencyHoliday(dto);
  }
}