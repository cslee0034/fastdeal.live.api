import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SqsService } from '@ssut/nestjs-sqs';

@Injectable()
export class MessageProducer {
  constructor(
    private readonly configService: ConfigService,
    private readonly sqsService: SqsService,
  ) {}

  async sendEmail(body: any) {
    const message: any = JSON.stringify(body);

    try {
      await this.sqsService.send(
        this.configService.get<string>('aws.sqs.email.name'),
        {
          id: `${Date.now()}`,
          body: message,
        },
      );
    } catch (error) {
      throw new InternalServerErrorException('Error in producing image');
    }
  }
}
