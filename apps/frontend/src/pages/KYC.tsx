import React, { useState } from 'react';
import { Shield, Upload, CheckCircle, AlertCircle } from 'lucide-react';

const KYC: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartVerification = () => {
    setIsLoading(true);
    // Simulate API call to iDenfy
    setTimeout(() => {
      setStep(2);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground flex items-center justify-center space-x-2">
          <Shield className="w-8 h-8 text-primary" />
          <span>KYC Verification</span>
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Verify your identity to access all platform features
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((stepNumber) => (
          <div key={stepNumber} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > stepNumber ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                stepNumber
              )}
            </div>
            {stepNumber < 3 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  step > stepNumber ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Start Your Verification</h2>
            <p className="card-description">
              We'll need to verify your identity using government-issued documents
            </p>
          </div>
          <div className="card-content space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground">Quick & Secure</h3>
                  <p className="text-sm text-muted-foreground">
                    Identity verification typically takes 2-3 minutes
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground">Bank-Level Security</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is encrypted and never stored longer than necessary
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground">Global Coverage</h3>
                  <p className="text-sm text-muted-foreground">
                    Supports documents from 190+ countries
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">You'll need:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Government-issued photo ID (passport, driver's license, etc.)</li>
                <li>• Good lighting and a stable internet connection</li>
                <li>• About 3-5 minutes of your time</li>
              </ul>
            </div>

            <button
              onClick={handleStartVerification}
              disabled={isLoading}
              className="btn-primary btn-lg w-full flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="loading-spinner w-4 h-4"></div>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Start Verification</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Document Verification</h2>
            <p className="card-description">
              Upload or take photos of your documents
            </p>
          </div>
          <div className="card-content space-y-6">
            {/* Mock iDenfy Integration */}
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">
                iDenfy Verification Widget
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                In production, this would be the iDenfy iframe widget for document verification
              </p>
              <button
                onClick={() => setStep(3)}
                className="btn-primary"
              >
                Simulate Completion
              </button>
            </div>

            <div className="alert alert-info">
              <AlertCircle className="w-4 h-4" />
              <div>
                <strong>Demo Mode:</strong> This is a simulation of the iDenfy integration.
                In production, users would interact with the actual iDenfy verification widget.
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <div className="card-header text-center">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="card-title">Verification Submitted!</h2>
            <p className="card-description">
              Your documents have been submitted for review
            </p>
          </div>
          <div className="card-content space-y-6">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Our team will review your documents within 24-48 hours</li>
                <li>• You'll receive an email notification when the review is complete</li>
                <li>• Once approved, you'll have full access to all platform features</li>
              </ul>
            </div>

            <div className="alert alert-success">
              <CheckCircle className="w-4 h-4" />
              <div>
                <strong>Status:</strong> Your verification is being processed.
                You can track the progress from your dashboard.
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary w-full"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYC; 