import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../../users/dto/create-user.dto';
import { IsEmail, IsEnum, MaxLength } from 'class-validator';
import { Provider } from '../../../users/entities/user.entity';

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
  @IsEnum(Provider)
  provider: string;

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
