import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MurLockModule } from 'murlock';
import { getLockConfig } from '../../../config/lock/lock';
import { LockService } from '../service/lock.service';

@Module({
  imports: [
    MurLockModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        getLockConfig(configService),
      inject: [ConfigService],
    }),
  ],
  providers: [LockService],
  exports: [LockService],
})
export class LockModule {}
