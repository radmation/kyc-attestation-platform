import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../database/prisma.service';

// Define the billing status enum locally since Prisma client may not be fully updated
enum BillingStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  SUSPENDED = 'SUSPENDED',
}

@Injectable()
export class BillingSchedulerService {
  private readonly logger = new Logger(BillingSchedulerService.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Daily cron job to check for expired grace periods
   * Runs every day at 9:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleGracePeriodExpiration(): Promise<void> {
    this.logger.log('Running grace period expiration check');

    try {
      const now = new Date();
      
      // Find all clients with PAST_DUE status where grace period has expired
      const expiredClients = await this.prismaService.client.findMany({
        where: {
          billingStatus: BillingStatus.PAST_DUE,
          gracePeriodEndsAt: {
            lt: now,
          },
        },
      });

      this.logger.log(`Found ${expiredClients.length} clients with expired grace periods`);

      // Update their status to SUSPENDED
      for (const client of expiredClients) {
        await this.prismaService.client.update({
          where: { id: client.id },
          data: {
            billingStatus: BillingStatus.SUSPENDED,
          },
        });

        this.logger.log(`Suspended client ${client.id} - grace period expired`);
      }
    } catch (error) {
      this.logger.error(`Error processing grace period expiration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Daily cron job to send reminder emails
   * Runs every day at 10:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendReminderEmails(): Promise<void> {
    this.logger.log('Running reminder email check');

    try {
      const now = new Date();
      
      // Find clients with PAST_DUE status who need reminder emails
      const pastDueClients = await this.prismaService.client.findMany({
        where: {
          billingStatus: BillingStatus.PAST_DUE,
          gracePeriodEndsAt: {
            gt: now, // Grace period hasn't expired yet
          },
        },
      });

      for (const client of pastDueClients) {
        if (!client.lastPaymentFailedAt || !client.gracePeriodEndsAt) {
          continue;
        }

        const daysSinceFailure = Math.floor(
          (now.getTime() - client.lastPaymentFailedAt.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Send reminders at 7, 14, and 20 days
        if (daysSinceFailure === 7 || daysSinceFailure === 14 || daysSinceFailure === 20) {
          await this.sendReminderEmail(client.id, daysSinceFailure, client.gracePeriodEndsAt);
        }
      }
    } catch (error) {
      this.logger.error(`Error sending reminder emails: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Send a reminder email to a client
   */
  private async sendReminderEmail(clientId: string, daysSinceFailure: number, gracePeriodEndsAt: Date): Promise<void> {
    // TODO: Implement email service integration
    const daysRemaining = Math.ceil(
      (gracePeriodEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    this.logger.log(
      `Would send day ${daysSinceFailure} reminder email to client ${clientId}. ` +
      `${daysRemaining} days remaining in grace period.`
    );
  }
} 