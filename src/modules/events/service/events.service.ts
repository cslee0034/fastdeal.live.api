import { Injectable } from '@nestjs/common';
import { CreateEventDto } from '../dto/create-event-dto';
import { EventsRepository } from '../repository/events.repository';
import { EventEntity } from '../entities/event.entity';
import { FailedToCreateEventError } from '../error/failed-to-create-event';

@Injectable()
export class EventsService {
  constructor(private readonly eventsRepository: EventsRepository) {}

  async create(createEventDto: CreateEventDto): Promise<EventEntity> {
    const event = await this.eventsRepository
      .create(createEventDto)
      .catch(() => {
        throw new FailedToCreateEventError();
      });

    return new EventEntity(event);
  }
}
