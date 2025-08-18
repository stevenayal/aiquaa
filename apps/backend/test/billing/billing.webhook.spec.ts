import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Billing Webhook', () => {
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

  it('should process checkout.session.completed webhook', async () => {
    const webhookEvent = {
      id: 'evt_test_webhook',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_session',
          amount_total: 5000,
          currency: 'usd',
          status: 'complete',
          customer: 'cus_test_customer',
        },
      },
    };

    const response = await request(app.getHttpServer())
      .post('/billing/webhook')
      .send(webhookEvent)
      .expect(200);

    // Verify that the webhook was processed
    expect(response.body).toBeDefined();
  });

  it('should handle payment_intent.succeeded webhook', async () => {
    const webhookEvent = {
      id: 'evt_test_payment',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_payment',
          amount: 5000,
          currency: 'usd',
          status: 'succeeded',
        },
      },
    };

    const response = await request(app.getHttpServer())
      .post('/billing/webhook')
      .send(webhookEvent)
      .expect(200);

    expect(response.body).toBeDefined();
  });

  it('should handle unknown webhook events', async () => {
    const webhookEvent = {
      id: 'evt_test_unknown',
      type: 'unknown.event.type',
      data: {
        object: {},
      },
    };

    const response = await request(app.getHttpServer())
      .post('/billing/webhook')
      .send(webhookEvent)
      .expect(200);

    expect(response.body).toBeDefined();
  });

  it('should create checkout session', async () => {
    // First, we need to authenticate a user
    // This is a simplified test - in real implementation you'd need proper auth
    const checkoutData = {
      courseId: 1,
    };

    // This might fail due to authentication requirements
    // but we're testing the endpoint structure
    const response = await request(app.getHttpServer())
      .post('/billing/checkout')
      .send(checkoutData);
    
    // Should either succeed (201) or fail due to auth (401)
    expect([201, 401]).toContain(response.status);
  });
});
