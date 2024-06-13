import { ApiProperty } from '@nestjs/swagger';
import { AlertStatus, TravelAlert } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class TravelAlertEntity implements TravelAlert {
  constructor(partial: Partial<TravelAlertEntity>) {
    Object.assign(this, partial);
  }

  @Exclude()
  @ApiProperty({
    description: 'The id of the travel alert',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The nationality id of the travel alert',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  nationalityId: string;

  @Expose()
  @ApiProperty({
    description: 'The destination id of the travel alert',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  destinationId: string;

  @Expose()
  @ApiProperty({
    description: 'The travel status of the travel alert',
    example: 'green',
  })
  alertStatus: AlertStatus;

  @Exclude()
  @ApiProperty({
    description: 'The created date of the travel alert',
    example: '2024-03-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Exclude()
  @ApiProperty({
    description: 'The updated date of the travel alert',
    example: '2024-03-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
