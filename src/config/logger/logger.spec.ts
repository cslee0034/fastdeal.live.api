import winston from 'winston';
import { winstonTransports } from './logger';
import { ConfigService } from '@nestjs/config';
import winstonDaily from 'winston-daily-rotate-file';

jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn((key) => {
      switch (key) {
        case 'app.env':
          return 'development';
        case 'app.server_name':
          return 'server';
        default:
          return null;
      }
    }),
  })),
}));

describe('winstonTransports', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();
  });

  it('should return the winston transports as array', () => {
    const _winstonTransports = winstonTransports(configService);

    expect(_winstonTransports).toEqual(expect.any(Array));
  });

  it('should call configService.get with the correct keys', () => {
    winstonTransports(configService);

    expect(configService.get).toHaveBeenCalledWith('app.env');
    expect(configService.get).toHaveBeenCalledWith('app.server_name');
  });

  it('should contain the correct number of transports', () => {
    const transports = winstonTransports(configService);
    expect(transports.length).toBe(3);
  });

  it('should contain correct instances of transports', () => {
    const transports = winstonTransports(configService);

    expect(transports[0]).toBeInstanceOf(winston.transports.Console);
    expect(transports[1]).toBeInstanceOf(winstonDaily);
    expect(transports[2]).toBeInstanceOf(winstonDaily);
  });

  it('should configure transports with correct settings', () => {
    const transports = winstonTransports(configService);

    expect(transports[0].level).toBe(
      configService.get<string>('app.env') === 'production' ? 'info' : 'debug',
    );
  });

  it('should configure daily transports with correct level', () => {
    const transports = winstonTransports(configService);

    expect(transports[1].level).toBe('warn');
    expect(transports[2].level).toBe('error');
  });
});
