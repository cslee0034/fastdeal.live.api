import { ApiProperty } from '@nestjs/swagger';
import { Role, User } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @Exclude()
  @ApiProperty({
    description: '유저의 아이디 (UUID)',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: '유저의 이메일',
    example: 'test@email.com',
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: '유저의 계정 제공자',
    example: 'local',
  })
  provider: string;

  @Exclude() // 인스턴스를 직렬화할 때 해당 필드를 제외
  password: string;

  @Expose()
  @ApiProperty({
    description: '유저의 이름',
    example: 'chang su',
  })
  firstName: string;

  @Expose()
  @ApiProperty({
    description: '유저의 성',
    example: 'lee',
  })
  lastName: string;

  @Expose()
  @ApiProperty({ enum: Role })
  role: Role;

  @Exclude()
  @ApiProperty({
    description: '유저의 생성일',
    example: '2024-03-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Exclude()
  @ApiProperty({
    description: '유저의 업데이트일',
    example: '2024-03-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
