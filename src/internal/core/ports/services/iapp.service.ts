export abstract class IAppService {
  /**
   * Returns a greeting message.
   */
  abstract getHello(): string;

  /**
   * Calculates a future or past date based on working days and hours, considering holidays.
   * @param date The starting date.
   * @param days The number of working days to add.
   * @param hours The number of working hours to add.
   * @returns A promise that resolves to the calculated date.
   * @throws BadRequestException if the input date is invalid or if both days and hours are zero.
   */
  abstract calculateWorkingDate(params: {
    days: number;
    hours: number;
    date?: string;
  }): Promise<{ date: string }>;
}
