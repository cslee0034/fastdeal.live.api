import { LoggerModule } from './logger.module';

describe('LoggerModule', () => {
  let module: LoggerModule;

  beforeEach(async () => {
    module = new LoggerModule();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });
});
