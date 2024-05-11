import { ApiProperty } from '@nestjs/swagger';

export class ConvertedUserResponseDto {
  @ApiProperty({
    example: true,
    description: 'The success response message',
  })
  success: boolean;

  @ApiProperty({
    example: '1af07b9b-0b1b-4b3d-8e1b-4f4b9b7b1b1b',
    description: 'The id of the user',
  })
  id: string;

  @ApiProperty({
    example: 'test@email.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    example: 'local',
    description: 'The provider of the user',
  })
  provider: string;

  @ApiProperty({
    example: 'chang su',
    description: 'The first name of the user',
  })
  firstName: string;

  @ApiProperty({
    example: 'lee',
    description: 'The last name of the user',
  })
  lastName: string;
}
