import { Module } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { UsersController } from '../controller/users.controller';
import { UserRepository } from '../repository/users.repository';
import { EncryptModule } from '../../encrypt/module/encrypt.module';
import { PrismaModule } from '../../../config/orm/prisma/module/prisma.module';

@Module({
  imports: [PrismaModule, EncryptModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
