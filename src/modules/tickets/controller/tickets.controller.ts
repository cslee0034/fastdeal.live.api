import { Controller, Get, Param } from '@nestjs/common';
import { TicketsService } from '../service/tickets.service';
import { Public } from '../../../common/decorator/public.decorator';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Public()
  @Get('/event/:eventId')
  async findTicketsByEventId(@Param('eventId') eventId: string) {
    return await this.ticketsService.findTicketsByEventId(eventId);
  }
}
