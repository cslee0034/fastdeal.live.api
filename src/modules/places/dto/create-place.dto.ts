import { ApiProperty } from '@nestjs/swagger';

export class CreatePlaceDto {
  @ApiProperty({
    example: '서울시',
    description: `시/도`,
  })
  city: string;
  @ApiProperty({
    example: '강남구',
    description: `구`,
  })
  district: string;
  @ApiProperty({
    example: '역삼동',
    description: `동`,
  })
  street: string;
  @ApiProperty({
    example: 120,
    description: `도로명 번호`,
  })
  streetNumber: number;
}
