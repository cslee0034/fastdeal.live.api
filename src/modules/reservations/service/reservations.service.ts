import { Injectable } from '@nestjs/common';
import { ReservationsRepository } from '../repository/reservations.repository';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { CreateSeatingDto } from '../dto/create-seating.dto';
import { TicketsService } from '../../tickets/service/tickets.service';
import { ReservationEntity } from '../entities/reservation.entity';
import { MurLock } from 'murlock';
import { CreateStandingDto } from '../dto/create-standing-dto';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsService: TicketsService,
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  async createSeating(userId: string, createSeatingDto: CreateSeatingDto) {
    // reservation과 ticket을 동시에 생성하기 위해 transaction 사용
    const result = await this.prisma.$transaction(async (tx: PrismaService) => {
      // next key lock을 사용하여 동시성 문제 해결
      await this.ticketsService.findTicketWithLockTx(tx, createSeatingDto);

      // reservation 생성
      const reservation = await this.reservationsRepository.createSeatingTx(
        tx,
        createSeatingDto,
        userId,
      );

      // ticket 생성
      await this.ticketsService.reserveSeatingTx(
        tx,
        createSeatingDto,
        reservation,
      );

      return reservation;
    });

    return new ReservationEntity(result);
  }

  // distributed lock을 사용하여 동시성 문제 해결
  @MurLock(5000, 'createStandingDto.eventId')
  async createStanding(userId: string, createStandingDto: CreateStandingDto) {
    // reservation과 ticket을 동시에 생성하기 위해 transaction 사용
    const result = await this.prisma.$transaction(async (tx: PrismaService) => {
      // reservation 생성
      const reservation = await this.reservationsRepository.createStandingTx(
        tx,
        createStandingDto,
        userId,
      );

      // ticket 생성
      await this.ticketsService.reserveStandingTx(
        tx,
        createStandingDto,
        reservation,
      );

      return reservation;
    });

    return new ReservationEntity(result);
  }
}
