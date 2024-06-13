import { ApiProperty } from '@nestjs/swagger';
import { Continent, Country } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class CountryEntity implements Country {
  constructor(partial: Partial<CountryEntity>) {
    Object.assign(this, partial);
  }

  @Exclude()
  @ApiProperty({
    description: 'The id of the country',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The code of the country',
    example: 'KR',
  })
  countryCode: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the country',
    example: 'Korea',
  })
  countryName: string;

  @Expose()
  @ApiProperty({
    description: 'The currency of the country',
    example: 'KRW',
  })
  currency: string;

  @Expose()
  @ApiProperty({
    description: 'The exchange rate of the country to USD',
    example: '1.0',
  })
  exchangeRate: number;

  @Expose()
  @ApiProperty({
    description: 'The continent of the country',
    example: 'active',
  })
  continent: Continent;

  @Exclude()
  @ApiProperty({
    description: 'The created date of the country',
    example: '2024-03-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Exclude()
  @ApiProperty({
    description: 'The updated date of the country',
    example: '2024-03-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
