import { Test } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { UsersService } from '../service/users.service';
import { UsersController } from '../controller/users.controller';
import { UsersRepository } from '../repository/users.repository';
import { PrismaService } from '../../../common/orm/prisma/service/prisma.service';
import { EncryptService } from '../../encrypt/service/encrypt.service';
import { UsersManager } from '../manager/users.manager';

describe('UsersModule', () => {
  let usersModule: UsersModule;
  let usersController: UsersController;
  let usersService: UsersService;
  let usersRepository: UsersRepository;
  let usersManager: UsersManager;
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
    usersManager = module.get<UsersManager>(UsersManager);
    prismaService = module.get<PrismaService>(PrismaService);
    encryptService = module.get<EncryptService>(EncryptService);
  });

  it('should be defined', () => {
    expect(usersModule).toBeDefined();
  });

  it('shoud have UsersController', () => {
    expect(usersController).toBeDefined();
  });

  it('should have UsersService', () => {
    expect(usersService).toBeDefined();
  });

  it('should have UsersRepository', () => {
    expect(usersRepository).toBeDefined();
  });

  it('should have usersManager', () => {
    expect(usersManager).toBeDefined();
  });

  it('should have PrismaService', () => {
    expect(prismaService).toBeDefined();
  });

  it('should have EncryptService', () => {
    expect(encryptService).toBeDefined();
  });
});
