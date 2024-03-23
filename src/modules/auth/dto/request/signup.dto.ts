import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../../users/dto/create-user.dto';
import { IsEmail, MaxLength } from 'class-validator';

export class SignUpDto implements CreateUserDto {
  @ApiProperty({
    example: 'example@email.com',
    description: `The user's email address`,
  })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'example_name', description: `The user's name` })
  @MaxLength(30)
  name: string;

  @ApiProperty({
    example: 'example_password',
    description: `The user's password`,
  })
  @MaxLength(30)
  password: string;
}
