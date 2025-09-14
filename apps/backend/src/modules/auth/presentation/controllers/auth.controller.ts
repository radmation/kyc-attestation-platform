import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { CreateUserDto } from '../../application/dto/create-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        user: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: { type: 'string', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            clientId: {
              type: 'string',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            role: { type: 'string', example: 'CLIENT_USER' },
            accountStatus: { type: 'string', example: 'PENDING' },
          },
        },
        message: { type: 'string', example: 'User created successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation failed or user already exists',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example: 'User with this email already exists',
        },
        error: { type: 'string', example: 'Email already taken' },
      },
    },
  })
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Creating user with email: ${createUserDto.email}`);

    const command: {
      email: string;
      password: string;
      firstName?: string;
      lastName?: string;
      clientId: string;
    } = {
      email: createUserDto.email,
      password: createUserDto.password,
      clientId: createUserDto.clientId,
    };

    if (createUserDto.firstName) command.firstName = createUserDto.firstName;
    if (createUserDto.lastName) command.lastName = createUserDto.lastName;

    const result = await this.createUserUseCase.execute(command);

    if (result.success) {
      this.logger.log(`User created successfully with ID: ${result.user?.id}`);
      return result;
    } else {
      this.logger.warn(`Failed to create user: ${result.error}`);
      return result;
    }
  }
}
