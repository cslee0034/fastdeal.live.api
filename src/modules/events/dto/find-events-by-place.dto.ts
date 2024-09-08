import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FindEventsByPlaceDto {
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsNumber()
  streetNumber?: number;

  @IsOptional()
  @IsString()
  eventName?: string;
}
