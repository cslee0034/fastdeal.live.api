import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SlackModule } from 'nestjs-slack-webhook';

@Module({
  imports: [
    SlackModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        url: configService.get<string>('slack.webhookUrl'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [],
  exports: [SlackModule],
})
export class SlackWebHookModule {}
