import { Test, TestingModule } from '@nestjs/testing';
import { SlackWebHookModule } from './slack.module';

jest.mock('@slack/webhook', () => {
  return {
    IncomingWebhook: jest.fn().mockImplementation(() => ({
      send: jest.fn().mockResolvedValue({ text: 'ok' }),
    })),
  };
});

describe('SlackWebHookModule', () => {
  let slackWebHookModule: SlackWebHookModule;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SlackWebHookModule],
    }).compile();

    slackWebHookModule = module.get<SlackWebHookModule>(SlackWebHookModule);
  });

  it('should be defined', () => {
    expect(slackWebHookModule).toBeDefined();
  });
});
