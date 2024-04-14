import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { env } from './config/env/env';
import { validationSchema } from './config/env/validator';
import { HttpModule } from '@nestjs/axios';
import { getHttpConfig } from './config/http/http';
import { WinstonModule } from 'nest-winston';
import { winstonTransports } from './config/logger/logger';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from './config/jwt/jwt';
import { PrismaModule } from './common/orm/prisma/module/prisma.module';
import { EncryptModule } from './modules/encrypt/module/encrypt.module';
import { UsersModule } from './modules/users/module/users.module';
import { AuthModule } from './modules/auth/module/auth.module';
import { RedisModule } from './modules/cache/module/redis.module';
import { ProducerModule } from './modules/queue/producer/module/producer.module';
import * as AWS from 'aws-sdk';
import { SlackModule } from 'nestjs-slack-webhook';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
      useFactory: (configService: ConfigService): object =>
        getHttpConfig(configService),
      inject: [ConfigService],
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): any => ({
        transports: winstonTransports(configService),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): object =>
        getJwtConfig(configService),
      inject: [ConfigService],
    }),
    SlackModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        url: configService.get<string>('slack.webhookUrl'),
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    EncryptModule,
    UsersModule,
    AuthModule,
    RedisModule,
    ProducerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule, OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }

  onModuleInit() {
    AWS.config.update({
      region: this.configService.get<string>('aws.region'),
      accessKeyId: this.configService.get<string>('aws.accessKeyId'),
      secretAccessKey: this.configService.get<string>('aws.secretAccessKey'),
    });
  }
}
