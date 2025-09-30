import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { IHolidayClient } from '../../ports/clients/IHoliday.client';
import { AppService } from './app.service';

dayjs.extend(utc);
dayjs.extend(timezone);

describe('AppService - calculateWorkingDate', () => {
  let service: AppService;
  let holidayClient: jest.Mocked<IHolidayClient>;

  beforeEach(async () => {
    const mockHolidayClient = {
      getHolidays: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: IHolidayClient,
          useValue: mockHolidayClient,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    holidayClient = module.get(IHolidayClient);

    // Mock básico sin festivos para casos generales
    holidayClient.getHolidays.mockResolvedValue([]);
  });

  describe('Casos de validación específicos', () => {
    it('Caso 1: Viernes 5:00 PM + 1 hora = Lunes 9:00 AM', async () => {
      // Viernes a las 5:00 PM (hora Colombia) = 22:00 UTC
      const fridayDate = '2025-09-26T22:00:00.000Z'; // Viernes 5:00 PM Colombia

      const result = await service.calculateWorkingDate({
        days: 0,
        hours: 1,
        date: fridayDate,
      });

      // Debe ser lunes a las 9:00 AM Colombia = 14:00 UTC
      expect(result.date).toBe('2025-09-29T14:00:00.000Z');
    });

    it('Caso 2: Sábado 2:00 PM + 1 hora = Lunes 9:00 AM', async () => {
      // Sábado a las 2:00 PM (hora Colombia) = 19:00 UTC
      const saturdayDate = '2025-09-27T19:00:00.000Z'; // Sábado 2:00 PM Colombia

      const result = await service.calculateWorkingDate({
        days: 0,
        hours: 1,
        date: saturdayDate,
      });

      // Debe ser lunes a las 9:00 AM Colombia = 14:00 UTC
      expect(result.date).toBe('2025-09-29T14:00:00.000Z');
    });

    it('Caso 3: Martes 3:00 PM + 1 día + 4 horas = Jueves 10:00 AM', async () => {
      // Martes a las 3:00 PM (hora Colombia) = 20:00 UTC
      const tuesdayDate = '2025-09-30T20:00:00.000Z'; // Martes 3:00 PM Colombia

      const result = await service.calculateWorkingDate({
        days: 1,
        hours: 4,
        date: tuesdayDate,
      });

      // Debe ser jueves a las 10:00 AM Colombia = 15:00 UTC
      expect(result.date).toBe('2025-10-02T15:00:00.000Z');
    });

    it('Caso 4: Domingo 6:00 PM + 1 día = Lunes 5:00 PM', async () => {
      // Domingo a las 6:00 PM (hora Colombia) = 23:00 UTC
      const sundayDate = '2025-09-28T23:00:00.000Z'; // Domingo 6:00 PM Colombia

      const result = await service.calculateWorkingDate({
        days: 1,
        hours: 0,
        date: sundayDate,
      });

      // Debe ser lunes a las 5:00 PM Colombia = 22:00 UTC
      expect(result.date).toBe('2025-09-29T22:00:00.000Z');
    });

    it('Caso 5: Día laboral 8:00 AM + 8 horas = Mismo día 5:00 PM', async () => {
      // Lunes a las 8:00 AM (hora Colombia) = 13:00 UTC
      const mondayDate = '2025-09-29T13:00:00.000Z'; // Lunes 8:00 AM Colombia

      const result = await service.calculateWorkingDate({
        days: 0,
        hours: 8,
        date: mondayDate,
      });

      // Debe ser mismo día a las 5:00 PM Colombia = 22:00 UTC
      expect(result.date).toBe('2025-09-29T22:00:00.000Z');
    });

    it('Caso 6: Día laboral 8:00 AM + 1 día = Siguiente día laboral 8:00 AM', async () => {
      // Lunes a las 8:00 AM (hora Colombia) = 13:00 UTC
      const mondayDate = '2025-09-29T13:00:00.000Z'; // Lunes 8:00 AM Colombia

      const result = await service.calculateWorkingDate({
        days: 1,
        hours: 0,
        date: mondayDate,
      });

      // Debe ser martes a las 8:00 AM Colombia = 13:00 UTC
      expect(result.date).toBe('2025-09-30T13:00:00.000Z');
    });

    it('Caso 7: Día laboral 12:30 PM + 1 día = Siguiente día laboral 12:00 PM', async () => {
      // Lunes a las 12:30 PM (hora Colombia) = 17:30 UTC
      const mondayDate = '2025-09-29T17:30:00.000Z'; // Lunes 12:30 PM Colombia

      const result = await service.calculateWorkingDate({
        days: 1,
        hours: 0,
        date: mondayDate,
      });

      // Según el caso esperado, debe ser 12:00 PM = 17:00 UTC
      expect(result.date).toBe('2025-09-30T17:00:00.000Z');
    });

    it('Caso 8: Día laboral 11:30 AM + 3 horas =  Mismo día 3:30 PM', async () => {
      // Lunes a las 11:30 AM (hora Colombia) = 16:30 UTC (Lunes)
      const mondayDate = '2025-09-29T16:30:00.000Z'; // Lunes 11:30 AM Colombia

      const result = await service.calculateWorkingDate({
        days: 0,
        hours: 3,
        date: mondayDate,
      });

      // Debe empezar desde lunes  11:30 AM y agregar 3 horas = lunes día 3:30 PM
      expect(result.date).toBe('2025-09-29T20:30:00.000Z'); // lunes día 3:30 PM Colombia
    });

    it('Caso 9: Con festivos - 10 abril + 5 días + 4 horas', async () => {
      // Mock festivos para abril 17 y 18
      holidayClient.getHolidays.mockResolvedValue(['2025-04-17', '2025-04-18']);

      // 10 de abril a las 10:00 AM (hora Colombia) = 15:00 UTC
      const aprilDate = '2025-04-10T15:00:00.000Z'; // 10 abril 3:00 PM Colombia

      const result = await service.calculateWorkingDate({
        days: 5,
        hours: 4,
        date: aprilDate,
      });

      // Con festivos 17 y 18 abril, debe llegar al 21 abril + 4 horas desde 10AM = 3PM
      expect(result.date).toBe('2025-04-21T20:00:00.000Z'); // 21 abril 3:00 PM Colombia
    });
  });

  describe('Validaciones de entrada', () => {
    it('Debe lanzar error si days y hours son ambos 0', async () => {
      await expect(
        service.calculateWorkingDate({
          days: 0,
          hours: 0,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Debe lanzar error si la fecha es inválida', async () => {
      await expect(
        service.calculateWorkingDate({
          days: 1,
          hours: 0,
          date: 'fecha-invalida',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Debe usar fecha actual si no se proporciona date', async () => {
      const result = await service.calculateWorkingDate({
        days: 0,
        hours: 1,
      });

      expect(result).toHaveProperty('date');
      expect(typeof result.date).toBe('string');
    });
  });
});
