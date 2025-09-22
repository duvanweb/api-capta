import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { IAppService } from './internal/core/ports/services/iapp.service';
import { AppService } from './internal/core/services/app/app.service';

import { WorkingDateController } from './internal/infrastructure/api/controllers/app.controller';

import { IHolidayClient } from './internal/core/ports/clients/IHoliday.client';
import { HolidayCaptaClient } from './internal/infrastructure/clients/holiday-capta.client';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
  ],
  controllers: [WorkingDateController],
  providers: [
    {
      provide: IAppService,
      useClass: AppService,
    },
    {
      provide: IHolidayClient,
      useClass: HolidayCaptaClient,
    },
  ],
})
export class AppModule {}
