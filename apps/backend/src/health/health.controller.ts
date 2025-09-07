import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, HttpHealthIndicator, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Public } from '../shared/decorators/public.decorator';
import { FabricService } from '../blockchain/fabric.service';
import { PrismaService } from '../database/prisma.service';

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
    private db: TypeOrmHealthIndicator,
    private fabricService: FabricService,
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
      () => this.checkDatabase(),
      () => this.checkFabricConnection(),
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
      throw new Error(`Database health check failed: ${error.message}`);
    }
  }

  @Get('/blockchain')
  @Public()
  @ApiOperation({ summary: 'Check blockchain connectivity' })
  async checkFabricConnection() {
    try {
      const isHealthy = this.fabricService.isHealthy();
      return {
        blockchain: {
          status: isHealthy ? 'up' : 'down',
          network: 'fabric',
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw new Error(`Blockchain health check failed: ${error.message}`);
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
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkFabricConnection(),
    ]);

    const allReady = checks.every(check => check.status === 'fulfilled');

    if (!allReady) {
      throw new Error('Service not ready');
    }

    return { status: 'ready', timestamp: new Date().toISOString() };
  }

  @Get('/live')
  @Public()
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  async liveness() {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }
} 