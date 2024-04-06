import { Module } from '@nestjs/common';
import { UsersService } from '../service/users.service';
import { UsersController } from '../controller/users.controller';
import { UsersRepository } from '../repository/users.repository';
import { EncryptModule } from '../../encrypt/module/encrypt.module';
import { PrismaModule } from '../../../common/orm/prisma/module/prisma.module';
import { UsersManager } from '../manager/users.manager';

@Module({
  imports: [PrismaModule, EncryptModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, UsersManager],
  exports: [UsersService],
})
export class UsersModule {}
