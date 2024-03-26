import { PrismaClient } from '@prisma/client';
import { PrismaService } from './prisma.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('PrismaService', () => {
  let prismaService: PrismaService;
  let prismaClient: PrismaClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: PrismaClient,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
            $executeRaw: jest.fn(),
            $executeRawUnsafe: jest.fn(),
            $extends: jest.fn(),
            $on: jest.fn(),
            $queryRaw: jest.fn(),
            $queryRawUnsafe: jest.fn(),
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();
    prismaService = module.get<PrismaService>(PrismaService);
    prismaClient = module.get<PrismaClient>(PrismaClient);
  });

  afterAll(async () => {
    await prismaClient.$disconnect();
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('should define $connect', () => {
    expect(prismaClient.$connect).toBeDefined();
  });

  it('should define $disconnect', () => {
    expect(prismaClient.$disconnect).toBeDefined();
  });

  it('should define $executeRaw', () => {
    expect(prismaClient.$executeRaw).toBeDefined();
  });

  it('should define $executeRawUnsafe', () => {
    expect(prismaClient.$executeRawUnsafe).toBeDefined();
  });

  it('should define $extend', () => {
    expect(prismaClient.$extends).toBeDefined();
  });

  it('should define $on', () => {
    expect(prismaClient.$on).toBeDefined();
  });

  it('should define $queryRaw', () => {
    expect(prismaClient.$queryRaw).toBeDefined();
  });

  it('should define $queryRawUnsafe', () => {
    expect(prismaClient.$queryRawUnsafe).toBeDefined();
  });

  it('should define $transaction', () => {
    expect(prismaClient.$transaction).toBeDefined();
  });
});
