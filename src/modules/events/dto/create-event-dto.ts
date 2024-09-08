import { IsDate, IsNumber, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateEventDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsDate()
  date: Date;

  @IsUUID()
  placeId: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsUrl()
  image: string;
}
