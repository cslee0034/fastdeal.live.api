import { ApiProperty } from '@nestjs/swagger';
import { City } from '@prisma/client';

export class CityEntity implements City {
  @ApiProperty({
    description: 'The id of the city',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the city',
    example: 'Seoul',
  })
  cityName: string;

  @ApiProperty({
    description: 'The country id of the city',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  countryId: string;

  @ApiProperty({
    description: 'The weather of the city',
    example: 'Cloudy',
  })
  weather: string;

  @ApiProperty({
    description: 'The temperature of the city',
    example: '25',
  })
  temperature: number;

  @ApiProperty({
    description: 'The humidity of the city',
    example: '50',
  })
  humidity: number;

  @ApiProperty({
    description: 'The wind speed of the city',
    example: '5',
  })
  windSpeed: number;

  @ApiProperty({
    description: 'The isAvailable status of the city',
    example: 'true',
  })
  isAvailable: boolean;

  @ApiProperty({
    description: 'The created date of the city',
    example: '2024-03-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The updated date of the city',
    example: '2024-03-01T00:00:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<CityEntity>) {
    Object.assign(this, partial);
  }
}
