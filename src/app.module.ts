import { Module } from '@nestjs/common';
import { AppController } from './internal/infrastructure/api/controllers/app.controller';
import { AppService } from './internal/core/services/app/app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
