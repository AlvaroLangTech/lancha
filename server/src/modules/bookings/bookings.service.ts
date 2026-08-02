import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Booking, BookingStatus } from './booking.entity';

const ACTIVE_HOLD_STATUSES: BookingStatus[] = ['pending_verification', 'awaiting_payment'];

@Injectable()
export class BookingsService {
  constructor(@InjectRepository(Booking) private readonly bookings: Repository<Booking>) {}

  create(data: Partial<Booking>) {
    const booking = this.bookings.create(data);
    return this.bookings.save(booking);
  }

  async findByIdOrFail(id: string): Promise<Booking> {
    const booking = await this.bookings.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Reserva não encontrada.');
    return booking;
  }

  async update(id: string, data: Partial<Booking>) {
    await this.bookings.update(id, data);
    return this.findByIdOrFail(id);
  }

  async setStatus(id: string, status: BookingStatus) {
    return this.update(id, { status });
  }

  findAll() {
    return this.bookings.find({ order: { createdAt: 'DESC' } });
  }

  findByAsaasPaymentId(paymentId: string) {
    return this.bookings.findOne({ where: { asaasPaymentId: paymentId } });
  }

  async findActiveReservationForDate(date: string, ignoreBookingId?: string) {
    const now = new Date();
    const query = this.bookings
      .createQueryBuilder('booking')
      .where('booking.requestedDate = :date', { date })
      .andWhere('booking.status != :canceled', { canceled: 'canceled' })
      .andWhere(
        new Brackets((qb) => {
          qb.where('booking.status = :confirmed', { confirmed: 'confirmed' }).orWhere(
            'booking.status IN (:...holdStatuses) AND booking.holdExpiresAt > :now',
            { holdStatuses: ACTIVE_HOLD_STATUSES, now },
          );
        }),
      );

    if (ignoreBookingId) {
      query.andWhere('booking.id != :ignoreBookingId', { ignoreBookingId });
    }

    return query.orderBy('booking.createdAt', 'ASC').getOne();
  }

  async getAvailability(date: string) {
    const booking = await this.findActiveReservationForDate(date);
    return {
      date,
      available: !booking,
      holdMinutes: 30,
      status: booking?.status ?? null,
      message: booking ? 'Essa data não está disponível no momento.' : 'Data disponível para reserva.',
    };
  }

  async isDateAvailable(date: string, ignoreBookingId?: string) {
    const booking = await this.findActiveReservationForDate(date, ignoreBookingId);
    return !booking;
  }
}