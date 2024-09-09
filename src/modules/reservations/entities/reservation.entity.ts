import { Reservation } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class ReservationEntity implements Reservation {
  constructor(partial: Partial<ReservationEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Exclude()
  userId: string;

  @Exclude()
  placeId: string;

  @Exclude()
  eventId: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
