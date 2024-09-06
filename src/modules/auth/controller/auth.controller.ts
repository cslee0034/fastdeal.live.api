import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UsersService } from '../../users/service/users.service';
import { AuthService } from '../service/auth.service';
import { ApiOperation } from '@nestjs/swagger';
import { SignInDto } from '../dto/signin.dto';
import { Public } from '../../../common/decorator/public.decorator';
import { GetTokenUserId } from '../../../common/decorator/get-token-user-id.decorator';
import { RefreshTokenGuard } from '../../../common/guard/refresh-token.guard';
import { GetTokenUser } from '../../../common/decorator/get-token-user.decorator';
import { Tokens } from '../../../infrastructure/token/interface/tokens.interface';
import { ObjectWithSuccess } from '../../../common/interface/object-with-success';
import { SignUpDto } from '../dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('local/sign-up')
  @ApiOperation({
    summary: '유저 회원가입',
  })
  async signup(@Body() signUpDto: SignUpDto): Promise<Tokens> {
    const user = await this.usersService.createUser(signUpDto);

    const tokens = await this.authService.login(user);

    return tokens;
  }

  @Public()
  @Post('local/sign-in')
  @ApiOperation({
    summary: '유저 로그인',
  })
  async signin(@Body() signInDto: SignInDto): Promise<Tokens> {
    const user = await this.usersService.validateUserPassword(signInDto);

    const tokens = await this.authService.login(user);

    return tokens;
  }

  @Public()
  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @ApiOperation({
    summary: '유저 로그아웃',
  })
  async logout(@GetTokenUserId() id: string): Promise<ObjectWithSuccess> {
    const success = await this.authService.logout(id);

    return { success: success };
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @ApiOperation({
    summary: '리프레시 토큰 재발급',
  })
  async refreshTokens(
    @GetTokenUserId() id: string,
    @GetTokenUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    await this.authService.checkIsLoggedIn(id, refreshToken);

    const user = await this.usersService.findOneByIdAndThrow(id);

    const tokens = await this.authService.login(user);

    return tokens;
  }
}
