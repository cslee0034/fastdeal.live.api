import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class SignUpDto implements CreateUserDto {
  @ApiProperty({
    example: 'example@email.com',
    description: `유저 이메일`,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'local',
    description: `로그인 방식`,
  })
  @ApiProperty({
    example: 'chang su',
    description: `이름`,
  })
  @MaxLength(30)
  firstName: string;

  @ApiProperty({
    example: 'lee',
    description: `성`,
  })
  @MaxLength(30)
  lastName: string;

  @ApiProperty({
    example: 'example_password',
    description: `비밀번호`,
  })
  @MaxLength(30)
  password: string;
}
