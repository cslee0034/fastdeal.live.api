import { Test, TestingModule } from '@nestjs/testing';
import { ProducerModule } from './producer.module';
import { MessageProducer } from '../service/producer.service';

describe('ProducerModule', () => {
  let producerModule: ProducerModule;
  let messageProducer: MessageProducer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ProducerModule],
    }).compile();

    producerModule = module.get<ProducerModule>(ProducerModule);
    messageProducer = module.get<MessageProducer>(MessageProducer);
  });

  it('should be defined', () => {
    expect(producerModule).toBeDefined();
  });

  it('should have RedisService', () => {
    expect(messageProducer).toBeDefined();
  });
});
