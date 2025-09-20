export abstract class IHolidayClient {
  /**
   * Fetches the list of holidays for a given year from the Capta service.
   * @param year The year for which to fetch holidays.
   * @returns A promise that resolves to an array of holiday dates as strings.
   */
  abstract getHolidays(year: number): Promise<string[]>;
}
