import { EventType } from '@prisma/client';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsDate()
  date: Date;

  @IsEnum(EventType)
  eventType: EventType;

  @IsUUID()
  placeId: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsUrl()
  image: string;
}
