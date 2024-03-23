import { Module } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthController } from '../controller/auth.controller';
import { UsersModule } from '../../users/module/users.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RedisModule } from '../../cache/module/redis.module';

@Module({
  imports: [UsersModule, ConfigModule, JwtModule, RedisModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
