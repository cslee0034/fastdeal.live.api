import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Provider } from '../entities/user.entity';

export class CreateOauthUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsEnum(Provider)
  provider: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
