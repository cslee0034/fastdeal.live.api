import { IsString } from 'class-validator';

export class CreateStandingDto {
  @IsString()
  eventId: string;
}
