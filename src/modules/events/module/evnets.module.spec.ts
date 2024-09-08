import { Test, TestingModule } from '@nestjs/testing';
import { EventsModule } from './events.module';
import { EventsService } from '../service/events.service';

describe('EventsModule', () => {
  let eventsModule: EventsModule;
  let eventsService: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventsModule],
    }).compile();

    eventsModule = module.get<EventsModule>(EventsModule);
    eventsService = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(eventsModule).toBeDefined();
  });

  it('should have PlacesService', () => {
    expect(eventsService).toBeDefined();
  });
});
