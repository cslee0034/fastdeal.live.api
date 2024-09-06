import { Module } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthController } from '../controller/auth.controller';
import { UsersModule } from '../../users/module/users.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '../../../infrastructure/cache/module/redis.module';
import { AccessTokenStrategy } from '../strategies/access-token.strategy';
import { RefreshTokenStrategy } from '../strategies/refresh-token-strategy';
import { TokenModule } from '../../../infrastructure/token/module/token.module';

@Module({
  imports: [UsersModule, ConfigModule, TokenModule, RedisModule],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
})
export class AuthModule {}
