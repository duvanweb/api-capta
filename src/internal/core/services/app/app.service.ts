import { BadRequestException, Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { IHolidayClient } from '../../ports/clients/IHoliday.client';
import { IAppService } from '../../ports/services/iapp.service';
import {
  addWorkingDays,
  addWorkingHours,
  setToPreviousWorkingTime,
} from '../../utils/working-date.utils';
dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class AppService implements IAppService {
  private readonly TZ = 'America/Bogota';

  constructor(private readonly holidayClient: IHolidayClient) {}

  async calculateWorkingDate(params: {
    days: number;
    hours: number;
    date?: string;
  }): Promise<{ date: string }> {
    const { days, hours, date } = params;
    if (days === 0 && hours === 0) {
      throw new BadRequestException('Days and hours cannot both be zero');
    }

    const initialDate = date ? dayjs(date) : dayjs().tz(this.TZ);

    if (!initialDate.isValid()) {
      throw new BadRequestException('Invalid date format');
    }

    const holidays = await this.holidayClient.getHolidays();

    const startDate = setToPreviousWorkingTime(initialDate, holidays);
    let responseDate = startDate;

    if (days > 0) {
      responseDate = addWorkingDays(startDate, days, holidays);
    }

    if (hours > 0) {
      responseDate = addWorkingHours(responseDate, hours, holidays);
    }

    return {
      date: responseDate.tz('UTC').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    };
  }
}
