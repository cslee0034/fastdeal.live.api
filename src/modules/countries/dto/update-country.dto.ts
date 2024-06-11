import { CreateCountryDto } from './create-country.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateCountryDto extends PartialType(CreateCountryDto) {
  id: string;
}
