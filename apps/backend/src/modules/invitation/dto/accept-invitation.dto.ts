import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({
    description:
      'Password for the new user account (min 8 characters, must include uppercase, lowercase, number, and special character)',
    example: 'SecurePass123!',
    type: String,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password!: string;

  @ApiProperty({
    description: 'First name of the user (optional, can override invitation)',
    example: 'John',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the user (optional, can override invitation)',
    example: 'Doe',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName?: string;
}
