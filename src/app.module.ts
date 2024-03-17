import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { env } from './config/env/env';
import { validationSchema } from './config/env/validator';
import { HttpModule } from '@nestjs/axios';
import { WinstonModule } from 'nest-winston';
import { winstonTransports } from './config/logger/logger';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

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
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get<number>('http.timeout'),
        maxRedirects: configService.get<number>('http.max_redirects'),
      }),
      inject: [ConfigService],
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
