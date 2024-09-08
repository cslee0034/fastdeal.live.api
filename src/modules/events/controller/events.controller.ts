import { Body, Controller, Get, Post } from '@nestjs/common';
import { EventsService } from '../service/events.service';
import { Roles } from '../../../common/decorator/roles.decorator';
import { CreateEventDto } from '../dto/create-event-dto';
import { EventTicketCreate } from '../interface/event-ticket-create.interface';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(['SELLER'])
  async create(
    @Body() createEventDto: CreateEventDto,
  ): Promise<EventTicketCreate> {
    const result = await this.eventsService.create(createEventDto);

    return result;
  }
}
