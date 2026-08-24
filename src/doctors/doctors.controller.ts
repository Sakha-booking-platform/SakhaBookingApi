import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { ListDoctorsQueryDto } from './dto/list-doctors-query.dto';
import { SearchDoctorsQueryDto } from './dto/search-doctors-query.dto';

@ApiTags('Home Discovery — Doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

@Get()
@ApiOperation({ summary: 'Doctors' })
@ApiOkResponse()
getDoctors(@Query() query: ListDoctorsQueryDto) {
  return this.doctorsService.findAll(query);
}

  @Get('search')
  @ApiOperation({ summary: 'Doctors search' })
  @ApiOkResponse()
  searchDoctors(@Query() query: SearchDoctorsQueryDto) {
    return this.doctorsService.search(query);
  }
}
