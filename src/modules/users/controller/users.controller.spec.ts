import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../service/users.service';
import { SellerApplicationEntity } from '../entities/seller-application.entity';
describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockId = '6d2e1c4f-a709-4d80-b9fb-5d9bdd096eec';
  const mockSellerApplicationId = mockId.replace('6', '7');
  const mockDescription = '판매자 신청합니다';

  const mockApplyToSeller = {
    id: mockSellerApplicationId,
    userId: mockId,
    description: mockDescription,
  };

  const mockUsersService = {
    applyToSeller: jest
      .fn()
      .mockImplementation((id: string, description: string) => {
        return Promise.resolve(new SellerApplicationEntity(mockApplyToSeller));
      }),

    findManySellerApplication: jest
      .fn()
      .mockImplementation((skip: number, take: number) => {
        return Promise.resolve([
          new SellerApplicationEntity(mockApplyToSeller),
        ]);
      }),

    approveToSeller: jest.fn().mockImplementation((id: string) => {
      return Promise.resolve(new SellerApplicationEntity(mockApplyToSeller));
    }),

    rejectToSeller: jest.fn().mockImplementation((id: string) => {
      return Promise.resolve(new SellerApplicationEntity(mockApplyToSeller));
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('applyToSeller', () => {
    it('판매자 신청을 하고 SellerApplicationEntity를 반환해야 한다', async () => {
      const result = await controller.applyToSeller(mockId, mockDescription);

      expect(result).toEqual(new SellerApplicationEntity(mockApplyToSeller));
      expect(service.applyToSeller).toHaveBeenCalled();
    });
  });

  describe('findManySellerApplication', () => {
    it('판매자 신청 목록을 반환해야 한다', async () => {
      const result = await controller.findManySellerApplication(0, 10);

      expect(result).toEqual([new SellerApplicationEntity(mockApplyToSeller)]);
      expect(service.findManySellerApplication).toHaveBeenCalled();
    });
  });

  describe('approveToSeller', () => {
    it('판매자 신청을 승인하고 SellerApplicationEntity를 반환해야 한다', async () => {
      const result = await controller.approveToSeller(mockId);

      expect(result).toEqual(new SellerApplicationEntity(mockApplyToSeller));
      expect(service.approveToSeller).toHaveBeenCalled();
    });
  });

  describe('rejectToSeller', () => {
    it('판매자 신청을 거절하고 SellerApplicationEntity를 반환해야 한다', async () => {
      const result = await controller.rejectToSeller(mockId);

      expect(result).toEqual(new SellerApplicationEntity(mockApplyToSeller));
      expect(service.rejectToSeller).toHaveBeenCalled();
    });
  });
});
