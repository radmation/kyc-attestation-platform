import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Public } from '../../shared/decorators/public.decorator';
import Stripe from 'stripe';

@Controller('billing/stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(private readonly stripeService: StripeService) {}

  /**
   * Stripe webhook endpoint
   * This endpoint receives events from Stripe webhooks
   */
  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    if (!signature) {
      throw new BadRequestException('Missing Stripe signature');
    }

    let event: Stripe.Event;
    
    try {
      // Verify the webhook signature
      event = this.stripeService.verifyWebhookSignature(
        rawBody.toString(),
        signature,
      );
    } catch (error) {
      this.logger.error(`Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new BadRequestException('Invalid signature');
    }

    this.logger.log(`Received Stripe webhook: ${event.type}`);

    try {
      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed':
          await this.stripeService.handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session,
          );
          break;

        case 'invoice.payment_succeeded':
          await this.stripeService.handleInvoicePaymentSucceeded(
            event.data.object as Stripe.Invoice,
          );
          break;

        case 'invoice.payment_failed':
          await this.stripeService.handleInvoicePaymentFailed(
            event.data.object as Stripe.Invoice,
          );
          break;

        case 'customer.subscription.deleted':
          await this.stripeService.handleSubscriptionDeleted(
            event.data.object as Stripe.Subscription,
          );
          break;

        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`Error processing webhook ${event.type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
} 