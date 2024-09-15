import {
  OnQueueEvent,
  QueueEventsHost,
  QueueEventsListener,
} from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { IncomingWebhook } from '@slack/webhook';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@QueueEventsListener('reservation')
export class ReservationQueueListener extends QueueEventsHost {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject('SLACK_TOKEN') private readonly slack: IncomingWebhook,
  ) {
    super();
  }

  @OnQueueEvent('completed')
  async onCompleted(job: { jobId: string; returnvalue: any }, result: any) {
    const jobString = this.stringify(job);
    const resultString = this.stringify(result);

    this.logger.info(
      `Job ${JSON.stringify(jobString)} completed with result ${resultString}`,
    );
  }

  @OnQueueEvent('failed')
  async onFailed(job: { jobId: string; failedReason: any }, result: Error) {
    const jobString = this.stringify(job);
    const resultString = this.stringify(result);

    this.logger.error(`Job ${jobString} failed with error ${resultString}`);

    await this.slack.send({
      text: `
      Queue processing failed on reservation queue.

      Job: ${jobString}

      Result: ${resultString}
      `,
    });
  }

  private stringify(data: any) {
    return JSON.stringify(data, null, 2);
  }
}
