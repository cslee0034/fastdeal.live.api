import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MaxLength(30)
  firstName: string;

  @MaxLength(30)
  lastName: string;

  @MaxLength(30)
  password?: string;
}
