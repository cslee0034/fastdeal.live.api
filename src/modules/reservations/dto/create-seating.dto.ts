import { IsString } from 'class-validator';

export class CreateSeatingDto {
  @IsString()
  eventId: string;

  @IsString()
  ticketId: string;
}
