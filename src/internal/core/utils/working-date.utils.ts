import {
  END_DAY,
  END_WORK_HOUR,
  LUNCH_END_HOUR,
  LUNCH_START_HOUR,
  START_DAY,
  START_WORK_HOUR,
} from '../const/working-day.const';

import { Dayjs } from 'dayjs';

export function isHoliday(date: Dayjs, holidays: string[]): boolean {
  const ymd = date.format('YYYY-MM-DD');
  return holidays.includes(ymd);
}

export function isWorkingDay(date: Dayjs, holidays: string[]): boolean {
  const day = date.day();
  return day >= START_DAY && day <= END_DAY && !isHoliday(date, holidays);
}

export function setToPreviousWorkingTime(
  date: Dayjs,
  holidays: string[],
): Dayjs {
  let current = date;
  while (!isWorkingDay(current, holidays)) {
    current = current
      .subtract(1, 'day')
      .hour(END_WORK_HOUR)
      .minute(0)
      .second(0)
      .millisecond(0);
  }
  const hour = current.hour();
  if (hour < START_WORK_HOUR) {
    return current.hour(START_WORK_HOUR).minute(0).second(0).millisecond(0);
  }
  if (hour >= END_WORK_HOUR) {
    return current.hour(END_WORK_HOUR).minute(0).second(0).millisecond(0);
  }
  if (hour >= LUNCH_START_HOUR && hour < LUNCH_END_HOUR) {
    return current.hour(LUNCH_START_HOUR).minute(0).second(0).millisecond(0);
  }
  return current;
}

export function addWorkingDays(
  date: Dayjs,
  days: number,
  holidays: string[],
): Dayjs {
  let current = date;
  while (days > 0) {
    current = current.add(1, 'day');
    if (isWorkingDay(current, holidays)) {
      days--;
    }
  }
  return current;
}

export function addWorkingHours(
  date: Dayjs,
  hours: number,
  holidays: string[],
): Dayjs {
  let current = date;
  while (hours > 0) {
    // Si no es día laboral, avanzar al siguiente día laboral a las 8:00
    while (!isWorkingDay(current, holidays)) {
      current = current
        .add(1, 'day')
        .hour(START_WORK_HOUR)
        .minute(0)
        .second(0)
        .millisecond(0);
    }

    // Si está fuera de horario laboral, ajustar a la siguiente hora laboral
    if (current.hour() < START_WORK_HOUR) {
      current = current
        .hour(START_WORK_HOUR)
        .minute(0)
        .second(0)
        .millisecond(0);
    } else if (current.hour() >= END_WORK_HOUR) {
      current = current
        .add(1, 'day')
        .hour(START_WORK_HOUR)
        .minute(0)
        .second(0)
        .millisecond(0);
      continue;
    } else if (
      current.hour() >= LUNCH_START_HOUR &&
      current.hour() < LUNCH_END_HOUR
    ) {
      current = current.hour(LUNCH_END_HOUR).minute(0).second(0).millisecond(0);
    }

    // Calcular horas restantes en el bloque actual
    let endHour = 0;
    if (current.hour() < LUNCH_START_HOUR) {
      endHour = LUNCH_START_HOUR;
    } else if (
      current.hour() >= LUNCH_END_HOUR &&
      current.hour() < END_WORK_HOUR
    ) {
      endHour = END_WORK_HOUR;
    }
    const blockEnd = current.hour(endHour).minute(0).second(0).millisecond(0);
    const diffHours =
      (blockEnd.valueOf() - current.valueOf()) / (1000 * 60 * 60);
    if (hours <= diffHours) {
      current = current.add(hours, 'hour');
      hours = 0;
    } else {
      current = blockEnd;
      // Si termina justo a las 12, saltar a la 1:00 p.m.
      if (current.hour() === LUNCH_START_HOUR) {
        current = current
          .hour(LUNCH_END_HOUR)
          .minute(0)
          .second(0)
          .millisecond(0);
      }
      hours -= diffHours;
    }
  }
  return current;
}
