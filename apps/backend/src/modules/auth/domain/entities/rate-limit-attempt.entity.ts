export class RateLimitAttempt {
  private constructor(
    private readonly _id: string,
    private _action: string,
    private _userId?: string,
    private _ipAddress?: string,
    private _userAgent?: string,
    private _wasBlocked: boolean = false,
    private _reason?: string,
    private _createdAt: Date = new Date()
  ) {}

  // Factory method for creating new rate limit attempts
  static create(props: {
    userId?: string;
    action: string;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    wasBlocked?: boolean;
    reason?: string;
  }): RateLimitAttempt {
    if (!props.action) {
      throw new Error('Action is required');
    }

    return new RateLimitAttempt(
      crypto.randomUUID(),
      props.action,
      props.userId,
      props.ipAddress,
      props.userAgent,
      props.wasBlocked || false,
      props.reason,
      new Date()
    );
  }

  // Factory method for reconstructing from database
  static reconstruct(data: {
    id: string;
    action: string;
    userId?: string | undefined;
    ipAddress?: string | undefined;
    userAgent?: string | undefined;
    wasBlocked: boolean;
    reason?: string | undefined;
    createdAt: Date;
  }): RateLimitAttempt {
    return new RateLimitAttempt(
      data.id,
      data.action,
      data.userId,
      data.ipAddress,
      data.userAgent,
      data.wasBlocked,
      data.reason,
      data.createdAt
    );
  }

  // Business methods
  markAsBlocked(reason: string): void {
    this._wasBlocked = true;
    this._reason = reason;
  }

  // Getters
  get id(): string { return this._id; }
  get userId(): string | undefined { return this._userId; }
  get action(): string { return this._action; }
  get ipAddress(): string | undefined { return this._ipAddress; }
  get userAgent(): string | undefined { return this._userAgent; }
  get wasBlocked(): boolean { return this._wasBlocked; }
  get reason(): string | undefined { return this._reason; }
  get createdAt(): Date { return this._createdAt; }
}

// Rate limit action constants
export enum RateLimitAction {
  EMAIL_VERIFICATION_RESEND = 'email_verification_resend',
  LOGIN_ATTEMPT = 'login_attempt',
  PASSWORD_RESET = 'password_reset',
  API_CALL = 'api_call'
} 