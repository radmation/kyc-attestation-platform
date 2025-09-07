import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateCheckoutSessionDto {
  clientId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

// Define the billing status enum locally since Prisma client may not be fully updated
enum BillingStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  SUSPENDED = 'SUSPENDED',
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-08-27.basil',
    });
  }

  /**
   * Create a Stripe checkout session for a new subscription
   */
  async createCheckoutSession(
    dto: CreateCheckoutSessionDto,
  ): Promise<Stripe.Checkout.Session> {
    try {
      // Get the client
      const client = await this.prismaService.client.findUnique({
        where: { id: dto.clientId },
      });

      if (!client) {
        throw new BadRequestException('Client not found');
      }

      // Create or get Stripe customer
      let customerId = client.stripeCustomerId;
      if (!customerId) {
        const customer = await this.stripe.customers.create({
          name: client.name,
          email: client.domain, // Using domain as email for now
          metadata: {
            clientId: client.id,
          },
        });
        customerId = customer.id;

        // Update client with Stripe customer ID
        await this.prismaService.client.update({
          where: { id: dto.clientId },
          data: { stripeCustomerId: customerId },
        });
      }

      // Create checkout session
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: dto.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: dto.successUrl,
        cancel_url: dto.cancelUrl,
        metadata: {
          clientId: dto.clientId,
        },
      });

      this.logger.log(
        `Created checkout session ${session.id} for client ${dto.clientId}`,
      );
      return session;
    } catch (error) {
      this.logger.error(
        `Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Handle checkout session completed webhook
   */
  async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    try {
      const clientId = session.metadata?.clientId;
      if (!clientId) {
        this.logger.warn('No clientId in checkout session metadata');
        return;
      }

      const subscription = await this.stripe.subscriptions.retrieve(
        session.subscription as string,
      );

      // Update client with subscription information
      await this.prismaService.client.update({
        where: { id: clientId },
        data: {
          subscriptionId: subscription.id,
          billingStatus: BillingStatus.ACTIVE,
          stripeCustomerId: session.customer as string,
          gracePeriodEndsAt: null,
          lastPaymentFailedAt: null,
        },
      });

      this.logger.log(
        `Provisioned account for client ${clientId} with subscription ${subscription.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle checkout session completed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Handle invoice payment succeeded webhook
   */
  async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    try {
      const customerId = invoice.customer as string;

      // Find client by Stripe customer ID
      const client = await this.prismaService.client.findUnique({
        where: { stripeCustomerId: customerId },
      });

      if (!client) {
        this.logger.warn(`No client found for Stripe customer ${customerId}`);
        return;
      }

      // Update billing status to active
      await this.prismaService.client.update({
        where: { id: client.id },
        data: {
          billingStatus: BillingStatus.ACTIVE,
          gracePeriodEndsAt: null,
          lastPaymentFailedAt: null,
        },
      });

      this.logger.log(
        `Payment succeeded for client ${client.id}, updated status to ACTIVE`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle invoice payment succeeded: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Handle invoice payment failed webhook
   */
  async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    try {
      const customerId = invoice.customer as string;

      // Find client by Stripe customer ID
      const client = await this.prismaService.client.findUnique({
        where: { stripeCustomerId: customerId },
      });

      if (!client) {
        this.logger.warn(`No client found for Stripe customer ${customerId}`);
        return;
      }

      // Calculate grace period end date (21 days from now)
      const gracePeriodEndsAt = new Date();
      gracePeriodEndsAt.setDate(gracePeriodEndsAt.getDate() + 21);

      // Update client status to past due
      await this.prismaService.client.update({
        where: { id: client.id },
        data: {
          billingStatus: BillingStatus.PAST_DUE,
          gracePeriodEndsAt,
          lastPaymentFailedAt: new Date(),
        },
      });

      this.logger.log(
        `Payment failed for client ${client.id}, set grace period until ${gracePeriodEndsAt}`,
      );

      // TODO: Send reminder email
      await this.sendPaymentFailedEmail(client.id, gracePeriodEndsAt);
    } catch (error) {
      this.logger.error(
        `Failed to handle invoice payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Handle customer subscription deleted webhook
   */
  async handleSubscriptionDeleted(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    try {
      const customerId = subscription.customer as string;

      // Find client by Stripe customer ID
      const client = await this.prismaService.client.findUnique({
        where: { stripeCustomerId: customerId },
      });

      if (!client) {
        this.logger.warn(`No client found for Stripe customer ${customerId}`);
        return;
      }

      // Mark subscription as canceled
      await this.prismaService.client.update({
        where: { id: client.id },
        data: {
          billingStatus: BillingStatus.CANCELED,
          subscriptionId: null,
        },
      });

      this.logger.log(`Subscription canceled for client ${client.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to handle subscription deleted: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Create Stripe Customer Portal session
   */
  async createCustomerPortalSession(
    clientId: string,
    returnUrl: string,
  ): Promise<Stripe.BillingPortal.Session> {
    try {
      const client = await this.prismaService.client.findUnique({
        where: { id: clientId },
      });

      if (!client || !client.stripeCustomerId) {
        throw new BadRequestException('Client not found or no Stripe customer');
      }

      const session = await this.stripe.billingPortal.sessions.create({
        customer: client.stripeCustomerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      this.logger.error(
        `Failed to create customer portal session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required');
    }

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (error) {
      this.logger.error(
        `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Send payment failed email (placeholder implementation)
   */
  private async sendPaymentFailedEmail(
    clientId: string,
    gracePeriodEndsAt: Date,
  ): Promise<void> {
    // TODO: Implement email service integration
    this.logger.log(
      `Would send payment failed email to client ${clientId}, grace period ends ${gracePeriodEndsAt}`,
    );
  }
}
