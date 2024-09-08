import { Injectable } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event-dto';
import { EventsRepository } from '../repository/events.repository';
import { EventEntity } from '../entities/event.entity';
import { FailedToCreateEventError } from '../error/failed-to-create-event';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { TicketsRepository } from '../../tickets/repository/tickets.repository';
import { EventTicketCreate } from '../interface/event-ticket-create.interface';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventsRepository: EventsRepository,
    private readonly ticketsRepository: TicketsRepository,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<EventTicketCreate> {
    const result = await this.prisma
      .$transaction(async (tx: PrismaService) => {
        const event = await this.eventsRepository.createEvents(
          tx,
          createEventDto,
        );

        const mappedTicket = await this.mapTicketData(createEventDto, event);

        const tickets = await this.ticketsRepository.createTickets(
          tx,
          mappedTicket,
        );

        return { event, tickets };
      })
      .catch(() => {
        throw new FailedToCreateEventError();
      });

    return result;
  }

  private async mapTicketData(
    createEventDto: CreateEventDto,
    event: EventEntity,
  ) {
    const tickets = [];

    for (let i = 0; i < createEventDto.quantity; i++) {
      const checkInCode = uuidv4();

      /**
       * 좌석의 위치에 따라 가격이 달라질 수 있기 때문에 각각의 티켓에 가격을 부여한다.
       * TODO: 좌석의 위치에 따라 가격이 달라지는 로직을 추가한다.
       */
      tickets.push({
        eventId: event.id,
        price: createEventDto.price,
        seatNumber: i + 1,
        checkInCode: checkInCode,
        image: createEventDto.image,
      });
    }

    return tickets;
  }
}
