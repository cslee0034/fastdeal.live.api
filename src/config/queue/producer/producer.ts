import { ConfigService } from '@nestjs/config';

export const getProducerConfig = (configService: ConfigService) => ({
  consumers: [],
  producers: [
    {
      name: configService.get<string>('aws.sqs.email.name'),
      queueUrl: configService.get<string>('aws.sqs.email.queueUrl'),
      region: configService.get<string>('aws.sqs.email.region'),
    },
  ],
});
