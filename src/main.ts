import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'body-parser';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const logger = app.get('winston');
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');

  const swaggerOptions = new DocumentBuilder()
    .setTitle(`${configService.get<string>('app.serverName')}`)
    .setDescription(
      `${configService.get<string>('app.serverName')} API description`,
    )
    .setVersion('0.0.1')
    .setContact(
      'cslee0034',
      'https://hardworking-everyday.tistory.com/',
      'cslee0034@gmail.com',
    )
    .addTag(`${configService.get<string>('app.serverName')}.api`)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);

  if (configService.get<string>('app.env') === 'development') {
    SwaggerModule.setup('api', app, document);
  }

  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter(logger));

  await app.listen(port);

  logger.info(
    `${configService.get<string>(
      'app.serverName',
    )}.api is listening on port ${port}`,
  );
}
bootstrap();
