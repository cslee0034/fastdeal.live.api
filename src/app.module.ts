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
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { JwtModule } from '@nestjs/jwt';
import { getJwtConfig } from './config/jwt/jwt';
import { SlackModule } from 'nestjs-slack-webhook';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { PrismaModule } from './infrastructure/orm/prisma/module/prisma.module';
import { AuthModule } from './modules/auth/module/auth.module';
import { RedisModule } from './infrastructure/cache/module/redis.module';
import { EncryptModule } from './infrastructure/encrypt/module/encrypt.module';
import { UsersModule } from './modules/users/module/users.module';
import * as AWS from 'aws-sdk';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guard/role.guard';
import { TokenModule } from './infrastructure/token/module/token.module';
import { PlacesModule } from './modules/places/module/places.module';
import { TicketsModule } from './modules/tickets/module/tickets.module';
import { EventsModule } from './modules/events/module/events.module';
import { ReservationsModule } from './modules/reservations/module/reservations.module';

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
    RedisModule,
    EncryptModule,
    LoggerModule,
    PrismaModule,
    TokenModule,
    AuthModule,
    EventsModule,
    PlacesModule,
    ReservationsModule,
    TicketsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
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
