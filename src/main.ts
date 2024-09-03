import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';
import { PrismaClientExceptionFilter } from './common/filter/prisma-client-exception.filter';
import { AccessTokenGuard } from './common/guard/access-token.guard';
import { TransformInterceptor } from './common/interceptor/transform-interceptor';
import { isDevEnv } from './common/util/is-dev-env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const serverName = configService.get<string>('app.serverName');
  const port = configService.get<number>('app.port');
  const reflector = app.get(Reflector);
  const clientUrl = `${configService.get<string>('client.url')}`;
  const logger = app.get('winston');
  const slack = app.get('SLACK_TOKEN');

  const swaggerOptions = new DocumentBuilder()
    .setTitle(`${serverName}`)
    .setDescription(`${serverName} API description`)
    .setVersion('0.0.1')
    .setContact(
      'cslee0034',
      'https://hardworking-everyday.tistory.com/',
      'cslee0034@gmail.com',
    )
    .addTag(`${serverName}.api`)
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);

  if (isDevEnv()) {
    SwaggerModule.setup('swagger', app, document);
  }

  app.use(json());
  app.use(urlencoded({ extended: true }));
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );
  app.use(
    cors({
      origin: clientUrl,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalGuards(new AccessTokenGuard(reflector));
  app.useGlobalInterceptors(
    /**
     * 순서: serialize -> transform
     * 1. 응답 직렬화
     * 2. 응답 변환 (success)
     */
    new ClassSerializerInterceptor(reflector),
    new TransformInterceptor(),
  );
  app.useGlobalFilters(
    /**
     * 순서: prisma -> http
     * 1. prisma client 예외 처리
     * 2. http exception 예외 처리
     * 3. 그 이외 기본 exception filter에서 처리
     */
    new PrismaClientExceptionFilter(logger, slack),
    new HttpExceptionFilter(logger, slack),
  );

  await app.listen(port);

  logger.info(`${serverName}.api is listening on port ${port}`);
}
bootstrap();
