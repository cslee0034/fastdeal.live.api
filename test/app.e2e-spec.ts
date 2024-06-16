import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should pass the e2e test', () => {
    expect(true).toBe(true);
  });

  describe('app', () => {
    describe('GET /', () => {
      it('should return "Hello World! from nomad-io"', () => {
        return request(app.getHttpServer())
          .get('/')
          .expect(200)
          .expect('Hello World! from nomad-io');
      });
    });
  });
});
