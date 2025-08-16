import { Injectable, Inject } from '@nestjs/common';
import type { UserRepository } from '../../domain/repositories/user.repository.interface';
import type { PasswordService } from '../../domain/services/password.service';
import { User } from '../../domain/entities/user.entity';

export interface CreateUserCommand {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  clientId: string;
}

export interface CreateUserResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    firstName: string | undefined;
    lastName: string | undefined;
    clientId: string;
    role: string;
    accountStatus: string;
  };
  message: string;
  error?: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('PasswordService')
    private readonly passwordService: PasswordService,
  ) {}

  async execute(command: CreateUserCommand): Promise<CreateUserResult> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(command.email);
      if (existingUser) {
        return {
          success: false,
          message: 'User with this email already exists',
          error: 'Email already taken',
        };
      }

      // Validate password
      if (!this.passwordService.validatePassword(command.password)) {
        return {
          success: false,
          message: 'Password does not meet requirements',
          error: 'Invalid password',
        };
      }

      // Hash password
      const hashedPassword = await this.passwordService.hashPassword(
        command.password,
      );

      // Create user domain entity
      const createProps: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        clientId: string;
      } = {
        email: command.email,
        password: hashedPassword,
        clientId: command.clientId,
      };

      if (command.firstName) createProps.firstName = command.firstName;
      if (command.lastName) createProps.lastName = command.lastName;

      const user = User.create(createProps);

      // Save user
      const savedUser = await this.userRepository.save(user);

      return {
        success: true,
        user: {
          id: savedUser.id,
          email: savedUser.email,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          clientId: savedUser.clientId,
          role: savedUser.role,
          accountStatus: savedUser.accountStatus,
        },
        message: 'User created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
