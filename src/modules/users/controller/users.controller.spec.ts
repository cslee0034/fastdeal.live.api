import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../service/users.service';
import { ApplyToSellerDto } from '../dto/apply-to-seller.dto';
import { SellerApplicationEntity } from '../entities/seller-application.entity';
describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockId = '6d2e1c4f-a709-4d80-b9fb-5d9bdd096eec';

  const mockApplyToSellerDto = {
    userId: mockId,
    description: '판매자 신청합니다',
  };

  const mockUsersService = {
    applyToSeller: jest
      .fn()
      .mockImplementation((applyToSellerDto: ApplyToSellerDto) => {
        return Promise.resolve(
          new SellerApplicationEntity(mockApplyToSellerDto),
        );
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
    it('판매자 신청을 하고 true를 반환해야 한다', async () => {
      const result = await controller.applyToSeller(
        mockApplyToSellerDto as ApplyToSellerDto,
      );

      expect(result).toEqual(new SellerApplicationEntity(mockApplyToSellerDto));
      expect(service.applyToSeller).toHaveBeenCalled();
    });
  });
});
