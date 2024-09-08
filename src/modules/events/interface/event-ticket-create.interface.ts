import { TicketCount } from '../../tickets/interface/ticket-count';

export interface EventTicketCreate {
  event: {
    id: string;
    name: string;
    description: string;
    date: Date;
    placeId: string;
    createdAt: Date;
    updatedAt: Date;
  };
  tickets: TicketCount;
}
