import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';

@ApiTags('Doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  async getAllDoctors(@Query('page') page: string = '1') {
    const pageNum = parseInt(page, 10) || 1;
    return this.doctorsService.findAllDoctors(pageNum);
  }

  @Get('search')
  async searchDoctors(@Query('query') query: string, @Query('page') page: string = '1') {
    const pageNum = parseInt(page, 10) || 1;
    if (!query) {
      return this.doctorsService.findAllDoctors(pageNum);
    }
    return this.doctorsService.searchDoctors(query, pageNum);
  }
}
