import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { winstonTransports } from '../../config/logger/logger';

@Module({
  imports: [
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): any => ({
        transports: winstonTransports(configService),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [WinstonModule],
})
export class LoggerModule {}
