import { ApiProperty } from '@nestjs/swagger';
import { City } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class CityEntity implements City {
  constructor(partial: Partial<CityEntity>) {
    Object.assign(this, partial);
  }

  @Exclude()
  @ApiProperty({
    description: 'The id of the city',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the city',
    example: 'Seoul',
  })
  cityName: string;

  @Exclude()
  @ApiProperty({
    description: 'The country id of the city',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  countryId: string;

  @Expose()
  @ApiProperty({
    description: 'The isAvailable status of the city',
    example: 'true',
  })
  isAvailable: boolean;

  @Exclude()
  @ApiProperty({
    description: 'The created date of the city',
    example: '2024-03-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Exclude()
  @ApiProperty({
    description: 'The updated date of the city',
    example: '2024-03-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
