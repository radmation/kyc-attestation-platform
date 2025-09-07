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