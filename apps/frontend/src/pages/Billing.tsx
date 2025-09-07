import React, { useState, useEffect } from 'react';

interface BillingStatus {
  billingStatus: string;
  gracePeriodEndsAt: string | null;
  lastPaymentFailedAt: string | null;
  subscriptionId: string | null;
}

const Billing: React.FC = () => {
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    fetchBillingStatus();
  }, []);

  const fetchBillingStatus = async () => {
    try {
      const response = await fetch('/api/billing/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch billing status');
      }

      const data = await response.json();
      setBillingStatus(data);
    } catch (error) {
      console.error('Error fetching billing status:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    try {
      setPortalLoading(true);
      
      const response = await fetch('/api/billing/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      alert('Failed to open billing portal. Please try again.');
    } finally {
      setPortalLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'TRIAL':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'PAST_DUE':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'SUSPENDED':
      case 'CANCELED':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'TRIAL':
        return 'Trial';
      case 'PAST_DUE':
        return 'Past Due';
      case 'SUSPENDED':
        return 'Suspended';
      case 'CANCELED':
        return 'Canceled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Billing</h1>
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isInGracePeriod = billingStatus?.billingStatus === 'PAST_DUE' && billingStatus?.gracePeriodEndsAt;
  const gracePeriodDays = isInGracePeriod 
    ? Math.ceil((new Date(billingStatus.gracePeriodEndsAt!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Billing & Subscription</h1>

      {/* Grace Period Warning */}
      {isInGracePeriod && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Payment Failed - Action Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your payment has failed and your account is in a grace period. 
                  You have <strong>{gracePeriodDays} days remaining</strong> until {formatDate(billingStatus.gracePeriodEndsAt)} 
                  to update your payment method or your service will be suspended.
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={openCustomerPortal}
                  disabled={portalLoading}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                >
                  {portalLoading ? 'Loading...' : 'Update Payment Method'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription Status */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Subscription Status</h2>
          <p className="card-description">Current billing information and subscription details</p>
        </div>
        <div className="card-content space-y-4">
          {billingStatus && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(billingStatus.billingStatus)}`}>
                  {getStatusText(billingStatus.billingStatus)}
                </span>
              </div>

              {billingStatus.subscriptionId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Subscription ID:</span>
                  <span className="text-sm text-foreground font-mono">{billingStatus.subscriptionId}</span>
                </div>
              )}

              {billingStatus.lastPaymentFailedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Last Payment Failed:</span>
                  <span className="text-sm text-foreground">{formatDate(billingStatus.lastPaymentFailedAt)}</span>
                </div>
              )}

              {billingStatus.gracePeriodEndsAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Grace Period Ends:</span>
                  <span className="text-sm text-foreground">{formatDate(billingStatus.gracePeriodEndsAt)}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Billing Management */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Billing Management</h2>
          <p className="card-description">Manage your subscription, payment methods, and view invoices</p>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h3 className="font-medium text-foreground">Customer Portal</h3>
                <p className="text-sm text-muted-foreground">
                  Update payment methods, view invoices, and manage your subscription
                </p>
              </div>
              <button
                onClick={openCustomerPortal}
                disabled={portalLoading}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {portalLoading ? 'Loading...' : 'Manage Billing'}
              </button>
            </div>

            {(!billingStatus?.subscriptionId || billingStatus.billingStatus === 'CANCELED') && (
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h3 className="font-medium text-foreground">Subscribe to a Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a subscription plan to access all features
                  </p>
                </div>
                <a
                  href="/pricing"
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80"
                >
                  View Plans
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Billing Information</h2>
          <p className="card-description">Important billing policies and information</p>
        </div>
        <div className="card-content">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              • Subscriptions are billed monthly in advance
            </p>
            <p>
              • Failed payments trigger a 21-day grace period before service suspension
            </p>
            <p>
              • You can cancel your subscription at any time through the customer portal
            </p>
            <p>
              • Refunds are processed according to our terms of service
            </p>
            <p>
              • For billing support, contact our team at billing@example.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing; 