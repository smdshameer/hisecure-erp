import { Module } from '@nestjs/common';
import { ServiceTicketsService } from './service-tickets.service';
import { ServiceTicketsController } from './service-tickets.controller';

@Module({
  controllers: [ServiceTicketsController],
  providers: [ServiceTicketsService],
})
export class ServiceTicketsModule {}
