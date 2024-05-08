import { ApiProperty } from '@nestjs/swagger';
import { UserNationality } from '@prisma/client';

export class UserNationalityEntity implements UserNationality {
  @ApiProperty({
    description: 'The id of the user-nationality',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  id: string;

  @ApiProperty({
    description: 'The user id of the user-nationality',
  })
  userId: string;

  @ApiProperty({
    description: 'The nationality id of the user-nationality',
  })
  nationalityId: string;

  @ApiProperty({
    description: 'The created date of the user-nationality',
    example: '2024-03-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The updated date of the user-nationality',
    example: '2024-03-01T00:00:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<UserNationalityEntity>) {
    Object.assign(this, partial);
  }
}
