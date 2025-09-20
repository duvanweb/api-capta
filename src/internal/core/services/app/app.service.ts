import { BadRequestException, Injectable } from '@nestjs/common';
import { IHolidayClient } from '../../ports/clients/IHoliday.client';
import { IAppService } from '../../ports/services/iapp.service';
import {
  addWorkingDays,
  addWorkingHours,
  setToPreviousWorkingTime,
} from '../../utils/working-date.utils';

@Injectable()
export class AppService implements IAppService {
  constructor(private readonly holidayClient: IHolidayClient) {}

  getHello(): string {
    return 'Hello World!';
  }

  async calculateWorkingDate(params: {
    days: number;
    hours: number;
    date?: string;
  }): Promise<Date> {
    const { days, hours, date } = params;
    if (days === 0 && hours === 0) {
      throw new BadRequestException('Days and hours cannot both be zero');
    }

    const initialDate = date ? new Date(date) : new Date();
    if (isNaN(initialDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    const holidays = await this.holidayClient.getHolidays(
      initialDate.getFullYear(),
    );

    const startDate = setToPreviousWorkingTime(initialDate, holidays);
    let responseDate = startDate;

    if (days > 0) {
      responseDate = addWorkingDays(startDate, days, holidays);
    }

    if (hours > 0) {
      responseDate = addWorkingHours(responseDate, hours, holidays);
    }

    return responseDate;
  }
}
