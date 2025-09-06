import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsString,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInvitationDto } from './create-invitation.dto';

export class BulkInvitationDto {
  @ApiProperty({
    description: 'Array of invitation requests',
    type: [CreateInvitationDto],
    minItems: 1,
    maxItems: 50,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateInvitationDto)
  invitations!: CreateInvitationDto[];

  @ApiProperty({
    description: 'Common message for all invitations',
    example: 'Welcome to our KYC platform!',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  commonMessage?: string;
}

export class BulkInvitationResult {
  @ApiProperty({
    description: 'Number of invitations successfully created',
    example: 5,
  })
  successCount!: number;

  @ApiProperty({
    description: 'Number of invitations that failed to create',
    example: 0,
  })
  failureCount!: number;

  @ApiProperty({
    description: 'Array of successfully created invitation IDs',
    type: [String],
  })
  successfulInvitations!: string[];

  @ApiProperty({
    description: 'Array of failed invitations with error details',
    type: [Object],
  })
  failedInvitations!: {
    email: string;
    error: string;
  }[];
}
