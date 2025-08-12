import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async createCheckoutSession(_userId: number, _courseId: number) {
    // Mock implementation for Stripe checkout
    // In a real implementation, you would use the Stripe SDK
    const session = {
      id: `cs_${Date.now()}`,
      url: `https://checkout.stripe.com/pay/${Date.now()}`,
      amount_total: 5000, // $50.00 in cents
      currency: 'usd',
      status: 'open',
    };

    // For now, just return the mock session
    // In a real implementation, you would store this in a proper table
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
    try {
      // Extract user and course info from the session
      // This would come from the Stripe session metadata in a real implementation
      const userId = parseInt(session.metadata?.userId || '0');
      const courseId = parseInt(session.metadata?.courseId || '0');

      if (!userId || !courseId) {
        console.log('Missing user or course ID in session metadata');
        return;
      }

      // Create enrollment
      await this.prisma.enrollment.create({
        data: {
          userId,
          courseId,
        },
      });

      // Create purchase record
      await this.prisma.purchase.create({
        data: {
          userId,
          amount: session.amount_total / 100, // Convert from cents to dollars
          status: 'COMPLETED',
        },
      });

      console.log(`Checkout session ${session.id} processed successfully`);
    } catch (error) {
      console.error('Error processing checkout completion:', error);
    }
  }

  private async handlePaymentSucceeded(paymentIntent: any) {
    // Handle payment success if needed
    console.log(`Payment succeeded: ${paymentIntent.id}`);
  }
}
