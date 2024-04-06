import { IsEmail, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { Provider } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEnum(Provider)
  provider: string;

  @MaxLength(30)
  firstName: string;

  @MaxLength(30)
  lastName: string;

  @MaxLength(30)
  password: string;
}
