import { ApiProperty } from '@nestjs/swagger';
import { Country } from '@prisma/client';

export class CountryEntity implements Country {
  @ApiProperty({
    description: 'The id of the country',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  id: string;

  @ApiProperty({
    description: 'The code of the country',
    example: 'KR',
  })
  countryCode: string;

  @ApiProperty({
    description: 'The name of the country',
    example: 'Korea',
  })
  countryName: string;

  @ApiProperty({
    description: 'The currency of the country',
    example: 'KRW',
  })
  currency: string;

  @ApiProperty({
    description: 'The exchange rate of the country to USD',
    example: '1.0',
  })
  exchangeRate: number;

  @ApiProperty({
    description: 'The created date of the country',
    example: '2024-03-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The updated date of the country',
    example: '2024-03-01T00:00:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<CountryEntity>) {
    Object.assign(this, partial);
  }
}
