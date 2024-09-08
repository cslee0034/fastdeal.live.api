import { Controller } from '@nestjs/common';
import { EventsService } from '../service/events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}
}
