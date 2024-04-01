import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    example: 'example@email.com',
    description: `The user's email address`,
  })
  email: string;

  @ApiProperty({
    example: 'example_password',
    description: `The user's password`,
  })
  password: string;
}
