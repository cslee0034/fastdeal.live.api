import { ApiProperty } from '@nestjs/swagger';
import { AlertStatus, TravelAlert } from '@prisma/client';

export class TravelAlertEntity implements TravelAlert {
  @ApiProperty({
    description: 'The id of the travel alert',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  id: string;

  @ApiProperty({
    description: 'The nationality id of the travel alert',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  nationalityId: string;

  @ApiProperty({
    description: 'The destination id of the travel alert',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  destinationId: string;

  @ApiProperty({
    description: 'The travel status of the travel alert',
    example: 'green',
  })
  alertStatus: AlertStatus;

  @ApiProperty({
    description: 'The created date of the travel alert',
    example: '2024-03-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The updated date of the travel alert',
    example: '2024-03-01T00:00:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<TravelAlertEntity>) {
    Object.assign(this, partial);
  }
}
