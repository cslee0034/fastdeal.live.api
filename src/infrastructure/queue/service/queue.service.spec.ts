import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { getQueueToken } from '@nestjs/bullmq';
import { RedisService } from '../../cache/service/redis.service';
import { FailedToAddQueue } from '../error/failed-to-add-queue';
import { SECONDS } from '../../../common/constant/time/milliseconds-base/milliseconds-to-seconds';
import { RAW_HOURS } from '../../../common/constant/time/seconds-base/hours';
import { Queue } from 'bullmq';

/**
 * reference:
 * https://yflooi.medium.com/unit-and-integration-testing-for-nestjs-bull-in-ci-cd-pipelines-dc16904492f5
 */
describe('QueueService', () => {
  let queueService: QueueService;
  let reservationQueue: Queue;
  let cacheService: RedisService;

  const mockReservationQueue = {
    add: jest.fn(),
  };

  const mockCacheService = {
    deleteTicketSoldOut: jest.fn(),
  };

  const mockData = {
    createSeatingDto: {
      ticketId: 'mockTicketId',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: getQueueToken('reservation'),
          useValue: mockReservationQueue,
        },
        {
          provide: RedisService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    queueService = module.get<QueueService>(QueueService);
    reservationQueue = module.get(getQueueToken('reservation'));
    cacheService = module.get<RedisService>(RedisService);

    jest.clearAllMocks();
  });

  describe('addReservationJob', () => {
    it('큐에 reservation job을 추가해야 한다', async () => {
      mockReservationQueue.add.mockResolvedValueOnce('mockJobId');

      await queueService.addReservationJob(mockData);

      expect(reservationQueue.add).toHaveBeenCalledWith(
        'reservation',
        mockData,
        {
          attempts: 3,
          backoff: {
            type: 'fixed',
            delay: 1 * SECONDS,
          },
          removeOnComplete: true,
          removeOnFail: {
            age: 24 * RAW_HOURS,
          },
        },
      );

      expect(cacheService.deleteTicketSoldOut).not.toHaveBeenCalled();
    });

    it('큐에 reservation job을 추가하는 것에 실패하면 캐시를 초기화 하고 FailedToAddQueue를 반환한다', async () => {
      mockReservationQueue.add.mockRejectedValueOnce(
        new Error('Failed to add'),
      );

      await expect(queueService.addReservationJob(mockData)).rejects.toThrow(
        FailedToAddQueue,
      );

      expect(reservationQueue.add).toHaveBeenCalledWith(
        'reservation',
        mockData,
        {
          attempts: 3,
          backoff: {
            type: 'fixed',
            delay: 1 * SECONDS,
          },
          removeOnComplete: true,
          removeOnFail: {
            age: 24 * RAW_HOURS,
          },
        },
      );

      expect(cacheService.deleteTicketSoldOut).toHaveBeenCalledWith(
        mockData.createSeatingDto.ticketId,
      );
    });
  });
});
