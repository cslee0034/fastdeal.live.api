import { IsEmail, IsString } from 'class-validator';

export class CreateOauthUserDto {
  @IsEmail()
  email: string;

  @IsString()
  provider: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
