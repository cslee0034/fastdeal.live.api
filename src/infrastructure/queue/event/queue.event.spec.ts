import { Test, TestingModule } from '@nestjs/testing';
import { ReservationQueueListener } from './queue.event';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { IncomingWebhook } from '@slack/webhook';

describe('ReservationQueueListener', () => {
  let listener: ReservationQueueListener;
  let logger: Logger;
  let slack: IncomingWebhook;

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
  };

  const mockSlack = {
    send: jest.fn().mockResolvedValue('Slack message sent'),
  };

  const mockJobCompleted = {
    jobId: '123',
    returnvalue: { message: 'Job completed successfully' },
  };

  const mockJobFailed = {
    jobId: '123',
    failedReason: 'Some failure reason',
  };

  const mockError = new Error('Job failed due to error');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationQueueListener,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockLogger,
        },
        {
          provide: 'SLACK_TOKEN',
          useValue: mockSlack,
        },
      ],
    }).compile();

    listener = module.get<ReservationQueueListener>(ReservationQueueListener);
    logger = module.get<Logger>(WINSTON_MODULE_PROVIDER);
    slack = module.get<IncomingWebhook>('SLACK_TOKEN');

    jest.clearAllMocks();
  });

  describe('onCompleted', () => {
    it('성공시 logger.info를 호출한다', async () => {
      const result = { message: 'Success result' };

      await listener.onCompleted(mockJobCompleted, result);

      expect(logger.info).toHaveBeenCalled();

      expect(slack.send).not.toHaveBeenCalled();
    });
  });

  describe('onFailed', () => {
    it('실패시 logger.error와 slack.send를 호출한다', async () => {
      await listener.onFailed(mockJobFailed, mockError);

      expect(logger.error).toHaveBeenCalled();

      expect(slack.send).toHaveBeenCalled();
    });
  });
});
