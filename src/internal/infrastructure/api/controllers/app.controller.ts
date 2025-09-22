import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IAppService } from '../../../core/ports/services/iapp.service';
import { WorkingDateDto } from '../dtos/working-date.dto';

@Controller('working-date')
export class WorkingDateController {
  constructor(private readonly appService: IAppService) {}

  @Get()
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  getWorkingDate(@Query() query: WorkingDateDto) {
    return this.appService.calculateWorkingDate({
      days: query.days ?? 0,
      hours: query.hours ?? 0,
      date: query.date,
    });
  }
}
