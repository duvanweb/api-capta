import { Injectable } from '@nestjs/common';
import { IHolidayClient } from '../../core/ports/clients/IHoliday.client';

@Injectable()
export class HolidayCaptaClient implements IHolidayClient {
  async getHolidays(year: number): Promise<string[]> {
    const response = await fetch(
      `${process.env.URL_CLIENT_CAPTA}/Recruitment/WorkingDays.json`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error fetching holidays: ${response.statusText}`);
    }

    const data = (await response.json()) as string[];
    return data.filter((holiday: string) => holiday.includes(year.toString()));
  }
}
