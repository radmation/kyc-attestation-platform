import { UserRole, AccountStatus } from '@prisma/client';

export class User {
  private constructor(
    private readonly _id: string,
    private _email: string,
    private _password: string,
    private _clientId: string,
    private _firstName?: string,
    private _lastName?: string,
    private _role: UserRole = UserRole.CLIENT_USER,
    private _accountStatus: AccountStatus = AccountStatus.PENDING,
    private _isActive: boolean = true,
    private _emailVerified: boolean = false,
    private _emailVerificationToken?: string,
    private _emailVerificationExpires?: Date,
    private _lastVerificationEmailSent?: Date,
    private _verificationEmailCount: number = 0,
    private _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date()
  ) {}

  // Factory method for creating new users
  static create(props: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    clientId: string;
  }): User {
    // Business validation rules
    if (!props.email || !props.password || !props.clientId) {
      throw new Error('Email, password, and clientId are required');
    }
    
    if (!this.isValidEmail(props.email)) {
      throw new Error('Invalid email format');
    }

    if (props.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    return new User(
      crypto.randomUUID(), // Generate UUID
      props.email,
      props.password, // Will be hashed later
      props.clientId,
      props.firstName,
      props.lastName,
      UserRole.CLIENT_USER,
      AccountStatus.PENDING,
      true,
      false,
      undefined,
      undefined,
      undefined,
      0,
      new Date(),
      new Date()
    );
  }

  // Factory method for reconstructing from database
  static reconstruct(data: {
    id: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: UserRole;
    accountStatus: AccountStatus;
    isActive: boolean;
    clientId: string;
    emailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationExpires?: Date;
    lastVerificationEmailSent?: Date;
    verificationEmailCount: number;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      data.id,
      data.email,
      data.password,
      data.clientId,
      data.firstName,
      data.lastName,
      data.role,
      data.accountStatus,
      data.isActive,
      data.emailVerified,
      data.emailVerificationToken,
      data.emailVerificationExpires,
      data.lastVerificationEmailSent,
      data.verificationEmailCount,
      data.createdAt,
      data.updatedAt
    );
  }

  // Business methods
  verifyEmail(): void {
    if (this._emailVerified) {
      throw new Error('Email already verified');
    }
    this._emailVerified = true;
    this._accountStatus = AccountStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  setVerificationToken(token: string, expiresInHours: number = 24): void {
    this._emailVerificationToken = token;
    this._emailVerificationExpires = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    this._updatedAt = new Date();
  }

  clearVerificationToken(): void {
    this._emailVerificationToken = undefined;
    this._emailVerificationExpires = undefined;
    this._updatedAt = new Date();
  }

  incrementVerificationEmailCount(): void {
    this._verificationEmailCount += 1;
    this._lastVerificationEmailSent = new Date();
    this._updatedAt = new Date();
  }

  updatePassword(newPassword: string): void {
    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    this._password = newPassword;
    this._updatedAt = new Date();
  }

  suspend(): void {
    this._isActive = false;
    this._accountStatus = AccountStatus.SUSPENDED;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._accountStatus = AccountStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  // Getters (immutable access)
  get id(): string { return this._id; }
  get email(): string { return this._email; }
  get password(): string { return this._password; }
  get firstName(): string | undefined { return this._firstName; }
  get lastName(): string | undefined { return this._lastName; }
  get role(): UserRole { return this._role; }
  get accountStatus(): AccountStatus { return this._accountStatus; }
  get isActive(): boolean { return this._isActive; }
  get clientId(): string { return this._clientId; }
  get emailVerified(): boolean { return this._emailVerified; }
  get emailVerificationToken(): string | undefined { return this._emailVerificationToken; }
  get emailVerificationExpires(): Date | undefined { return this._emailVerificationExpires; }
  get lastVerificationEmailSent(): Date | undefined { return this._lastVerificationEmailSent; }
  get verificationEmailCount(): number { return this._verificationEmailCount; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Private validation methods
  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
} 