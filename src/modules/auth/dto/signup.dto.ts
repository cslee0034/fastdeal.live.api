import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class SignUpDto implements CreateUserDto {
  @ApiProperty({
    example: 'example@email.com',
    description: `The user's email address`,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'local',
    description: `The user's provider that must be 'local'`,
  })
  @ApiProperty({ example: 'chang su', description: `The user's given name` })
  @MaxLength(30)
  firstName: string;

  @ApiProperty({ example: 'lee', description: `The user's family name` })
  @MaxLength(30)
  lastName: string;

  @ApiProperty({
    example: 'example_password',
    description: `The user's password`,
  })
  @MaxLength(30)
  password: string;
}
