import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let appService: AppService;

  const mockService: AppService = {
    getHello: jest.fn(() => 'Hello World!'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('/', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should call getHello from AppService', () => {
      controller.getHello();
      expect(appService.getHello).toHaveBeenCalled();
    });

    it('should return "Hello World!"', () => {
      expect(controller.getHello()).toBe('Hello World!');
    });
  });
});
