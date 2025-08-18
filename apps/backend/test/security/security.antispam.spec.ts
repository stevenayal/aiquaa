import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Anti-Spam Protection', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should reject requests with filled honeypot field', async () => {
    const spamData = {
      title: 'Test Thread',
      content: 'Test content',
      website: 'http://spam.com', // Honeypot field filled
    };

    await request(app.getHttpServer())
      .post('/forum/threads')
      .send(spamData)
      .expect(400);
  });

  it('should reject requests submitted too quickly', async () => {
    const fastData = {
      title: 'Test Thread',
      content: 'Test content',
      _submitTime: Date.now() - 1000, // Submitted 1 second ago (less than 2s minimum)
    };

    await request(app.getHttpServer())
      .post('/forum/threads')
      .send(fastData)
      .expect(429);
  });

  it('should allow legitimate requests', async () => {
    const legitimateData = {
      title: 'Test Thread',
      content: 'Test content',
      _submitTime: Date.now() - 3000, // Submitted 3 seconds ago
    };

    // This should pass the anti-spam checks
    // Note: This might still fail due to authentication requirements
    // but the anti-spam checks should pass
    const response = await request(app.getHttpServer())
      .post('/forum/threads')
      .send(legitimateData);
    
    // Should not be blocked by anti-spam (might be 401 due to auth)
    expect([200, 201, 401]).toContain(response.status);
  });

  it('should handle requests without submit time', async () => {
    const dataWithoutTime = {
      title: 'Test Thread',
      content: 'Test content',
    };

    // Should not be blocked by anti-spam (might be 401 due to auth)
    const response = await request(app.getHttpServer())
      .post('/forum/threads')
      .send(dataWithoutTime);
    
    expect([200, 201, 401]).toContain(response.status);
  });
});
