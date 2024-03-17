import { Module } from '@nestjs/common';
import { EncryptService } from '../service/encrypt.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [EncryptService],
  exports: [EncryptService],
})
export class EncryptModule {}
