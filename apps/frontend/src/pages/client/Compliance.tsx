import React from 'react';
import { 
  Shield, 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Users,
  Activity
} from 'lucide-react';

const ClientCompliance: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Compliance Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitor compliance status and generate reports
        </p>
      </div>

      {/* Coming Soon Alert */}
      <div className="card border-amber-200 bg-amber-50">
        <div className="card-content p-6">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-amber-600" />
            <div>
              <h3 className="text-lg font-medium text-amber-800">Coming Soon</h3>
              <p className="text-amber-700 mt-1">
                The compliance dashboard is currently under development. This section will include:
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="font-medium text-foreground">Compliance Reports</h3>
                <p className="text-sm text-muted-foreground">Generate regulatory compliance reports</p>
              </div>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Monthly verification summaries</li>
              <li>• Regulatory audit trails</li>
              <li>• Risk assessment reports</li>
              <li>• Custom date range exports</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="font-medium text-foreground">Attestation Status</h3>
                <p className="text-sm text-muted-foreground">Track on-chain attestation compliance</p>
              </div>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Active attestations monitoring</li>
              <li>• Expired attestations alerts</li>
              <li>• Blockchain confirmation status</li>
              <li>• Smart contract interactions</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="font-medium text-foreground">User Verification</h3>
                <p className="text-sm text-muted-foreground">Monitor user verification pipeline</p>
              </div>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Verification status dashboard</li>
              <li>• Failed verification analysis</li>
              <li>• Manual review queue</li>
              <li>• Verification metrics</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-content p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-8 h-8 text-orange-500" />
              <div>
                <h3 className="font-medium text-foreground">Risk Monitoring</h3>
                <p className="text-sm text-muted-foreground">Real-time risk assessment and alerts</p>
              </div>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Sanctions list screening</li>
              <li>• Adverse media monitoring</li>
              <li>• Risk score calculations</li>
              <li>• Automated alert system</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Placeholder Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-content p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">Compliance Status</h3>
            <p className="text-2xl font-bold text-green-600 mb-1">98.5%</p>
            <p className="text-sm text-muted-foreground">All systems operational</p>
          </div>
        </div>

        <div className="card">
          <div className="card-content p-6 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">Pending Reviews</h3>
            <p className="text-2xl font-bold text-amber-600 mb-1">12</p>
            <p className="text-sm text-muted-foreground">Manual reviews required</p>
          </div>
        </div>

        <div className="card">
          <div className="card-content p-6 text-center">
            <Download className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="font-medium text-foreground mb-2">Reports Ready</h3>
            <p className="text-2xl font-bold text-blue-600 mb-1">3</p>
            <p className="text-sm text-muted-foreground">Available for download</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCompliance; 