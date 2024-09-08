import { Body, Controller, Post } from '@nestjs/common';
import { EventsService } from '../service/events.service';
import { Roles } from '../../../common/decorator/roles.decorator';
import { CreateEventDto } from '../dto/create-event-dto';
import { EventEntity } from '../entities/event.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(['SELLER'])
  async create(@Body() createEventDto: CreateEventDto): Promise<EventEntity> {
    return await this.eventsService.create(createEventDto);
  }
}
