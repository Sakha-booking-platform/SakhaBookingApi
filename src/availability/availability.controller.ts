import { Controller, Get, Post, Body, UseGuards, Param, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AvailabilityService } from './availability.service';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(AuthGuard)
  async setMyAvailability(@CurrentUser() user: any, @Body() dto: SetAvailabilityDto) {
    return this.availabilityService.setAvailability(user.id, dto); 
  }

  @Get('doctor/:doctorId')
  async getDoctorAvailability(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.availabilityService.getDoctorAvailability(doctorId);
  }
}  