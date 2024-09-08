import { EventEntity } from '../../events/entities/event.entity';

export interface MappedTicket {
  eventId: string;
  price: number;
  seatNumber: number;
  checkInCode: string;
  image: string;
  eventEntity: EventEntity;
}
