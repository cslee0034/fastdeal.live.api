import { Test, TestingModule } from '@nestjs/testing';
import { MessageProducer } from './producer.service'; // Adjust the path to where your service is located
import { ConfigService } from '@nestjs/config';
import { SqsService } from '@ssut/nestjs-sqs';
import { InternalServerErrorException } from '@nestjs/common';

describe('MessageProducer', () => {
  let messageProducer: MessageProducer;
  let sqsService: SqsService;

  const messageBody = { hello: 'world' };
  const queueName = 'test_queue';

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'aws.sqs.email.name') {
        return queueName;
      }
    }),
  };

  const mockSqsService = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageProducer,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: SqsService,
          useValue: mockSqsService,
        },
      ],
    }).compile();

    messageProducer = module.get<MessageProducer>(MessageProducer);
    sqsService = module.get<SqsService>(SqsService);
  });

  it('should be defined', () => {
    expect(messageProducer).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send a message using sqsService with correct parameters', async () => {
      const sqsSendSpy = jest.spyOn(sqsService, 'send');

      await messageProducer.sendEmail(messageBody);

      expect(sqsSendSpy).toHaveBeenCalledWith(
        queueName,
        expect.objectContaining({
          id: expect.any(String),
          body: JSON.stringify(messageBody),
        }),
      );
    });

    it('should handle errors when sqsService fails to send a message', async () => {
      const error = new Error('SQS send failed');
      jest.spyOn(sqsService, 'send').mockRejectedValueOnce(error);

      await expect(messageProducer.sendEmail(messageBody)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
