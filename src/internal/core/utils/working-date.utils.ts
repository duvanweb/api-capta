import {
  END_DAY,
  END_WORK_HOUR,
  LUNCH_END_HOUR,
  LUNCH_START_HOUR,
  START_DAY,
  START_WORK_HOUR,
} from '../const/working-day.const';
export function isHoliday(date: Date, holidays: string[]): boolean {
  const ymd = date.toISOString().slice(0, 10);
  return holidays.includes(ymd);
}

export function isWorkingDay(date: Date, holidays: string[]): boolean {
  const day = date.getDay();
  return day >= START_DAY && day <= END_DAY && !isHoliday(date, holidays);
}

export function setToPreviousWorkingTime(date: Date, holidays: string[]): Date {
  // Si es fin de semana o festivo, retroceder al viernes hábil anterior 17:00
  // Si es día hábil pero fuera de horario, ajustar a 17:00 o 8:00 según corresponda
  const startDate = new Date(date);
  while (!isWorkingDay(startDate, holidays)) {
    startDate.setDate(startDate.getDate() - 1);
    startDate.setHours(END_WORK_HOUR, 0, 0, 0);
  }
  // Horario laboral: 8:00-12:00, 13:00-17:00
  const hour = startDate.getHours();
  if (hour < START_WORK_HOUR) {
    startDate.setHours(START_WORK_HOUR, 0, 0, 0);
    return startDate;
  }
  if (hour >= END_WORK_HOUR) {
    startDate.setHours(END_WORK_HOUR, 0, 0, 0);
    return startDate;
  }
  if (hour >= LUNCH_START_HOUR && hour < LUNCH_END_HOUR) {
    startDate.setHours(LUNCH_START_HOUR, 0, 0, 0);
    return startDate;
  }
  return startDate;
}

export function addWorkingDays(
  date: Date,
  days: number,
  holidays: string[],
): Date {
  const startDate = new Date(date);
  while (days > 0) {
    startDate.setDate(startDate.getDate() + 1);
    if (isWorkingDay(startDate, holidays)) {
      days--;
    }
  }
  return startDate;
}

export function addWorkingHours(
  date: Date,
  hours: number,
  holidays: string[],
): Date {
  const startDate = new Date(date);
  let current = new Date(startDate);
  while (hours > 0) {
    // Si no es día laboral, avanzar al siguiente día laboral a las 8:00
    while (!isWorkingDay(current, holidays)) {
      current.setDate(current.getDate() + 1);
      current.setHours(START_WORK_HOUR, 0, 0, 0);
    }

    // Si está fuera de horario laboral, ajustar a la siguiente hora laboral
    if (current.getHours() < START_WORK_HOUR) {
      current.setHours(START_WORK_HOUR, 0, 0, 0);
    } else if (current.getHours() >= END_WORK_HOUR) {
      // Pasar al siguiente día laboral a las 8:00
      current.setDate(current.getDate() + 1);
      current.setHours(START_WORK_HOUR, 0, 0, 0);
      continue;
    } else if (
      current.getHours() >= LUNCH_START_HOUR &&
      current.getHours() < LUNCH_END_HOUR
    ) {
      // Si está en hora de almuerzo, saltar a la 1:00 p.m.
      current.setHours(LUNCH_END_HOUR, 0, 0, 0);
    }

    // Calcular minutos restantes en el bloque actual
    let endHour = 0;
    if (current.getHours() < LUNCH_START_HOUR) {
      endHour = LUNCH_START_HOUR;
    } else if (
      current.getHours() >= LUNCH_END_HOUR &&
      current.getHours() < END_WORK_HOUR
    ) {
      endHour = END_WORK_HOUR;
    }
    const blockEnd = new Date(current);
    blockEnd.setHours(endHour, 0, 0, 0);
    const diffMs = blockEnd.getTime() - current.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (hours <= diffHours) {
      current.setTime(current.getTime() + hours * 60 * 60 * 1000);
      // Si cae en hora de almuerzo, saltar a la 1:00 p.m.
      if (current.getHours() === LUNCH_START_HOUR) {
        current.setHours(LUNCH_END_HOUR, 0, 0, 0);
      }
      hours = 0;
    } else {
      current = blockEnd;
      // Si termina justo a las 12, saltar a la 1:00 p.m.
      if (current.getHours() === LUNCH_START_HOUR) {
        current.setHours(LUNCH_END_HOUR, 0, 0, 0);
      }
      hours -= diffHours;
    }
  }
  return current;
}
