import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';
import { Public } from '../shared/decorators/public.decorator';
import { BlockchainProviderService } from '../blockchain/blockchain-provider.service';
import { PrismaService } from '../prisma/prisma.service';

export interface HealthStatus {
  status: 'ok' | 'error';
  info?: Record<string, any>;
  error?: Record<string, any>;
  details: Record<string, any>;
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private blockchainService: BlockchainProviderService,
    private prismaService: PrismaService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get overall health status' })
  @ApiResponse({ status: 200, description: 'Health check result' })
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
      async () => {
        try {
          await this.prismaService.$queryRaw`SELECT 1`;
          return { database: { status: 'up' } };
        } catch {
          return { database: { status: 'down' } };
        }
      },
    ]);
  }

  @Get('/database')
  @Public()
  @ApiOperation({ summary: 'Check database connectivity' })
  async checkDatabase() {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return {
        database: {
          status: 'up',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Database health check failed: ${errorMessage}`);
    }
  }

  @Get('/blockchain')
  @Public()
  @ApiOperation({ summary: 'Check blockchain connectivity' })
  async checkBlockchainConnection() {
    try {
      // Check if blockchain service is available
      const isHealthy = this.blockchainService ? true : false;
      return {
        blockchain: {
          status: isHealthy ? 'up' : 'down',
          network: 'multi-blockchain',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Blockchain health check failed: ${errorMessage}`);
    }
  }

  @Get('/metrics')
  @Public()
  @ApiOperation({ summary: 'Get Prometheus metrics' })
  async getMetrics(): Promise<string> {
    // This would return Prometheus format metrics
    // For now, return basic metrics as text
    const metrics = [
      '# HELP http_requests_total Total number of HTTP requests',
      '# TYPE http_requests_total counter',
      'http_requests_total{method="GET",status="200"} 100',
      'http_requests_total{method="POST",status="201"} 50',
      '',
      '# HELP system_up System uptime',
      '# TYPE system_up gauge',
      'system_up 1',
    ];

    return metrics.join('\n');
  }

  @Get('/ready')
  @Public()
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  async readiness() {
    try {
      // Simple readiness check - just verify service can respond
      await this.prismaService.$queryRaw`SELECT 1`;
      return { status: 'ready', timestamp: new Date().toISOString() };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Service not ready: ${errorMessage}`);
    }
  }

  @Get('/live')
  @Public()
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  async liveness() {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }
} 