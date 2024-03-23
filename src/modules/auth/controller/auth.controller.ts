import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SignUpDto } from '../dto/request/signup.dto';
import { UsersService } from '../../users/service/users.service';
import { AuthService } from '../service/auth.service';
import { EncryptService } from '../../encrypt/service/encrypt.service';
import { TokensResponseDto } from '../dto/response/token.dto';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from '../dto/request/login.dto';
import { Tokens } from '../types/tokens.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly encryptService: EncryptService,
  ) {}

  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ type: TokensResponseDto })
  @ApiForbiddenResponse()
  @ApiInternalServerErrorResponse()
  async signup(@Body() signUpDto: SignUpDto) {
    const createdUser = await this.usersService.create(signUpDto);

    const tokens = await this.authService.generateToken(
      createdUser.id,
      createdUser.email,
    );

    await this.authService.login(createdUser.id, tokens.refreshToken);

    return tokens;
  }

  @Post('local/login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TokensResponseDto })
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @ApiInternalServerErrorResponse()
  async login(@Body() loginDto: LoginDto): Promise<Tokens> {
    const user = await this.usersService.findOneByEmail(loginDto.email);

    await this.encryptService.compareAndThrow(loginDto.password, user.password);

    const tokens = await this.authService.generateToken(user.id, user.email);

    await this.authService.login(user.id, tokens.refreshToken);

    return tokens;
  }
}
