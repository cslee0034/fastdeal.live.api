import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    example: 'example@email.com',
    description: `유저 이메일`,
  })
  email: string;

  @ApiProperty({
    example: 'example_password',
    description: `유저 패스워드`,
  })
  password: string;
}
