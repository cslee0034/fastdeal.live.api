import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto } from '../dto/request/signup.dto';
import { UsersService } from '../../users/service/users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('local/signup')
  async signup(@Body() signUpDto: SignUpDto) {
    const createdUser = await this.usersService.create(signUpDto);

    return;
  }
}
