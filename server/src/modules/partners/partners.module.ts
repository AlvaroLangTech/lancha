import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from './partner.entity';
import { PartnerVote } from './partner-vote.entity';
import { PartnerPayout } from './partner-payout.entity';
import { Booking } from '../bookings/booking.entity';
import { PartnersService } from './partners.service';
import { PartnersController } from './partners.controller';

@Module({
  // SENIOR: importa Booking aqui também (além de já estar em BookingsModule)
  // só pra ter Repository<Booking> de LEITURA disponível no cálculo de
  // ranking - não escreve em bookings por aqui, quem faz isso continua
  // sendo BookingsService/CheckoutService.
  imports: [TypeOrmModule.forFeature([Partner, PartnerVote, PartnerPayout, Booking])],
  providers: [PartnersService],
  controllers: [PartnersController],
  exports: [PartnersService],
})
export class PartnersModule {}
