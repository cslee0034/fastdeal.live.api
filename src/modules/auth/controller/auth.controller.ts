import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto } from '../dto/request/signup.dto';

@Controller('auth')
export class AuthController {
  @Post('local/signup')
  async signup(@Body() signUpDto: SignUpDto) {
    return;
  }
}
