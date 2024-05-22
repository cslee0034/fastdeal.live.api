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
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SignInDto } from '../dto/request/signin.dto';
import { Public } from '../../../common/decorator/public.decorator';
import { GetTokenUserId } from '../../../common/decorator/get-token-user-id.decorator';
import { RefreshTokenGuard } from '../../../common/guard/refresh-token.guard';
import { GetTokenUser } from '../../../common/decorator/get-token-user.decorator';
import { Response } from 'express';
import { GoogleAuthGuard } from '../../../common/guard/google-auth.guard';
import { SuccessResponseDto } from '../dto/response/success-response.dto';
import { ConvertedUserResponseDto } from '../dto/response/user-response.dto';
import { AUTH_ERROR } from '../error/constant/auth.error.constant';
import { USERS_ERROR } from '../../users/error/constant/users.error.constant';
import { ENCRYPT_ERROR } from '../../encrypt/error/constant/encrypt.error.constant';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly encryptService: EncryptService,
  ) {}

  @Public()
  @Post('local/sign-up')
  @ApiOperation({
    summary: 'Sign up a user',
    description:
      'This endpoint is used to sign up a user with email and password in local provider.',
  })
  @ApiCreatedResponse({
    description: 'The user has been successfully created and cookie is set.',
    type: ConvertedUserResponseDto,
  })
  @ApiForbiddenResponse({
    description: USERS_ERROR.USER_ALREADY_EXISTS,
  })
  @ApiInternalServerErrorResponse({
    description: `${USERS_ERROR.FAILED_TO_CREATE_USER}, \
                  ${AUTH_ERROR.FAILED_TO_CREATE_TOKENS}, \
                  ${AUTH_ERROR.FAILED_TO_SET_REFRESH_TOKEN}, \
                  ${AUTH_ERROR.FAILED_TO_SET_TOKENS_TO_COOKIE}, \
                  Internal server error`,
  })
  async signup(
    @Body() signUpDto: SignUpDto,
    @Res() response: Response,
  ): Promise<void> {
    const createdUser = await this.usersService.createLocal(signUpDto);

    await this.authService.login(createdUser, response);

    response
      .status(HttpStatus.CREATED)
      .json(this.usersService.convertUserResponse(createdUser));

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
    description: 'The user has been successfully signed in and cookie is set.',
    type: ConvertedUserResponseDto,
  })
  @ApiNotFoundResponse({
    description: USERS_ERROR.USER_NOT_FOUND,
  })
  @ApiUnauthorizedResponse({
    description: ENCRYPT_ERROR.PASSWORD_DO_NOT_MATCH,
  })
  @ApiInternalServerErrorResponse({
    description: `${AUTH_ERROR.FAILED_TO_CREATE_TOKENS},\
                  ${AUTH_ERROR.FAILED_TO_SET_REFRESH_TOKEN},\
                  ${AUTH_ERROR.FAILED_TO_SET_TOKENS_TO_COOKIE},\ 
                  Internal server error`,
  })
  async signin(
    @Body() signInDto: SignInDto,
    @Res() response: Response,
  ): Promise<void> {
    const user = await this.usersService.findOneByEmail(signInDto.email);

    await this.encryptService.compareAndThrow(
      signInDto.password,
      user.password,
    );

    await this.authService.login(user, response);

    response
      .status(HttpStatus.OK)
      .json(this.usersService.convertUserResponse(user));

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
    @GetTokenUser('email') email: string,
    @GetTokenUser('firstName') firstName: string,
    @GetTokenUser('lastName') lastName: string,
    @GetTokenUser('provider') provider: string,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const user = await this.usersService.findOrCreateOauth({
        email,
        provider,
        firstName,
        lastName,
      });

      await this.authService.login(user, response);

      this.authService.redirectUser(response, user);
      return;
    } catch (error) {
      this.authService.redirectUserWithError(response, error);

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
    description: `${AUTH_ERROR.FAILED_TO_DELETE_REFRESH_TOKEN},\
                  Internal server error`,
  })
  async logout(@GetTokenUserId() id: string): Promise<SuccessResponseDto> {
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
  @ApiHeader({
    name: 'x-refresh-token',
    description: 'The refresh token is needed',
  })
  @ApiOkResponse({
    description:
      'The tokens have been successfully refreshed and cookie is set.',
    type: ConvertedUserResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: AUTH_ERROR.REFRESH_TOKEN_DO_NOT_MATCH,
  })
  @ApiInternalServerErrorResponse({
    description: `${AUTH_ERROR.FAILED_TO_GET_REFRESH_TOKEN},\
                  ${AUTH_ERROR.FAILED_TO_CREATE_TOKENS},\
                  ${AUTH_ERROR.FAILED_TO_SET_REFRESH_TOKEN},\
                  ${AUTH_ERROR.FAILED_TO_SET_TOKENS_TO_COOKIE},\
                  Internal server error`,
  })
  async refreshTokens(
    @GetTokenUserId() id: string,
    @GetTokenUser('email') email: string,
    @GetTokenUser('refreshToken') refreshToken: string,
    @Res() response: Response,
  ): Promise<void> {
    await this.authService.checkIsLoggedIn(id, refreshToken);

    const user = await this.usersService.findOneById(id);

    await this.authService.login(user, response);

    response
      .status(HttpStatus.OK)
      .json(this.usersService.convertUserResponse(user));

    return;
  }
}
