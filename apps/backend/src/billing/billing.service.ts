import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class BillingService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async createCheckoutSession(userId: number, courseId: number) {
    // Mock implementation for Stripe checkout
    // In a real implementation, you would use the Stripe SDK
    const session = {
      id: `cs_${Date.now()}`,
      url: `https://checkout.stripe.com/pay/${Date.now()}`,
      amount_total: 5000, // $50.00 in cents
      currency: 'usd',
      status: 'open',
    };

    // Store the session in the database
    await this.prisma.checkoutSession.create({
      data: {
        stripeSessionId: session.id,
        userId,
        courseId,
        amount: session.amount_total,
        currency: session.currency,
        status: session.status,
      },
    });

    return session;
  }

  async handleWebhook(event: any) {
    // Handle Stripe webhook events
    switch (event.type) {
      case 'checkout.session.completed':
        return this.handleCheckoutCompleted(event.data.object);
      case 'payment_intent.succeeded':
        return this.handlePaymentSucceeded(event.data.object);
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(session: any) {
    // Check if this event has already been processed
    const existingEvent = await this.prisma.processedEvent.findUnique({
      where: { stripeEventId: session.id },
    });

    if (existingEvent) {
      console.log(`Event ${session.id} already processed`);
      return;
    }

    // Process the checkout completion
    const checkoutSession = await this.prisma.checkoutSession.findUnique({
      where: { stripeSessionId: session.id },
      include: { user: true, course: true },
    });

    if (!checkoutSession) {
      console.log(`Checkout session ${session.id} not found`);
      return;
    }

    // Create enrollment
    await this.prisma.enrollment.create({
      data: {
        userId: checkoutSession.userId,
        courseId: checkoutSession.courseId,
        status: 'active',
        enrolledAt: new Date(),
      },
    });

    // Create purchase record
    await this.prisma.purchase.create({
      data: {
        userId: checkoutSession.userId,
        courseId: checkoutSession.courseId,
        amount: checkoutSession.amount,
        currency: checkoutSession.currency,
        status: 'completed',
        stripeSessionId: session.id,
      },
    });

    // Mark event as processed
    await this.prisma.processedEvent.create({
      data: {
        stripeEventId: session.id,
        eventType: 'checkout.session.completed',
        processedAt: new Date(),
      },
    });

    console.log(`Checkout session ${session.id} processed successfully`);
  }

  private async handlePaymentSucceeded(paymentIntent: any) {
    // Handle payment success if needed
    console.log(`Payment succeeded: ${paymentIntent.id}`);
  }
}
