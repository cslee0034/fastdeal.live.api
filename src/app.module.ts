import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { env } from './config/env/env';
import { validationSchema } from './config/env/validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [env],
      validationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),
  ],
})
export class AppModule {}
