import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'body-parser';
import helmet from 'helmet';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { PrismaClientExceptionFilter } from './common/filter/prisma-client-exception.filter';
import { AccessTokenGuard } from './common/guard/access-token-guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const logger = app.get('winston');
  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  const serverName = configService.get<string>('app.server_name');
  const reflector = app.get(Reflector);

  const swaggerOptions = new DocumentBuilder()
    .setTitle(`${serverName}`)
    .setDescription(
      `${configService.get<string>('app.server_name')} API description`,
    )
    .setVersion('0.0.1')
    .setContact(
      'cslee0034',
      'https://hardworking-everyday.tistory.com/',
      'cslee0034@gmail.com',
    )
    .addTag(`${serverName}.api`)
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
  app.useGlobalGuards(new AccessTokenGuard(reflector));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(
    new HttpExceptionFilter(logger),
    new PrismaClientExceptionFilter(logger),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  await app.listen(port);

  logger.info(`${serverName}.api is listening on port ${port}`);
}
bootstrap();
