import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto } from '../dto/request/signup.dto';
import { UsersService } from '../../users/service/users.service';
import { AuthService } from '../service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('local/signup')
  async signup(@Body() signUpDto: SignUpDto) {
    const createdUser = await this.usersService.create(signUpDto);

    const tokens = await this.authService.generateToken(
      createdUser.id,
      createdUser.email,
    );

    await this.authService.login(createdUser.id, tokens.refreshToken);

    return tokens;
  }
}
