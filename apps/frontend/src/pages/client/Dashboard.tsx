import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ShieldCheck, 
  Activity, 
  Settings,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const ClientDashboard: React.FC = () => {
  // Mock data for dashboard widgets
  const stats = [
    {
      title: 'Verified Users',
      value: '1,247',
      change: '+12%',
      trend: 'up',
      icon: ShieldCheck,
    },
    {
      title: 'Pending Verifications',
      value: '23',
      change: '-5%',
      trend: 'down',
      icon: Clock,
    },
    {
      title: 'On-Chain Attestations',
      value: '1,198',
      change: '+8%',
      trend: 'up',
      icon: Activity,
    },
    {
      title: 'Team Members',
      value: '5',
      change: '0%',
      trend: 'neutral',
      icon: Users,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'verification',
      message: 'New user verification completed',
      user: 'john.doe@email.com',
      time: '2 minutes ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'attestation',
      message: 'Attestation created on blockchain',
      user: 'jane.smith@email.com',
      time: '15 minutes ago',
      status: 'success',
    },
    {
      id: 3,
      type: 'team',
      message: 'New team member invited',
      user: 'admin@company.com',
      time: '1 hour ago',
      status: 'info',
    },
    {
      id: 4,
      type: 'verification',
      message: 'Verification requires manual review',
      user: 'suspicious@email.com',
      time: '2 hours ago',
      status: 'warning',
    },
  ];

  const quickActions = [
    {
      title: 'Invite Team Member',
      description: 'Add a new member to your team',
      icon: Users,
      href: '/client/team',
      variant: 'primary' as const,
    },
    {
      title: 'View Compliance Report',
      description: 'Download latest compliance report',
      icon: ShieldCheck,
      href: '/client/compliance',
      variant: 'secondary' as const,
    },
    {
      title: 'Update Settings',
      description: 'Configure your account settings',
      icon: Settings,
      href: '/client/settings',
      variant: 'outline' as const,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Activity className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, Acme Corp</h1>
        <p className="text-muted-foreground">
          Manage your KYC compliance and attestation platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
              <div className="card-content p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div className="mt-4 flex items-center">
                  <TrendingUp className={`w-4 h-4 mr-1 ${
                    stat.trend === 'up' ? 'text-green-500' : 
                    stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-500' : 
                    stat.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">from last month</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
              <p className="card-description">Latest updates from your platform</p>
            </div>
            <div className="card-content">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
                    {getStatusIcon(activity.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.message}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.user}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Quick Actions</h2>
              <p className="card-description">Common tasks and shortcuts</p>
            </div>
            <div className="card-content space-y-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.href}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors hover:bg-accent group ${
                      action.variant === 'primary' ? 'border-primary bg-primary/5' :
                      action.variant === 'secondary' ? 'border-secondary' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${
                        action.variant === 'primary' ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-foreground">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Status Overview */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">System Status</h2>
              <p className="card-description">Current platform status</p>
            </div>
            <div className="card-content space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">KYC Service</span>
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Blockchain Network</span>
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Status</span>
                <span className="flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard; 