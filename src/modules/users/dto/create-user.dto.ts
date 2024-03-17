import { IsEmail, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MaxLength(30)
  name: string;

  @MaxLength(30)
  password: string;
}
