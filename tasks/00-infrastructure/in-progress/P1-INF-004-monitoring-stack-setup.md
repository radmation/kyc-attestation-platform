# Task: Monitoring Stack Setup (Prometheus + Grafana + Explorer)

## Meta Information
- **Task ID**: P1-INF-004
- **Epic**: Platform Infrastructure Foundation
- **Priority**: P1 (High)
- **Estimate**: M (1-2 weeks)
- **Sprint**: Sprint 2
- **Assignee**: AI Developer

## Dependencies
- [ ] P0-INF-003: Hyperledger Fabric Network Setup (requires Fabric network running)
- [ ] P0-MBC-001: Blockchain Provider Abstraction Layer (for multi-blockchain monitoring)

## Context for AI
**Project Structure**: This is a KYC attestation platform built with:
- **Backend**: NestJS with TypeScript at `/apps/backend/src/`
- **Blockchain**: Multi-blockchain support (Fabric, Ethereum, Polygon) via provider abstraction
- **Monitoring**: Docker compose setup at `/monitoring/`

**Related Files**: 
- Reference: `/docs/TECHNICAL_SPECIFICATIONS.md` section 4 (Monitoring Stack)
- Architecture: `/docs/architecture/BLOCKCHAIN_AGNOSTIC_DB_DESIGN.md` (multi-blockchain design)
- Pattern: Create `/monitoring/` directory for all monitoring components
- Integration: Health endpoints in backend and multi-blockchain provider metrics

## Objective
Set up comprehensive monitoring for the KYC platform including Prometheus for metrics collection, Grafana for visualization, and multi-blockchain network monitoring (Hyperledger Explorer for Fabric, web3 monitoring for EVM chains).

## Detailed Implementation Instructions

### Step 1: Create Monitoring Directory Structure
**Action**: Create monitoring infrastructure directory

```bash
mkdir -p monitoring/{prometheus,grafana,explorer}
mkdir -p monitoring/grafana/{dashboards,provisioning}
mkdir -p monitoring/prometheus/{rules,config}
```

### Step 2: Create Prometheus Configuration
**File**: `/monitoring/prometheus/prometheus.yml`
**Action**: Configure Prometheus to scrape metrics from all services

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  # NestJS backend metrics
  - job_name: 'nestjs-backend'
    static_configs:
      - targets: ['host.docker.internal:3000']
    metrics_path: '/api/v1/metrics'
    scrape_interval: 5s
    scrape_timeout: 5s

  # Hyperledger Fabric Peer metrics
  - job_name: 'fabric-peer'
    static_configs:
      - targets: ['host.docker.internal:9443']
    metrics_path: '/metrics'
    scrape_interval: 10s

  # Hyperledger Fabric Orderer metrics
  - job_name: 'fabric-orderer'
    static_configs:
      - targets: ['host.docker.internal:8443']
    metrics_path: '/metrics'
    scrape_interval: 10s

  # PostgreSQL database metrics
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres_exporter:9187']
    scrape_interval: 30s

  # System metrics
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 15s

  # Docker metrics
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
    scrape_interval: 15s
```

### Step 3: Create Prometheus Alert Rules
**File**: `/monitoring/prometheus/rules/kyc-platform.yml`
**Action**: Define alert rules for KYC platform monitoring

```yaml
groups:
  - name: kyc-platform-alerts
    rules:
      # Backend service alerts
      - alert: BackendServiceDown
        expr: up{job="nestjs-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Backend service is down"
          description: "NestJS backend service has been down for more than 1 minute"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="nestjs-backend"}[5m])) > 2
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is above 2 seconds"

      - alert: HighErrorRate
        expr: rate(http_requests_total{job="nestjs-backend",status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "HTTP 5xx error rate is above 10%"

      # Fabric network alerts
      - alert: FabricPeerDown
        expr: up{job="fabric-peer"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Fabric peer is down"
          description: "Hyperledger Fabric peer has been down for more than 1 minute"

      - alert: FabricOrdererDown
        expr: up{job="fabric-orderer"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Fabric orderer is down"
          description: "Hyperledger Fabric orderer has been down for more than 1 minute"

      # Database alerts
      - alert: DatabaseDown
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL database is down"
          description: "PostgreSQL database has been down for more than 1 minute"

      - alert: HighDatabaseConnections
        expr: pg_stat_database_numbackends > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connection count"
          description: "PostgreSQL has more than 80 active connections"
```

### Step 4: Create Docker Compose for Monitoring Stack
**File**: `/monitoring/docker-compose.yml`
**Action**: Define monitoring stack services

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:v2.45.0
    container_name: kyc-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./prometheus/rules:/etc/prometheus/rules:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=30d'
      - '--web.enable-lifecycle'
      - '--web.enable-admin-api'
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:10.0.0
    container_name: kyc-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning:ro
      - ./grafana/dashboards:/var/lib/grafana/dashboards:ro
    networks:
      - monitoring

  hyperledger-explorer:
    image: hyperledger/explorer:latest
    container_name: kyc-explorer
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      - DATABASE_HOST=explorer-db
      - DATABASE_DATABASE=fabricexplorer
      - DATABASE_USERNAME=hppoc
      - DATABASE_PASSWD=password
    volumes:
      - ./explorer/config.json:/opt/explorer/app/platform/fabric/config.json:ro
      - ./explorer/connection-profile:/opt/explorer/app/platform/fabric/connection-profile:ro
      - ../fabric-network/organizations:/opt/explorer/organizations:ro
    depends_on:
      - explorer-db
    networks:
      - monitoring
      - fabric

  explorer-db:
    image: hyperledger/explorer-db:latest
    container_name: kyc-explorer-db
    restart: unless-stopped
    environment:
      - DATABASE_DATABASE=fabricexplorer
      - DATABASE_USERNAME=hppoc
      - DATABASE_PASSWORD=password
    volumes:
      - explorer_db_data:/var/lib/postgresql/data
    networks:
      - monitoring

  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:v0.13.2
    container_name: kyc-postgres-exporter
    restart: unless-stopped
    environment:
      - DATA_SOURCE_NAME=postgresql://username:password@host.docker.internal:5432/kyc_platform?sslmode=disable
    ports:
      - "9187:9187"
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:v1.6.0
    container_name: kyc-node-exporter
    restart: unless-stopped
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - monitoring

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.0
    container_name: kyc-cadvisor
    restart: unless-stopped
    ports:
      - "8081:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:rw
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge
  fabric:
    external: true
    name: fabric_test

volumes:
  prometheus_data:
  grafana_data:
  explorer_db_data:
```

### Step 5: Create Grafana Dashboard for KYC Platform
**File**: `/monitoring/grafana/dashboards/kyc-platform-dashboard.json`
**Action**: Create comprehensive dashboard for KYC platform metrics

```json
{
  "dashboard": {
    "id": null,
    "title": "KYC Attestation Platform Overview",
    "tags": ["kyc", "blockchain", "nestjs"],
    "timezone": "browser",
    "refresh": "30s",
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "panels": [
      {
        "id": 1,
        "title": "System Overview",
        "type": "stat",
        "gridPos": {"h": 8, "w": 24, "x": 0, "y": 0},
        "targets": [
          {
            "expr": "up{job='nestjs-backend'}",
            "legendFormat": "Backend Status"
          },
          {
            "expr": "up{job='fabric-peer'}",
            "legendFormat": "Fabric Peer Status"
          },
          {
            "expr": "up{job='postgres'}",
            "legendFormat": "Database Status"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "color": {"mode": "thresholds"},
            "mappings": [
              {"options": {"0": {"text": "DOWN", "color": "red"}}, "type": "value"},
              {"options": {"1": {"text": "UP", "color": "green"}}, "type": "value"}
            ],
            "thresholds": {
              "steps": [
                {"color": "red", "value": null},
                {"color": "green", "value": 1}
              ]
            }
          }
        }
      },
      {
        "id": 2,
        "title": "HTTP Request Rate",
        "type": "graph",
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8},
        "targets": [
          {
            "expr": "rate(http_requests_total{job='nestjs-backend'}[5m])",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "id": 3,
        "title": "Response Time (95th percentile)",
        "type": "graph",
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 8},
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job='nestjs-backend'}[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "id": 4,
        "title": "Blockchain Transactions",
        "type": "graph",
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 16},
        "targets": [
          {
            "expr": "increase(fabric_ledger_blockchain_height[5m])",
            "legendFormat": "Blocks Created"
          }
        ]
      },
      {
        "id": 5,
        "title": "Database Connections",
        "type": "graph",
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 16},
        "targets": [
          {
            "expr": "pg_stat_database_numbackends",
            "legendFormat": "Active Connections"
          }
        ]
      }
    ]
  }
}
```

### Step 6: Create NestJS Health Check and Metrics Endpoint
**File**: `/apps/backend/src/health/health.controller.ts`
**Action**: Create health check endpoints for monitoring

```typescript
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
```

### Step 7: Create Health Module
**File**: `/apps/backend/src/health/health.module.ts`
**Action**: Create health module for monitoring endpoints

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    BlockchainModule,
    DatabaseModule,
  ],
  controllers: [HealthController],
})
export class HealthModule {}
```

### Step 8: Create Monitoring Setup Script
**File**: `/monitoring/setup.sh`
**Action**: Create setup script for monitoring stack

```bash
#!/bin/bash

echo "Setting up KYC Platform Monitoring Stack..."

# Create required directories
mkdir -p {prometheus,grafana,explorer}/{data,config}

# Set proper permissions
sudo chown -R 472:472 grafana/
sudo chown -R 65534:65534 prometheus/

# Create Grafana provisioning configuration
cat > grafana/provisioning/dashboards.yaml << EOF
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
EOF

cat > grafana/provisioning/datasources.yaml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

# Start monitoring stack
echo "Starting monitoring services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 30

# Verify services are running
echo "Checking service status..."
docker-compose ps

echo "Monitoring stack setup complete!"
echo "Access points:"
echo "- Prometheus: http://localhost:9090"
echo "- Grafana: http://localhost:3001 (admin/admin123)"
echo "- Hyperledger Explorer: http://localhost:8080"
echo "- Node Exporter: http://localhost:9100"
echo "- cAdvisor: http://localhost:8081"
```

### Step 9: Update Backend Module
**File**: `/apps/backend/src/backend.module.ts`
**Action**: Add health module to main application

```typescript
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { HealthModule } from './health/health.module';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { DatabaseModule } from './database/database.module';
import { SecurityMiddleware } from './shared/middleware/security.middleware';
import { LoggingMiddleware } from './shared/middleware/logging.middleware';
import { createRateLimitConfig } from './shared/config/rate-limit.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: createRateLimitConfig,
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    BlockchainModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class BackendModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware, LoggingMiddleware)
      .forRoutes('*');
  }
}
```

## Acceptance Criteria
- [ ] **Functional**: All monitoring services start and collect metrics
- [ ] **Technical**: Grafana dashboards display KYC platform metrics
- [ ] **Integration**: Health endpoints respond correctly from backend
- [ ] **Testing**: Alerts trigger correctly for service failures
- [ ] **Documentation**: Monitoring setup is documented and reproducible

## Verification Steps
1. **Service Startup**: All monitoring services start without errors
2. **Metrics Collection**: Prometheus scrapes metrics from all targets
3. **Dashboard Display**: Grafana shows KYC platform dashboard
4. **Health Checks**: Backend health endpoints return correct status
5. **Alert Testing**: Test alert rules by simulating failures
6. **Explorer Access**: Hyperledger Explorer shows blockchain data

## Expected Deliverables
- [ ] Complete monitoring stack with Docker Compose
- [ ] Prometheus configuration with KYC-specific metrics
- [ ] Grafana dashboards for platform monitoring
- [ ] Hyperledger Explorer for blockchain monitoring
- [ ] NestJS health check endpoints
- [ ] Alert rules for critical system components

## Error Handling Requirements
- Configure proper timeout values for health checks
- Add retry logic for metric collection failures
- Include comprehensive error logging for debugging
- Set up alert routing for different severity levels

## References
- **Architecture**: `/docs/TECHNICAL_SPECIFICATIONS.md` Section 4
- **Health Checks**: NestJS Terminus documentation
- **Prometheus**: https://prometheus.io/docs/
- **Grafana**: https://grafana.com/docs/

## Notes for AI
- Use exact file paths from project root
- Follow Docker Compose best practices
- Configure proper resource limits for containers
- Add comprehensive health checks for all services
- Test monitoring stack with actual metrics
- Ensure proper permissions for data volumes

## Progress Log
- **Created**: 2024-01-15
- **Started**: 
- **Last Update**: 
- **Completed**: 

## Status History
- 2024-01-15 - Created in todo/ - **Started**: Sun Sep  7 08:01:44 PDT 2025
- **Last Update**: Sun Sep  7 08:01:44 PDT 2025 - Started implementation
