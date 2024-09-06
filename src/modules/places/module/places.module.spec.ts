import { Test, TestingModule } from '@nestjs/testing';
import { PlacesService } from '../service/places.service';
import { PlacesModule } from './places.module';

describe('PlacesModule', () => {
  let placesModule: PlacesModule;
  let placesService: PlacesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PlacesModule],
    }).compile();

    placesModule = module.get<PlacesModule>(PlacesModule);
    placesService = module.get<PlacesService>(PlacesService);
  });

  it('should be defined', () => {
    expect(placesModule).toBeDefined();
  });

  it('should have PlacesService', () => {
    expect(placesService).toBeDefined();
  });
});
