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
import { SECONDS } from '../../../common/constant/time/milliseconds-base/milliseconds-to-seconds';
import { QueueService } from '../../../infrastructure/queue/service/queue.service';
import { TicketEntity } from '../../tickets/entities/ticket.entity';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
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
   */
  @MurLock(5 * SECONDS, 'createSeatingDto.ticketId')
  public async createSeating(
    userId: string,
    createSeatingDto: CreateSeatingDto,
  ): Promise<ObjectWithSuccess<TicketEntity>> {
    const ticketing = await this.ticketsService.findTicketByTicketId(
      createSeatingDto.ticketId,
    );

    if (!ticketing.success) {
      return ticketing;
    }

    // queue -> reservation.processor
    await this.queueService.addReservationJob({
      userId,
      createSeatingDto,
    });

    return ticketing;
  }

  /**
   * @summary
   * 좌석이 없는 장소 예약 (ticket이 구분되어 있지 않은 경우)
   *
   * @description
   * @MurLock: Redis 분산 락 라이브러리
   * - 5초 동안 'createSeatingDto.eventId' 키에 대한 락을 건다
   */
  @MurLock(5 * SECONDS, 'createStandingDto.eventId')
  public async createStanding(
    userId: string,
    createStandingDto: CreateStandingDto,
  ) {
    /**
     * @description
     * $transaction: PrismaService의 트랜잭션 메서드
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

  public async createSeatingReservationTX({
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
