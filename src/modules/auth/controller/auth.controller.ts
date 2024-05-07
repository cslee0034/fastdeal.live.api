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
  ApiOperation,
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
import { SuccessResponseDto } from '../dto/response/success-response.dto';

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
  @ApiOperation({
    summary: 'Sign up a user',
    description:
      'This endpoint is used to sign up a user with email and password.',
  })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: SuccessResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'User already exists',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Failed to create user,\
       Failed to create tokens,\
       Failed to set refresh token to redis,\
       Failed to set tokens to cookie,\
       Internal server error',
  })
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
  @ApiOperation({
    summary: 'Sign in a user',
    description:
      'This endpoint is used to sign in a user with email and password.',
  })
  @ApiOkResponse({
    description: 'The user has been successfully signed in.',
    type: SuccessResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiUnauthorizedResponse({
    description: 'Password do not match',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Failed to create tokens,\
       Failed to set refresh token to redis,\
       Failed to set tokens to cookie,\
       Internal server error',
  })
  async signin(
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
  @ApiOperation({
    summary: 'Google OAuth2 login',
    description:
      'This endpoint is used to authenticate a user with Google OAuth2.',
  })
  @ApiOkResponse({
    description: 'User will be redirected to Google OAuth2 login page.',
  })
  @Get('google/login')
  async google(): Promise<{ success: boolean }> {
    return { success: true };
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/redirect')
  @ApiOperation({
    summary: 'Google OAuth2 redirect',
    description:
      'This endpoint is used to redirect the user after Google OAuth2 authentication.',
  })
  @ApiOkResponse({
    description: 'User will be redirected to {client-url}/api/google',
  })
  @ApiInternalServerErrorResponse({
    description:
      'User will be redirected to {client-url}/api/google?error=${error.message}',
  })
  async googleRedirect(
    @Res() res: Response,
    @GetTokenUserId() id: string,
    @GetTokenUser('email') email: string,
    @GetTokenUser('firstName') firstName: string,
    @GetTokenUser('lastName') lastName: string,
    @GetTokenUser('provider') provider: string,
  ): Promise<void> {
    try {
      const user = await this.usersService.findOrCreateOauth({
        email,
        provider,
        firstName,
        lastName,
      });

      const tokens = await this.authService.generateTokens(user.id, user.email);

      await this.authService.login(id, tokens.refreshToken);

      await this.authService.setTokens(res, tokens);

      res.redirect(
        `${this.configService.get<string>('client.url')}/api/google`,
      );

      return;
    } catch (error) {
      console.log(error);
      res.redirect(
        `${this.configService.get<string>('client.url')}/api/google?error=${error.message}`,
      );

      return;
    }
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout a user',
    description:
      "This endpoint requires an 'x-access-token' cookie for authentication.",
  })
  @ApiOkResponse({
    description: 'The user has been successfully logged out.',
    type: SuccessResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description:
      'Failed to delete refresh token from redis,\
       Internal server error',
  })
  async logout(@GetTokenUserId() id: string): Promise<{ success: boolean }> {
    const success = await this.authService.logout(id);
    return { success };
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh tokens',
    description:
      "This endpoint requires an 'x-refresh-token' cookie for token rotation.",
  })
  @ApiOkResponse({
    description: 'The tokens have been successfully refreshed.',
    type: SuccessResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token do not match',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Failed to get refresh token from redis,\
       Failed to create tokens,\
       Failed to set refresh token to redis,\
       Failed to set tokens to cookie,\
       Internal server error',
  })
  async refreshTokens(
    @GetTokenUserId() id: string,
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
