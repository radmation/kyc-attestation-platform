import { UserInvitation } from '../entities/user-invitation.entity';

export interface InvitationRepository {
  // Core CRUD operations
  save(invitation: UserInvitation): Promise<UserInvitation>;
  findById(id: string): Promise<UserInvitation | null>;
  findByToken(token: string): Promise<UserInvitation | null>;
  update(invitation: UserInvitation): Promise<UserInvitation>;
  delete(id: string): Promise<void>;

  // Query operations
  findByEmail(email: string): Promise<UserInvitation[]>;
  findByClientId(clientId: string): Promise<UserInvitation[]>;
  findByInviterId(inviterId: string): Promise<UserInvitation[]>;
  findByStatus(status: string): Promise<UserInvitation[]>;

  // Business operations
  findActiveByEmail(email: string): Promise<UserInvitation | null>;
  findExpiredInvitations(): Promise<UserInvitation[]>;
  findPendingByClientId(clientId: string): Promise<UserInvitation[]>;

  // Bulk operations
  saveMany(invitations: UserInvitation[]): Promise<UserInvitation[]>;
  countByClientId(clientId: string): Promise<number>;
  countByStatus(status: string): Promise<number>;

  // Pagination support
  findWithPagination(params: {
    page: number;
    limit: number;
    clientId?: string;
    status?: string;
    email?: string;
    invitedBy?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    invitations: UserInvitation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  // Utility operations
  exists(token: string): Promise<boolean>;
  existsByEmail(email: string, clientId: string): Promise<boolean>;
}
