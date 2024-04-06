import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export enum Provider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

export enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

export class UserEntity implements User {
  @ApiProperty({
    description: 'The id of the user',
    example: 0,
  })
  id: number;

  @ApiProperty({
    description: 'The email of the user',
    example: 'test@email.com',
  })
  email: string;

  @ApiProperty({ enum: Provider })
  provider: string;

  @Exclude() // 인스턴스를 직렬화할 때 해당 필드를 제외
  password: string;

  @ApiProperty({
    description: 'The first name of the user',
    example: 'chang su',
  })
  firstName: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'lee',
  })
  lastName: string;

  @ApiProperty({ enum: Role })
  role: string;

  @ApiProperty({
    description: 'The created date of the user',
    example: '2024-03-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The updated date of the user',
    example: '2024-03-01T00:00:00.000Z',
  })
  updatedAt: Date;

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}
