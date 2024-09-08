import { Body, Controller, Get, Post } from '@nestjs/common';
import { EventsService } from '../service/events.service';
import { Roles } from '../../../common/decorator/roles.decorator';
import { CreateEventDto } from '../dto/create-event-dto';
import { EventTicketCreate } from '../interface/event-ticket-create.interface';
import { FindEventsByPlaceDto } from '../dto/find-events-by-place.dto';
import { Public } from '../../../common/decorator/public.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(['SELLER'])
  async create(
    @Body() createEventDto: CreateEventDto,
  ): Promise<EventTicketCreate> {
    return await this.eventsService.create(createEventDto);
  }

  @Public()
  @Get()
  async findEventsByPlace(
    @Body() findEventsDto: FindEventsByPlaceDto,
  ): Promise<any> {
    return await this.eventsService.findEventsByPlace(findEventsDto);
  }
}
