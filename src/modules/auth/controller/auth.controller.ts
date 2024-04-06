import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SignUpDto } from '../dto/request/signup.dto';
import { UsersService } from '../../users/service/users.service';
import { AuthService } from '../service/auth.service';
import { EncryptService } from '../../encrypt/service/encrypt.service';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignInDto } from '../dto/request/signin.dto';
import { Public } from '../../../common/decorator/public.decorator';
import { GetTokenUserId } from '../../../common/decorator/get-token-user-id.decorator';
import { RefreshTokenGuard } from '../../../common/guard/refresh-token-guard';
import { GetTokenUser } from '../../../common/decorator/get-token-user.decorator';
import { Response } from 'express';
import { GoogleAuthGuard } from '../../../common/guard/google-auth-guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly encryptService: EncryptService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('local/sign-up')
  @ApiCreatedResponse()
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  async signup(
    @Body() signUpDto: SignUpDto,
    @Res() res: Response,
  ): Promise<void> {
    const createdUser = await this.usersService.createLocal(signUpDto);

    const tokens = await this.authService.generateTokens(
      createdUser.id,
      createdUser.email,
    );

    await this.authService.login(createdUser.id, tokens.refreshToken);

    await this.authService.setTokens(res, tokens);

    res.status(HttpStatus.CREATED).json({ success: true });

    return;
  }

  @Public()
  @Post('local/sign-in')
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  async login(
    @Body() signInDto: SignInDto,
    @Res() res: Response,
  ): Promise<void> {
    const user = await this.usersService.findOneByEmail(signInDto.email);

    await this.encryptService.compareAndThrow(
      signInDto.password,
      user.password,
    );

    const tokens = await this.authService.generateTokens(user.id, user.email);

    await this.authService.login(user.id, tokens.refreshToken);

    await this.authService.setTokens(res, tokens);

    res.status(HttpStatus.OK).json({ success: true });

    return;
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  async google(): Promise<{ success: boolean }> {
    return { success: true };
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/redirect')
  async googleRedirect(
    @Res() res: Response,
    @GetTokenUserId() id: number,
    @GetTokenUser('email') email: string,
  ): Promise<void> {
    const tokens = await this.authService.generateTokens(id, email);

    await this.authService.login(id, tokens.refreshToken);

    await this.authService.setTokens(res, tokens);

    res.redirect(`${this.configService.get<string>('client.url')}/api/google`);

    return;
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  @ApiInternalServerErrorResponse()
  async logout(@GetTokenUserId() id: number): Promise<{ success: boolean }> {
    const success = await this.authService.logout(id);
    return { success };
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  async refreshTokens(
    @GetTokenUserId() id: number,
    @GetTokenUser('email') email: string,
    @GetTokenUser('refreshToken') refreshToken: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.authService.checkIsLoggedIn(id, refreshToken);

    const tokens = await this.authService.generateTokens(id, email);

    await this.authService.login(id, tokens.refreshToken);

    await this.authService.setTokens(res, tokens);

    res.status(HttpStatus.OK).json({ success: true });

    return;
  }
}
