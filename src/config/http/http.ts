// src/config/http/http.ts
import { ConfigService } from '@nestjs/config';

export const getHttpConfig = (configService: ConfigService) => ({
  timeout: configService.get<number>('http.timeout'),
  maxRedirects: configService.get<number>('http.max_redirects'),
});
