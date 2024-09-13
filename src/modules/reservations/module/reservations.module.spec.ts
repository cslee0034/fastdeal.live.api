import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsModule } from './reservations.module';
import { ReservationsController } from '../controller/reservations.controller';
import { ReservationsService } from '../service/reservations.service';
import { ReservationsRepository } from '../repository/reservations.repository';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { TicketsService } from '../../tickets/service/tickets.service';
import { LockService } from '../../../infrastructure/lock/service/lock.service';

describe('ReservationsModule', () => {
  let reservationsModule: ReservationsModule;
  let reservationsController: ReservationsController;
  let reservationsService: ReservationsService;
  let reservationsRepository: ReservationsRepository;
  let ticketsService: TicketsService;
  let prismaService: PrismaService;
  let lockService: LockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ReservationsModule],
    }).compile();

    reservationsModule = module.get<ReservationsModule>(ReservationsModule);
    reservationsController = module.get<ReservationsController>(
      ReservationsController,
    );
    reservationsService = module.get<ReservationsService>(ReservationsService);
    reservationsRepository = module.get<ReservationsRepository>(
      ReservationsRepository,
    );
    ticketsService = module.get<TicketsService>(TicketsService);
    prismaService = module.get<PrismaService>(PrismaService);
    lockService = module.get<LockService>(LockService);
  });

  it('should be defined', () => {
    expect(reservationsModule).toBeDefined();
  });

  it('should have ReservationsController', () => {
    expect(reservationsController).toBeDefined();
  });

  it('should have ReservationsService', () => {
    expect(reservationsService).toBeDefined();
  });

  it('should have ReservationsRepository', () => {
    expect(reservationsRepository).toBeDefined();
  });

  it('should have TicketsService', () => {
    expect(ticketsService).toBeDefined();
  });

  it('should have PrismaService', () => {
    expect(prismaService).toBeDefined();
  });

  it('should have LockService', () => {
    expect(lockService).toBeDefined();
  });
});
