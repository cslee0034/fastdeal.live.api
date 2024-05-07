import { ApiProperty } from '@nestjs/swagger';
import { Provider, Role, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  @ApiProperty({
    description: 'The id of the user',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  id: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'test@email.com',
  })
  email: string;

  @ApiProperty({ enum: Provider })
  provider: Provider;

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
  role: Role;

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
