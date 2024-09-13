import { Injectable } from '@nestjs/common';
import { ReservationsRepository } from '../repository/reservations.repository';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { CreateSeatingDto } from '../dto/create-seating.dto';
import { TicketsService } from '../../tickets/service/tickets.service';
import { ReservationEntity } from '../entities/reservation.entity';
import { MurLock } from 'murlock';
import { CreateStandingDto } from '../dto/create-standing-dto';
import { FailedToCreateReservation } from '../error/failed-to-create-reservation';
import { ObjectWithSuccess } from '../../../common/interface/object-with-success';
import { SECONDS } from '../../../common/constant/milliseconds-to-seconds';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ticketsService: TicketsService,
    private readonly reservationsRepository: ReservationsRepository,
  ) {}

  /**
   * @summary
   * 좌석이 있는 장소 예약 (ticket이 각각 구분되어 있는 경우)
   *
   * @description
   * @MurLock: Redis 분산 락 라이브러리
   * - 5초 동안 'createSeatingDto.ticketId' 키에 대한 락을 건다
   * - 락을 얻지 못한 경우 0.1초마다 재시도한다
   */
  @MurLock(5 * SECONDS, 'createSeatingDto.ticketId')
  async createSeating(
    userId: string,
    createSeatingDto: CreateSeatingDto,
  ): Promise<ObjectWithSuccess> {
    /**
     * @description
     * $transaction: PrismaService의 트랜잭션 메서드
     * - Prisma는 Transaction 데코레이터를 제공하지 않는다
     * - reservation과 ticket을 atomic하게 생성하기 위해 $transaction을 사용한다
     */
    return await this.prisma.$transaction(async (tx: PrismaService) => {
      const result = await this.ticketsService.findTicketByTicketIdTX(
        tx,
        createSeatingDto,
      );

      if (!result?.success) {
        return result;
      }

      const reservation = await this.createSeatingReservationTX({
        tx,
        createSeatingDto,
        userId,
      });

      await this.ticketsService.reserveSeatingTicketTX({
        tx,
        createSeatingDto,
        reservation,
      });

      return result;
    });
  }

  /**
   * @summary
   * 좌석이 없는 장소 예약 (ticket이 구분되어 있지 않은 경우)
   *
   * @description
   * @MurLock: Redis 분산 락 라이브러리
   * - 5초 동안 'createSeatingDto.eventId' 키에 대한 락을 건다
   * - 락을 얻지 못한 경우 0.1초마다 재시도한다
   */
  @MurLock(5 * SECONDS, 'createStandingDto.eventId')
  async createStanding(userId: string, createStandingDto: CreateStandingDto) {
    /**
     * @description
     * $transaction: PrismaService의 트랜잭션 메서드
     * - Prisma는 Transaction 데코레이터를 제공하지 않는다
     * - reservation과 ticket을 atomic하게 생성하기 위해 $transaction을 사용한다
     */
    const result = await this.prisma.$transaction(async (tx: PrismaService) => {
      const reservation = await this.createStandingReservationTX({
        tx,
        createStandingDto,
        userId,
      });

      await this.ticketsService.reserveRandomStandingTicketTX({
        tx,
        createStandingDto,
        reservation,
      });

      return reservation;
    });

    return new ReservationEntity(result);
  }

  private async createSeatingReservationTX({
    tx,
    createSeatingDto,
    userId,
  }: {
    tx: PrismaService;
    createSeatingDto: CreateSeatingDto;
    userId: string;
  }) {
    return await this.reservationsRepository
      .createSeatingReservationTX({
        tx,
        createSeatingDto,
        userId,
      })
      .catch(() => {
        throw new FailedToCreateReservation();
      });
  }

  private async createStandingReservationTX({
    tx,
    createStandingDto,
    userId,
  }: {
    tx: PrismaService;
    createStandingDto: CreateStandingDto;
    userId: string;
  }) {
    return await this.reservationsRepository
      .createStandingReservationTX({
        tx,
        createStandingDto,
        userId,
      })
      .catch(() => {
        throw new FailedToCreateReservation();
      });
  }
}
