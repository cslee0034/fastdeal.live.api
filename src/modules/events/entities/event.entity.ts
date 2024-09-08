import { ApiProperty } from '@nestjs/swagger';
import { Event } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class EventEntity implements Event {
  constructor(partial: Partial<EventEntity>) {
    Object.assign(this, partial);
  }

  @Exclude()
  @ApiProperty({
    description: '이벤트의 아이디 (UUID)',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: '이벤트의 이름',
    example: '행사',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: '이벤트의 설명',
    example: '행사 설명',
  })
  description: string;

  @Expose()
  @ApiProperty({
    description: '이벤트의 시작일',
    example: '2024-03-01T00:00:00.000Z',
  })
  date: Date;

  @Expose()
  @ApiProperty({
    description: '이벤트의 장소 아이디',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  placeId: string;

  @Exclude()
  @ApiProperty({
    description: '이벤트의 생성일',
    example: '2024-03-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Exclude()
  @ApiProperty({
    description: '이벤트의 갱신일',
    example: '2024-03-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
