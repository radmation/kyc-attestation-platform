import React, { useState } from 'react';
// import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe (future use for direct Stripe integration)
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PricingPlan {
  name: string;
  priceId: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    priceId: 'price_starter', // Replace with actual Stripe price ID
    price: '$99',
    period: 'per month',
    description: 'Perfect for small token projects getting started with compliance',
    features: [
      'Up to 1,000 KYC verifications per month',
      'Basic identity attestations',
      'Email support',
      'Standard API access',
      'Basic dashboard',
    ],
  },
  {
    name: 'Professional',
    priceId: 'price_professional', // Replace with actual Stripe price ID
    price: '$299',
    period: 'per month',
    description: 'Ideal for growing projects with advanced compliance needs',
    features: [
      'Up to 10,000 KYC verifications per month',
      'Advanced identity attestations',
      'Priority support',
      'Full API access',
      'Advanced dashboard & analytics',
      'Custom branding',
      'Webhook integration',
      'Bulk verification tools',
    ],
    popular: true,
  },
];

const Pricing: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(priceId);
      
      // Create checkout session
      const response = await fetch('/api/billing/checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/pricing?subscription=cancelled`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout process. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select the perfect plan for your token project's compliance needs. 
            All plans include our core KYC verification and attestation services.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.priceId}
              className={`card relative ${
                plan.popular
                  ? 'border-primary shadow-lg scale-105'
                  : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="card-header text-center">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-2">
                    {plan.period}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="card-content">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg
                        className="w-5 h-5 text-primary mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={loading === plan.priceId}
                  className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  } ${
                    loading === plan.priceId
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {loading === plan.priceId ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    `Get Started with ${plan.name}`
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Need a Custom Solution?
          </h2>
          <p className="text-muted-foreground mb-6">
            For enterprise needs or custom requirements, contact our team for a tailored solution.
          </p>
          <button className="bg-outline text-foreground hover:bg-muted px-6 py-3 rounded-md font-medium transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pricing; 