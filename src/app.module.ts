import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { env } from './config/env/env';
import { validationSchema } from './config/env/validator';
import { WinstonModule } from 'nest-winston';
import { winstonTransports } from './config/logger/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [env],
      validationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transports: winstonTransports(configService),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
