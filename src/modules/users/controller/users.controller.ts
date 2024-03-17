import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
