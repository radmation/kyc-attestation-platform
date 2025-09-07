import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StripeService, CreateCheckoutSessionDto } from './stripe.service';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateCheckoutSessionRequestDto {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CustomerPortalRequestDto {
  returnUrl: string;
}

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Create a Stripe checkout session for subscription
   */
  @Post('checkout-session')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionRequestDto,
    @Request() req: any,
  ) {
    const user = req.user;
    
    const checkoutDto: CreateCheckoutSessionDto = {
      clientId: user.clientId,
      priceId: dto.priceId,
      successUrl: dto.successUrl,
      cancelUrl: dto.cancelUrl,
    };

    const session = await this.stripeService.createCheckoutSession(checkoutDto);
    
    return {
      sessionId: session.id,
      url: session.url,
    };
  }

  /**
   * Create a Stripe Customer Portal session
   */
  @Post('customer-portal')
  @Roles(UserRole.CLIENT_ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.OK)
  async createCustomerPortalSession(
    @Body() dto: CustomerPortalRequestDto,
    @Request() req: any,
  ) {
    const user = req.user;
    
    const session = await this.stripeService.createCustomerPortalSession(
      user.clientId,
      dto.returnUrl,
    );
    
    return {
      url: session.url,
    };
  }

  /**
   * Get billing status for the current client
   */
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getBillingStatus(@Request() req: any) {
    const user = req.user;
    
    const client = await this.prismaService.client.findUnique({
      where: { id: user.clientId },
      select: {
        billingStatus: true,
        gracePeriodEndsAt: true,
        lastPaymentFailedAt: true,
        subscriptionId: true,
      },
    });

    return client;
  }
} 