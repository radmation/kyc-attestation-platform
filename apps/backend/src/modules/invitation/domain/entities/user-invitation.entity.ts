import { UserRole } from '@prisma/client';

// Import InvitationStatus from Prisma - proper import after client generation
import { InvitationStatus } from '@prisma/client';
import * as crypto from 'crypto';

export class UserInvitation {
  private constructor(
    private readonly _id: string,
    private _email: string,
    private _role: UserRole,
    private _clientId: string,
    private _invitedBy: string,
    private _token: string,
    private _expiresAt: Date,
    private _status: InvitationStatus = InvitationStatus.PENDING,
    private _firstName?: string,
    private _lastName?: string,
    private _message?: string,
    private _permissions: string[] = [],
    private _acceptedAt?: Date,
    private _revokedAt?: Date,
    private _emailSentAt?: Date,
    private _emailSentCount: number = 0,
    private _lastEmailSentAt?: Date,
    private _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {}

  // Factory method for creating new invitations
  static create(props: {
    email: string;
    role: UserRole;
    clientId: string;
    invitedBy: string;
    firstName?: string;
    lastName?: string;
    message?: string;
    permissions?: string[];
    expirationDays?: number;
  }): UserInvitation {
    // Business validation rules
    if (!props.email || !props.clientId || !props.invitedBy) {
      throw new Error('Email, clientId, and invitedBy are required');
    }

    if (!this.isValidEmail(props.email)) {
      throw new Error('Invalid email format');
    }

    if (!Object.values(UserRole).includes(props.role)) {
      throw new Error('Invalid user role');
    }

    // Generate secure token
    const token = this.generateSecureToken();

    // Calculate expiration date (default 7 days)
    const expirationDays = props.expirationDays || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    return new UserInvitation(
      crypto.randomUUID(),
      props.email.toLowerCase().trim(),
      props.role,
      props.clientId,
      props.invitedBy,
      token,
      expiresAt,
      InvitationStatus.PENDING,
      props.firstName?.trim(),
      props.lastName?.trim(),
      props.message?.trim(),
      props.permissions || [],
    );
  }

  // Factory method for reconstructing from database
  static fromPersistence(props: {
    id: string;
    email: string;
    role: UserRole;
    clientId: string;
    invitedBy: string;
    token: string;
    expiresAt: Date;
    status: InvitationStatus;
    firstName?: string;
    lastName?: string;
    message?: string;
    permissions: string[];
    acceptedAt?: Date;
    revokedAt?: Date;
    emailSentAt?: Date;
    emailSentCount: number;
    lastEmailSentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }): UserInvitation {
    return new UserInvitation(
      props.id,
      props.email,
      props.role,
      props.clientId,
      props.invitedBy,
      props.token,
      props.expiresAt,
      props.status,
      props.firstName,
      props.lastName,
      props.message,
      props.permissions,
      props.acceptedAt,
      props.revokedAt,
      props.emailSentAt,
      props.emailSentCount,
      props.lastEmailSentAt,
      props.createdAt,
      props.updatedAt,
    );
  }

  // Getters
  get id(): string {
    return this._id;
  }
  get email(): string {
    return this._email;
  }
  get role(): UserRole {
    return this._role;
  }
  get clientId(): string {
    return this._clientId;
  }
  get invitedBy(): string {
    return this._invitedBy;
  }
  get token(): string {
    return this._token;
  }
  get expiresAt(): Date {
    return this._expiresAt;
  }
  get status(): InvitationStatus {
    return this._status;
  }
  get firstName(): string | undefined {
    return this._firstName;
  }
  get lastName(): string | undefined {
    return this._lastName;
  }
  get message(): string | undefined {
    return this._message;
  }
  get permissions(): string[] {
    return [...this._permissions];
  }
  get acceptedAt(): Date | undefined {
    return this._acceptedAt;
  }
  get revokedAt(): Date | undefined {
    return this._revokedAt;
  }
  get emailSentAt(): Date | undefined {
    return this._emailSentAt;
  }
  get emailSentCount(): number {
    return this._emailSentCount;
  }
  get lastEmailSentAt(): Date | undefined {
    return this._lastEmailSentAt;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Business methods
  accept(): void {
    if (this._status !== InvitationStatus.PENDING) {
      throw new Error('Can only accept pending invitations');
    }

    if (this.isExpired()) {
      throw new Error('Invitation has expired');
    }

    this._status = InvitationStatus.ACCEPTED;
    this._acceptedAt = new Date();
    this._updatedAt = new Date();
  }

  revoke(): void {
    if (this._status !== InvitationStatus.PENDING) {
      throw new Error('Can only revoke pending invitations');
    }

    this._status = InvitationStatus.REVOKED;
    this._revokedAt = new Date();
    this._updatedAt = new Date();
  }

  markEmailSent(): void {
    this._emailSentAt = new Date();
    this._emailSentCount += 1;
    this._lastEmailSentAt = new Date();
    this._updatedAt = new Date();
  }

  isExpired(): boolean {
    return this._expiresAt < new Date();
  }

  isPending(): boolean {
    return this._status === InvitationStatus.PENDING && !this.isExpired();
  }

  canResend(): boolean {
    return this.isPending() && this._emailSentCount < 5; // Max 5 resends
  }

  // Private helper methods
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Convert to plain object for persistence
  toPersistence() {
    return {
      id: this._id,
      email: this._email,
      role: this._role,
      clientId: this._clientId,
      invitedBy: this._invitedBy,
      token: this._token,
      expiresAt: this._expiresAt,
      status: this._status,
      firstName: this._firstName,
      lastName: this._lastName,
      message: this._message,
      permissions: this._permissions,
      acceptedAt: this._acceptedAt,
      revokedAt: this._revokedAt,
      emailSentAt: this._emailSentAt,
      emailSentCount: this._emailSentCount,
      lastEmailSentAt: this._lastEmailSentAt,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
