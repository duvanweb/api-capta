import { Injectable } from '@nestjs/common';
import { IHolidayClient } from '../../core/ports/clients/IHoliday.client';

@Injectable()
export class HolidayCaptaClient implements IHolidayClient {
  async getHolidays(): Promise<string[]> {
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

    return (await response.json()) as string[];
  }
}
