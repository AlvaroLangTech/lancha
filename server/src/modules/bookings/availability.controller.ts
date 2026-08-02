import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { IsDateString, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BookingsService } from './bookings.service';

class AvailabilityQueryDto {
  @IsDateString()
  date: string;
}

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  async get(@Query() query: AvailabilityQueryDto) {
    const dto = plainToInstance(AvailabilityQueryDto, query);
    const errors = validateSync(dto, { whitelist: true });
    if (errors.length) throw new BadRequestException('Informe a data no formato YYYY-MM-DD.');
    return this.bookingsService.getAvailability(dto.date);
  }
}