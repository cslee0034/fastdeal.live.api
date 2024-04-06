import { Controller, Post, Body, Get } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';
import { GetTokenUser } from '../../../common/decorator/get-token-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findOneByEmail(@GetTokenUser('email') email: string) {
    return this.usersService.findOneByEmail(email);
  }

  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createLocal(createUserDto);
  }
}
