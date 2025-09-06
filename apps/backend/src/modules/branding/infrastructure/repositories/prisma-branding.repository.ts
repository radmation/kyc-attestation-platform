import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { BrandingRepository } from '../../application/interfaces/branding.repository.interface';
import { Branding } from '../../domain/entities/branding.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class PrismaBrandingRepository implements BrandingRepository {
  private readonly logger = new Logger(PrismaBrandingRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByClientId(clientId: string): Promise<Branding | null> {
    try {
      const branding = await this.prisma.branding.findUnique({
        where: { clientId },
        include: { client: true },
      });

      if (!branding) {
        return null;
      }

      return new Branding(
        branding.id,
        branding.clientId,
        branding.logoUrl || undefined,
        branding.primaryColor || undefined,
        branding.secondaryColor || undefined,
        branding.accentColor || undefined,
        branding.backgroundColor || undefined,
        branding.surfaceColor || undefined,
        branding.textColor || undefined,
        branding.borderColor || undefined,
        branding.fontFamily || undefined,
        branding.borderRadius || undefined,
        branding.shadow || undefined,
        branding.customCSS || undefined,
        branding.createdAt,
        branding.updatedAt,
      );
    } catch (error) {
      this.logger.error(
        `Failed to find branding by client ID ${clientId}:`,
        error,
      );
      throw error;
    }
  }

  async findByDomain(domain: string): Promise<Branding | null> {
    try {
      const subdomain = domain.split('.')[0];
      const client = await this.prisma.client.findFirst({
        where: {
          OR: [{ domain }, { subdomain: subdomain || null }],
        },
        include: { branding: true },
      });

      if (!client || !client.branding) {
        return null;
      }

      const branding = client.branding;
      return new Branding(
        branding.id,
        branding.clientId,
        branding.logoUrl || undefined,
        branding.primaryColor || undefined,
        branding.secondaryColor || undefined,
        branding.accentColor || undefined,
        branding.backgroundColor || undefined,
        branding.surfaceColor || undefined,
        branding.textColor || undefined,
        branding.borderColor || undefined,
        branding.fontFamily || undefined,
        branding.borderRadius || undefined,
        branding.shadow || undefined,
        branding.customCSS || undefined,
        branding.createdAt,
        branding.updatedAt,
      );
    } catch (error) {
      this.logger.error(`Failed to find branding by domain ${domain}:`, error);
      throw error;
    }
  }

  async upsert(
    clientId: string,
    brandingData: Partial<
      Omit<Branding, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<Branding> {
    try {
      const branding = await this.prisma.branding.upsert({
        where: { clientId },
        update: {
          logoUrl: brandingData.logoUrl,
          primaryColor: brandingData.primaryColor,
          secondaryColor: brandingData.secondaryColor,
          accentColor: brandingData.accentColor,
          backgroundColor: brandingData.backgroundColor,
          surfaceColor: brandingData.surfaceColor,
          textColor: brandingData.textColor,
          borderColor: brandingData.borderColor,
          fontFamily: brandingData.fontFamily,
          borderRadius: brandingData.borderRadius,
          shadow: brandingData.shadow,
          customCSS: brandingData.customCSS,
        },
        create: {
          id: randomUUID(),
          clientId,
          logoUrl: brandingData.logoUrl,
          primaryColor: brandingData.primaryColor,
          secondaryColor: brandingData.secondaryColor,
          accentColor: brandingData.accentColor,
          backgroundColor: brandingData.backgroundColor,
          surfaceColor: brandingData.surfaceColor,
          textColor: brandingData.textColor,
          borderColor: brandingData.borderColor,
          fontFamily: brandingData.fontFamily,
          borderRadius: brandingData.borderRadius,
          shadow: brandingData.shadow,
          customCSS: brandingData.customCSS,
        },
      });

      return new Branding(
        branding.id,
        branding.clientId,
        branding.logoUrl || undefined,
        branding.primaryColor || undefined,
        branding.secondaryColor || undefined,
        branding.accentColor || undefined,
        branding.backgroundColor || undefined,
        branding.surfaceColor || undefined,
        branding.textColor || undefined,
        branding.borderColor || undefined,
        branding.fontFamily || undefined,
        branding.borderRadius || undefined,
        branding.shadow || undefined,
        branding.customCSS || undefined,
        branding.createdAt,
        branding.updatedAt,
      );
    } catch (error) {
      this.logger.error(
        `Failed to upsert branding for client ${clientId}:`,
        error,
      );
      throw error;
    }
  }

  async update(
    clientId: string,
    brandingData: Partial<
      Omit<Branding, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<Branding> {
    try {
      const branding = await this.prisma.branding.update({
        where: { clientId },
        data: {
          logoUrl: brandingData.logoUrl,
          primaryColor: brandingData.primaryColor,
          secondaryColor: brandingData.secondaryColor,
          accentColor: brandingData.accentColor,
          backgroundColor: brandingData.backgroundColor,
          surfaceColor: brandingData.surfaceColor,
          textColor: brandingData.textColor,
          borderColor: brandingData.borderColor,
          fontFamily: brandingData.fontFamily,
          borderRadius: brandingData.borderRadius,
          shadow: brandingData.shadow,
          customCSS: brandingData.customCSS,
        },
      });

      return new Branding(
        branding.id,
        branding.clientId,
        branding.logoUrl || undefined,
        branding.primaryColor || undefined,
        branding.secondaryColor || undefined,
        branding.accentColor || undefined,
        branding.backgroundColor || undefined,
        branding.surfaceColor || undefined,
        branding.textColor || undefined,
        branding.borderColor || undefined,
        branding.fontFamily || undefined,
        branding.borderRadius || undefined,
        branding.shadow || undefined,
        branding.customCSS || undefined,
        branding.createdAt,
        branding.updatedAt,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update branding for client ${clientId}:`,
        error,
      );
      throw error;
    }
  }

  async delete(clientId: string): Promise<void> {
    try {
      await this.prisma.branding.delete({
        where: { clientId },
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete branding for client ${clientId}:`,
        error,
      );
      throw error;
    }
  }

  async exists(clientId: string): Promise<boolean> {
    try {
      const count = await this.prisma.branding.count({
        where: { clientId },
      });
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Failed to check branding existence for client ${clientId}:`,
        error,
      );
      throw error;
    }
  }
}
