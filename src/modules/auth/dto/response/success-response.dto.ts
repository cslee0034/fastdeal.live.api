import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto {
  @ApiProperty({
    example: true,
    description: 'The success response message',
  })
  success: boolean;
}
