import { Controller, Post, Get, Body, Query, Req, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import type { Request } from 'express';
import { SendVerificationEmailUseCase } from '../../application/use-cases/send-verification-email.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/verify-email.use-case';
import { SendVerificationEmailDto } from '../../application/dto/send-verification-email.dto';

@ApiTags('auth')
@Controller('auth')
export class EmailVerificationController {
  private readonly logger = new Logger(EmailVerificationController.name);

  constructor(
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
  ) {}

  @ApiOperation({ summary: 'Send verification email to user' })
  @ApiBody({ type: SendVerificationEmailDto })
  @ApiResponse({ status: 200, description: 'Verification email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - User not found or validation failed' })
  @ApiResponse({ status: 429, description: 'Too many requests - Rate limit exceeded' })
  @Post('send-verification-email')
  async sendVerificationEmail(
    @Body() body: SendVerificationEmailDto,
    @Req() request: Request,
  ) {
    const ipAddress = request.ip || request.connection.remoteAddress || 'unknown';
    const userAgent = request.get('User-Agent') || 'unknown';

    this.logger.log(`Verification email request from ${ipAddress} for ${body.email}`);

    return this.sendVerificationEmailUseCase.execute({
      email: body.email,
      ipAddress,
      userAgent,
    });
  }

  @ApiOperation({ summary: 'Verify email with token' })
  @ApiQuery({ name: 'token', description: 'Email verification token', required: true })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid or expired token' })
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    this.logger.log(`Email verification attempt with token: ${token}`);
    
    return this.verifyEmailUseCase.execute({ token });
  }
} 