import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
// Use our own enum definition to avoid import issues
enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

export class GetInvitationsQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    required: false,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Filter by invitation status',
    enum: InvitationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(InvitationStatus)
  status?: InvitationStatus;

  @ApiProperty({
    description: 'Filter by email address',
    example: 'user@example.com',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Filter by inviter user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsUUID()
  invitedBy?: string;

  @ApiProperty({
    description: 'Sort field',
    example: 'createdAt',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    required: false,
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class PaginatedInvitationsResult {
  @ApiProperty({
    description: 'Array of invitations',
    type: [Object],
  })
  invitations!: any[];

  @ApiProperty({
    description: 'Total number of invitations matching the query',
    example: 100,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages!: number;

  @ApiProperty({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNextPage!: boolean;

  @ApiProperty({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPrevPage!: boolean;
}
