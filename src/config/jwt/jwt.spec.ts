import { ConfigService } from '@nestjs/config';
import { getJwtConfig } from './jwt';

describe('getJwtConfig', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
  });

  it('should be defined', () => {
    expect(getJwtConfig).toBeDefined();
  });

  it('should return object', () => {
    expect(getJwtConfig(configService)).toEqual({});
  });
});
