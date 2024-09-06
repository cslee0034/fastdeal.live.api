import { ApiProperty } from '@nestjs/swagger';
import { Place } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class PlaceEntity implements Place {
  constructor(partial: Partial<PlaceEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({
    description: '식별자',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    example: '서울시',
    description: `시/도`,
  })
  city: string;

  @Expose()
  @ApiProperty({
    example: '강남구',
    description: `구`,
  })
  district: string;

  @Expose()
  @ApiProperty({
    example: '역삼동',
    description: `동`,
  })
  street: string;

  @Expose()
  @ApiProperty({
    example: 120,
    description: `도로명 번호`,
  })
  streetNumber: number;

  @Exclude()
  @ApiProperty({
    description: '생성일자',
    example: '2024-03-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Exclude()
  @ApiProperty({
    description: '수정일자',
    example: '2024-03-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
