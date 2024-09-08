import { ApiProperty } from '@nestjs/swagger';
import { Ticket } from '@prisma/client';
import { Expose } from 'class-transformer';

export class TicketEntity implements Ticket {
  constructor(partial: Partial<TicketEntity>) {
    Object.assign(this, partial);
  }

  @Expose()
  @ApiProperty({
    description: '티켓의 아이디 (UUID)',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: '티켓의 이벤트 아이디',
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
  })
  eventId: string;

  @Expose()
  @ApiProperty({
    description: '티켓의 예약 아이디',
    example: '1de07b9b-0b1a-0a1c-6a1b-4f4b9b7b1b1b',
  })
  reservationId: string;

  @Expose()
  @ApiProperty({
    description: '티켓의 가격',
    example: 10000,
  })
  price: number;

  @Expose()
  @ApiProperty({
    description: '티켓의 좌석 번호',
    example: 1,
  })
  seatNumber: number;

  @Expose()
  @ApiProperty({
    description: '티켓의 체크인 코드',
    example: '7df07b9c-6a1b-0d1q-0a1c-4f4b9c6b1b2c',
  })
  checkInCode: string;

  @Expose()
  @ApiProperty({
    description: '티켓의 이미지 URL',
    example: 'https://example.com/image.jpg',
  })
  image: string;

  @Expose()
  @ApiProperty({
    description: '티켓의 생성일',
    example: '2024-09-09T00:00:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: '티켓의 갱신일',
    example: '2024-09-09T00:00:00.000Z',
  })
  updatedAt: Date;
}
