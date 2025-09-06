import { Injectable, Logger } from '@nestjs/common';
import { BrandingRepository } from '../../application/interfaces/branding.repository.interface';
import { Branding } from '../../domain/entities/branding.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class MockBrandingRepository implements BrandingRepository {
  private readonly logger = new Logger(MockBrandingRepository.name);
  private readonly brandingStore = new Map<string, Branding>();

  constructor() {
    // Initialize with some default branding
    this.initializeDefaults();
  }

  async findByClientId(clientId: string): Promise<Branding | null> {
    this.logger.debug(`Finding branding for client: ${clientId}`);
    return this.brandingStore.get(clientId) || null;
  }

  async findByDomain(domain: string): Promise<Branding | null> {
    this.logger.debug(`Finding branding for domain: ${domain}`);
    
    // Simple domain mapping for mock data
    const domainToClientMap: Record<string, string> = {
      'example.com': 'client-1',
      'test.com': 'client-2',
      'demo.kyc-platform.com': 'client-3',
    };

    const clientId = domainToClientMap[domain];
    if (clientId) {
      return this.brandingStore.get(clientId) || null;
    }

    return null;
  }

  async upsert(
    clientId: string, 
    brandingData: Partial<Omit<Branding, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Branding> {
    this.logger.debug(`Upserting branding for client: ${clientId}`);

    const existing = this.brandingStore.get(clientId);
    
    if (existing) {
      // Update existing
      const updated = existing.update(brandingData);
      this.brandingStore.set(clientId, updated);
      return updated;
    } else {
      // Create new
      const defaults = Branding.getDefaults();
      const newBranding = new Branding(
        randomUUID(),
        clientId,
        brandingData.logoUrl,
        brandingData.primaryColor || defaults.primaryColor,
        brandingData.secondaryColor || defaults.secondaryColor,
        brandingData.accentColor || defaults.accentColor,
        brandingData.backgroundColor || defaults.backgroundColor,
        brandingData.surfaceColor || defaults.surfaceColor,
        brandingData.textColor || defaults.textColor,
        brandingData.borderColor || defaults.borderColor,
        brandingData.fontFamily || defaults.fontFamily,
        brandingData.borderRadius || defaults.borderRadius,
        brandingData.shadow || defaults.shadow,
        brandingData.customCSS,
      );
      
      this.brandingStore.set(clientId, newBranding);
      return newBranding;
    }
  }

  async update(
    clientId: string, 
    brandingData: Partial<Omit<Branding, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Branding> {
    this.logger.debug(`Updating branding for client: ${clientId}`);

    const existing = this.brandingStore.get(clientId);
    if (!existing) {
      throw new Error(`Branding not found for client: ${clientId}`);
    }

    const updated = existing.update(brandingData);
    this.brandingStore.set(clientId, updated);
    return updated;
  }

  async delete(clientId: string): Promise<void> {
    this.logger.debug(`Deleting branding for client: ${clientId}`);
    this.brandingStore.delete(clientId);
  }

  async exists(clientId: string): Promise<boolean> {
    return this.brandingStore.has(clientId);
  }

  private initializeDefaults(): void {
    // Create some default branding entries for testing
    const defaults = Branding.getDefaults();

    const defaultBranding = new Branding(
      randomUUID(),
      'default-client',
      undefined,
      defaults.primaryColor,
      defaults.secondaryColor,
      defaults.accentColor,
      defaults.backgroundColor,
      defaults.surfaceColor,
      defaults.textColor,
      defaults.borderColor,
      defaults.fontFamily,
      defaults.borderRadius,
      defaults.shadow,
    );

    const client1Branding = new Branding(
      randomUUID(),
      'client-1',
      'https://example.com/logo.png',
      '#1e40af', // blue
      '#64748b', // slate
      '#10b981', // emerald
      '#ffffff', // white
      '#f8fafc', // slate-50
      '#1e293b', // slate-800
      '#e2e8f0', // slate-200
      'Inter, system-ui, sans-serif',
      '0.5rem',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    );

    const client2Branding = new Branding(
      randomUUID(),
      'client-2',
      'https://test.com/logo.png',
      '#dc2626', // red
      '#6b7280', // gray
      '#f59e0b', // amber
      '#fefefe', // almost white
      '#f9fafb', // gray-50
      '#111827', // gray-900
      '#d1d5db', // gray-300
      'Roboto, sans-serif',
      '0.25rem',
      '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    );

    this.brandingStore.set('default-client', defaultBranding);
    this.brandingStore.set('client-1', client1Branding);
    this.brandingStore.set('client-2', client2Branding);

    this.logger.debug('Initialized mock branding data');
  }

  // Development helper methods
  getAllBranding(): Map<string, Branding> {
    return new Map(this.brandingStore);
  }

  clearAll(): void {
    this.brandingStore.clear();
    this.initializeDefaults();
  }
} 