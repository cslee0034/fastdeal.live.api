import { ConfigService } from '@nestjs/config';

export const getQueueConfig = async (configService: ConfigService) => ({
  connection: {
    host: configService.get<string>('queue.host'),
    port: configService.get<number>('queue.port'),
    password: configService.get<string>('queue.password'),
  },
});
