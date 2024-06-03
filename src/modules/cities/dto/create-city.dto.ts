import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCityDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  cityName: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  countryCode: string;
}
