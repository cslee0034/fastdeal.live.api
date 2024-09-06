import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
// import { getJwtConfig } from '../../../config/jwt/jwt';
import { TokenService } from '../service/token.service';

@Module({
  imports: [JwtModule, ConfigModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
