import { Module } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { UsersController } from '../controller/users.controller';
import { UsersRepository } from '../repository/users.repository';
import { PrismaModule } from '../../../infrastructure/orm/prisma/module/prisma.module';
import { EncryptModule } from '../../encrypt/module/encrypt.module';
import { LoggerModule } from '../../../infrastructure/logger/logger.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, EncryptModule, ConfigModule, LoggerModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
})
export class UsersModule {}
