import { Test } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { UsersService } from '../service/users.service';
import { UsersController } from '../controller/users.controller';
import { UsersRepository } from '../repository/users.repository';
import { PrismaService } from '../../../infrastructure/orm/prisma/service/prisma.service';
import { EncryptService } from '../../../infrastructure/encrypt/service/encrypt.service';

describe('UsersModule', () => {
  let usersModule: UsersModule;
  let usersController: UsersController;
  let usersService: UsersService;
  let usersRepository: UsersRepository;
  let prismaService: PrismaService;
  let encryptService: EncryptService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    usersModule = module.get<UsersModule>(UsersModule);
    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    encryptService = module.get<EncryptService>(EncryptService);
  });

  it('should be defined', () => {
    expect(usersModule).toBeDefined();
  });

  it('UsersController를 가져야 한다', () => {
    expect(usersController).toBeDefined();
  });

  it('UsersServicer를 가져야 한다', () => {
    expect(usersService).toBeDefined();
  });

  it('UsersRepository를 가져야 한다', () => {
    expect(usersRepository).toBeDefined();
  });

  it('PrismaService를 가져야 한다', () => {
    expect(prismaService).toBeDefined();
  });

  it('EncryptService를 가져야 한다', () => {
    expect(encryptService).toBeDefined();
  });
});
