import { ConfigService } from '@nestjs/config';
import { getHttpConfig } from './http';

describe('getHttpConfig', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService({
      http: { timeout: 3000, max_redirects: 10 },
    });
  });

  it('should be defined', () => {
    expect(getHttpConfig).toBeDefined();
  });

  it('should return http config object', () => {
    const expectedConfig = {
      timeout: 3000,
      maxRedirects: 10,
    };

    expect(getHttpConfig(configService)).toEqual(expectedConfig);
  });
});
