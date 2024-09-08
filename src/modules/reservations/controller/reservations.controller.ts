import { Controller } from '@nestjs/common';
import { ReservationsService } from '../service/reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}
}
