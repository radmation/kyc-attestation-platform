import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateVerificationDto {
  @ApiProperty({ 
    description: 'Redirect URI after KYC completion',
    example: 'https://app.example.com/kyc/complete',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  redirectUri?: string;

  @ApiProperty({ 
    description: 'Reference ID for tracking',
    example: 'user-123-kyc',
    required: false,
  })
  @IsOptional()
  @IsString()
  referenceId?: string;
}

export interface KycStatusDto {
  id: string;
  status: string;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
  lastCheckedAt: Date;
  webhookReceived: boolean;
}

export interface IdenfyWebhookDto {
  type: string;
  id: string;
  data: {
    type: string;
    id: string;
    attributes: Record<string, any>;
  };
} 