import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsArray,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateInvitationDto {
  @ApiProperty({
    description: 'Email address of the user to invite',
    example: 'newuser@example.com',
    type: String,
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'First name of the invited user',
    example: 'John',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the invited user',
    example: 'Doe',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;

  @ApiProperty({
    description: 'Role to assign to the invited user',
    example: UserRole.CLIENT_USER,
    enum: UserRole,
  })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiProperty({
    description: 'Client ID that the user will belong to',
    example: '123e4567-e89b-12d3-a456-426614174000',
    type: String,
  })
  @IsUUID()
  clientId!: string;

  @ApiProperty({
    description: 'Custom invitation message',
    example: 'Welcome to our KYC platform!',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @ApiProperty({
    description: 'Specific permissions to grant to the user',
    example: ['read:profiles', 'write:kyc'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
