import { Test, TestingModule } from '@nestjs/testing';
import { EventsModule } from './events.module';
import { EventsService } from '../service/events.service';
import { EventsRepository } from '../repository/events.repository';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { TicketsRepository } from '../../tickets/repository/tickets.repository';

describe('EventsModule', () => {
  let eventsModule: EventsModule;
  let eventsService: EventsService;
  let eventsRepository: EventsRepository;
  let ticketsRepository: TicketsRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventsModule],
    }).compile();

    eventsModule = module.get<EventsModule>(EventsModule);
    eventsService = module.get<EventsService>(EventsService);
    eventsRepository = module.get<EventsRepository>(EventsRepository);
    ticketsRepository = module.get<TicketsRepository>(TicketsRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(eventsModule).toBeDefined();
  });

  it('should have EventsService', () => {
    expect(eventsService).toBeDefined();
  });

  it('should have EventsRepository', () => {
    expect(eventsRepository).toBeDefined();
  });

  it('should have TicketsRepository', () => {
    expect(ticketsRepository).toBeDefined();
  });

  it('should have PrismaService', () => {
    expect(prismaService).toBeDefined();
  });
});
