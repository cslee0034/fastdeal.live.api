import { Injectable } from '@nestjs/common';
import { ReservationsRepository } from '../repository/reservations.repository';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly reservationsRepository: ReservationsRepository,
  ) {}
}
