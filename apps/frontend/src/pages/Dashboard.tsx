import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, User, CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import BillingWarningBanner from '../components/BillingWarningBanner';

const Dashboard: React.FC = () => {
  // Mock data for demo
  const kycStatus = 'pending' as 'pending' | 'verified' | 'rejected';
  const userName = 'John Doe';

  const getStatusBadge = () => {
    switch (kycStatus) {
      case 'verified':
        return (
          <span className="badge-default flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Verified</span>
          </span>
        );
      case 'pending':
        return (
          <span className="badge-outline flex items-center space-x-1 text-warning border-warning">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="badge-destructive flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  const quickActions = [
    {
      title: 'Complete KYC Verification',
      description: 'Verify your identity to access all features',
      icon: Shield,
      href: '/kyc',
      variant: 'primary' as const,
      show: kycStatus !== 'verified',
    },
    {
      title: 'Update Profile',
      description: 'Keep your information up to date',
      icon: User,
      href: '/profile',
      variant: 'secondary' as const,
      show: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Billing Warning Banner */}
      <BillingWarningBanner />
      
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Welcome back, {userName}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Here's your KYC attestation dashboard
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KYC Status Card */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="card-title flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>KYC Status</span>
              </h3>
              {getStatusBadge()}
            </div>
          </div>
          <div className="card-content">
            <p className="text-sm text-muted-foreground">
              {kycStatus === 'verified' && 'Your identity has been successfully verified.'}
              {kycStatus === 'pending' && 'Your verification is being reviewed by our team.'}
              {kycStatus === 'rejected' && 'Please resubmit your verification documents.'}
            </p>
          </div>
        </div>

        {/* Attestations Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Attestations</h3>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold text-primary">
              {kycStatus === 'verified' ? '1' : '0'}
            </div>
            <p className="text-sm text-muted-foreground">
              On-chain attestations issued
            </p>
          </div>
        </div>

        {/* Wallet Addresses Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Wallet Addresses</h3>
          </div>
          <div className="card-content">
            <div className="text-2xl font-bold text-primary">2</div>
            <p className="text-sm text-muted-foreground">
              Verified wallet addresses
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions
            .filter(action => action.show)
            .map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  to={action.href}
                  className="card interactive hover:shadow-medium"
                >
                  <div className="card-content">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        action.variant === 'primary' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-secondary-foreground'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {action.description}
                        </p>
                        <div className="flex items-center text-sm text-primary">
                          <span>Get started</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Recent Activity</h2>
        <div className="card">
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Profile updated
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You updated your profile information
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">2 hours ago</span>
              </div>
              
              {kycStatus === 'pending' && (
                <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      KYC verification submitted
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your documents are being reviewed
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">1 day ago</span>
                </div>
              )}
              
              <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    Account created
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Welcome to the KYC Platform!
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">3 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 