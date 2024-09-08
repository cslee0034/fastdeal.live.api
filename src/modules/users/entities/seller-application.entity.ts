import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus, SellerApplication } from '@prisma/client';
import { Exclude, Expose } from 'class-transformer';

export class SellerApplicationEntity implements SellerApplication {
  constructor(partial: Partial<SellerApplicationEntity>) {
    Object.assign(this, partial);
  }

  @Exclude()
  @ApiProperty({
    description: '판매자 신청서의 아이디 (UUID)',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: '판매자 신청서를 작성한 유저의 아이디 (UUID)',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  userId: string;

  @Expose()
  @ApiProperty({
    description: '판매자 신청서의 설명',
    example: '판매자 신청합니다.',
  })
  description: string;

  @Expose()
  @ApiProperty({
    description: '판매자 신청서의 상태',
    example: 'PENDING',
    enum: ApplicationStatus,
  })
  status: ApplicationStatus;

  @Exclude()
  @ApiProperty({
    description: '판매자 신청서의 생성일',
    example: '2024-03-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Exclude()
  @ApiProperty({
    description: '판매자 신청서의 갱신일',
    example: '2024-03-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
