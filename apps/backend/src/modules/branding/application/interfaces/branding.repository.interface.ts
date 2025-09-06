import { Branding } from '../../domain/entities/branding.entity';

export interface BrandingRepository {
  /**
   * Find branding by client ID
   */
  findByClientId(clientId: string): Promise<Branding | null>;

  /**
   * Find branding by domain or subdomain
   */
  findByDomain(domain: string): Promise<Branding | null>;

  /**
   * Create or update branding for a client
   */
  upsert(clientId: string, brandingData: Partial<Omit<Branding, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>>): Promise<Branding>;

  /**
   * Update branding for a client
   */
  update(clientId: string, brandingData: Partial<Omit<Branding, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>>): Promise<Branding>;

  /**
   * Delete branding for a client
   */
  delete(clientId: string): Promise<void>;

  /**
   * Check if branding exists for client
   */
  exists(clientId: string): Promise<boolean>;
} 