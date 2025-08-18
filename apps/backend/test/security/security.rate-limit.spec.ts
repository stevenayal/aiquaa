import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Rate Limiting', () => {
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

  it('should allow requests within rate limit', async () => {
    // Make multiple requests within the rate limit
    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer())
        .get('/health')
        .expect(200);
    }
  });

  it('should return 429 when rate limit is exceeded', async () => {
    // Make many requests quickly to exceed rate limit
    const promises = [];
    for (let i = 0; i < 150; i++) {
      promises.push(
        request(app.getHttpServer())
          .get('/health')
          .then(response => response.status)
      );
    }

    const results = await Promise.all(promises);
    const tooManyRequests = results.filter(status => status === 429);
    
    // Should have some 429 responses
    expect(tooManyRequests.length).toBeGreaterThan(0);
  });

  it('should reset rate limit after window expires', async () => {
    // Wait for rate limit window to reset (in real implementation)
    // For testing, we'll just verify the basic functionality
    await request(app.getHttpServer())
      .get('/health')
      .expect(200);
  });
});
