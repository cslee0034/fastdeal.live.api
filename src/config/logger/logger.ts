import { ConfigService } from '@nestjs/config';
import { utilities } from 'nest-winston';
import * as winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';

const dailyOptions = (level: string, serverName: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: `./logs/${level}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: 30,
    zippedArchive: true,
    format: winston.format.combine(
      winston.format.timestamp(),
      utilities.format.nestLike(`${serverName}.api`, {
        colors: false,
        prettyPrint: true,
      }),
    ),
  };
};

export const winstonTransports = (configService: ConfigService) => [
  new winston.transports.Console({
    level:
      configService.get<string>('app.env') === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      utilities.format.nestLike(
        `${configService.get<string>('app.serverName')}.api`,
        {
          prettyPrint: true,
        },
      ),
    ),
  }),
  new winstonDaily(
    dailyOptions('warn', `${configService.get<string>('app.serverName')}.api`),
  ),
  new winstonDaily(
    dailyOptions('error', `${configService.get<string>('app.serverName')}.api`),
  ),
];
