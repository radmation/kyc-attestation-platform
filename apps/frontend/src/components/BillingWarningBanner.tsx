import React, { useState, useEffect } from 'react';

interface BillingStatus {
  billingStatus: string;
  gracePeriodEndsAt: string | null;
  lastPaymentFailedAt: string | null;
  subscriptionId: string | null;
}

const BillingWarningBanner: React.FC = () => {
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

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

      if (response.ok) {
        const data = await response.json();
        setBillingStatus(data);
      }
    } catch (error) {
      console.error('Error fetching billing status:', error);
    }
  };

  const openCustomerPortal = async () => {
    try {
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

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
    }
  };

  // Don't show banner if dismissed or if not in past due status
  if (dismissed || !billingStatus || billingStatus.billingStatus !== 'PAST_DUE' || !billingStatus.gracePeriodEndsAt) {
    return null;
  }

  const gracePeriodDays = Math.ceil(
    (new Date(billingStatus.gracePeriodEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-red-800">
              Payment Failed - Action Required
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>
                Your payment has failed and your account will be suspended in{' '}
                <strong>{gracePeriodDays} days</strong> on{' '}
                {formatDate(billingStatus.gracePeriodEndsAt)}.{' '}
                Please update your payment method to avoid service interruption.
              </p>
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={openCustomerPortal}
                className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Update Payment Method
              </button>
              <a
                href="/billing"
                className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200"
              >
                View Billing Details
              </a>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={() => setDismissed(true)}
            className="text-red-400 hover:text-red-500"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingWarningBanner; 