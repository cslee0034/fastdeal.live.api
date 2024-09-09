import { EventType } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';

export class CreateSeatingDto {
  @IsString()
  eventId: string;

  @IsString()
  ticketId: string;
}
