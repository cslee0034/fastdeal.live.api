import { IsNotEmpty, IsString } from 'class-validator';
import { CreateCountryDto } from './create-country.dto';

export class UpdateCountryDto extends CreateCountryDto {
  @IsNotEmpty()
  @IsString()
  fromCountryId: string;
}
