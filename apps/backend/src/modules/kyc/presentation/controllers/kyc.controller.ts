import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  Request,
  BadRequestException,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  IdenfyService,
  CreateVerificationRequest,
  IdenfyWebhookEvent,
} from '../../infrastructure/services/idenfy.service';
import { Public } from '../../../../shared/decorators/public.decorator';
import { Roles } from '../../../../shared/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import {
  CreateVerificationDto,
  KycStatusDto,
  IdenfyWebhookDto,
} from '../dto/kyc.dto';

@ApiTags('kyc')
@Controller('kyc')
export class KycController {
  constructor(private readonly idenfyService: IdenfyService) {}

  @Post('verification')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new KYC verification' })
  @ApiResponse({
    status: 201,
    description: 'Verification created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - User already has active verification',
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createVerification(
    @Request() req: any,
    @Body() body: CreateVerificationDto,
  ) {
    const userId = req.user.id;

    const request: CreateVerificationRequest = {
      userId,
      ...(body.redirectUri && { redirectUri: body.redirectUri }),
      ...(body.referenceId && { referenceId: body.referenceId }),
    };

    return await this.idenfyService.createVerification(request);
  }

  @Get('status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user KYC status' })
  @ApiResponse({
    status: 200,
    description: 'KYC status retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'No KYC record found for user' })
  async getKycStatus(@Request() req: any): Promise<KycStatusDto | null> {
    const userId = req.user.id;

    const kycRecord = await this.idenfyService.getUserKycStatus(userId);

    if (!kycRecord) {
      return null;
    }

    return {
      id: kycRecord.id,
      status: kycRecord.status,
      providerId: kycRecord.providerId,
      createdAt: kycRecord.createdAt,
      updatedAt: kycRecord.updatedAt,
      lastCheckedAt: kycRecord.lastCheckedAt,
      webhookReceived: kycRecord.webhookReceived,
    };
  }

  @Get('status/:userId')
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN)
  @ApiOperation({ summary: 'Get KYC status for specific user (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'KYC status retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'No KYC record found for user' })
  async getUserKycStatus(
    @Param('userId') userId: string,
  ): Promise<KycStatusDto | null> {
    const kycRecord = await this.idenfyService.getUserKycStatus(userId);

    if (!kycRecord) {
      return null;
    }

    return {
      id: kycRecord.id,
      status: kycRecord.status,
      providerId: kycRecord.providerId,
      createdAt: kycRecord.createdAt,
      updatedAt: kycRecord.updatedAt,
      lastCheckedAt: kycRecord.lastCheckedAt,
      webhookReceived: kycRecord.webhookReceived,
    };
  }

  @Post('webhook/idenfy')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Idenfy webhook events' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid webhook signature',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid webhook payload',
  })
  async handleIdenfyWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Body() event: IdenfyWebhookEvent,
    @Headers('idenfy-signature') signature?: string,
    @Headers('x-idenfy-signature') xSignature?: string,
  ) {
    try {
      // Get the raw body for signature validation
      const rawBody = req.rawBody || JSON.stringify(event);
      const webhookSignature = signature || xSignature;

      // Validate webhook signature if provided
      if (webhookSignature) {
        const isValidSignature = this.idenfyService.validateWebhookSignature(
          rawBody.toString(),
          webhookSignature,
        );

        if (!isValidSignature) {
          throw new UnauthorizedException('Invalid webhook signature');
        }
      }

      // Process the webhook event
      await this.idenfyService.processWebhookEvent(event);

      return {
        success: true,
        message: 'Webhook processed successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new BadRequestException(
        `Failed to process webhook: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Get('verification/:verificationId/status')
  @ApiBearerAuth()
  @Roles(UserRole.SUPER_ADMIN, UserRole.CLIENT_ADMIN)
  @ApiOperation({ summary: 'Get verification status by ID (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Verification status retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  @ApiResponse({ status: 404, description: 'Verification not found' })
  async getVerificationStatus(@Param('verificationId') verificationId: string) {
    return await this.idenfyService.getVerificationStatus(verificationId);
  }
}
