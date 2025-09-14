import React, { useState, useEffect } from 'react';
import { 
  User, 
  CreditCard, 
  Upload, 
  Save,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import apiClient, { type BrandingData } from '../../lib/api';

const ClientSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'billing'>('profile');
  const [profileForm, setProfileForm] = useState({
    companyName: '',
    contactEmail: '',
    themeColor: '#3b82f6',
    logo: null as File | null
  });
  const [currentBranding, setCurrentBranding] = useState<BrandingData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Load current branding data
  useEffect(() => {
    loadBrandingData();
  }, []);

  const loadBrandingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getBranding();
      if (response.success && response.data) {
        const brandingData = response.data;
        setCurrentBranding(brandingData);
        setProfileForm(prev => ({
          ...prev,
          themeColor: brandingData.primaryColor || '#3b82f6',
        }));
      }
    } catch (err) {
      setError('Failed to load branding settings');
      console.error('Error loading branding:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, name: 'Profile', icon: User },
    { id: 'billing' as const, name: 'Billing', icon: CreditCard }
  ];

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (file.type.startsWith('image/') && file.size <= 2 * 1024 * 1024) {
        setProfileForm({ ...profileForm, logo: file });
      } else {
        alert('Please upload a valid image file (max 2MB)');
      }
    }
  };

  const handleProfileSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setError(null);
    
    try {
      // First upload logo if provided
      let logoUrl = currentBranding?.logoUrl;
      if (profileForm.logo) {
        const logoResponse = await apiClient.uploadLogo(profileForm.logo);
        if (logoResponse.success) {
          logoUrl = logoResponse.data?.logoUrl;
        } else {
          throw new Error(logoResponse.error || 'Failed to upload logo');
        }
      }

      // Update branding settings
      const brandingData: Partial<BrandingData> = {
        primaryColor: profileForm.themeColor,
        logoUrl: logoUrl,
      };

      const response = await apiClient.updateBranding(brandingData);
      
      if (response.success) {
        setSaveStatus('success');
        setCurrentBranding(response.data || null);
        // Clear the logo file since it's been uploaded
        setProfileForm(prev => ({ ...prev, logo: null }));
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error(response.error || 'Failed to save settings');
      }
    } catch (err) {
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenCustomerPortal = async () => {
    try {
      const response = await apiClient.createCustomerPortalSession();
      if (response.success && response.data?.url) {
        window.open(response.data.url, '_blank');
      } else {
        setError(response.error || 'Failed to open customer portal');
      }
    } catch (err) {
      setError('Failed to open customer portal');
      console.error('Failed to open customer portal:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Company Profile Section */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Company Profile</h2>
                <p className="card-description">
                  Update your company information and branding
                </p>
              </div>
              <div className="card-content space-y-6">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.companyName}
                    onChange={(e) => setProfileForm({...profileForm, companyName: e.target.value})}
                    className="input-field w-full max-w-md"
                    placeholder="Your Company Name"
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.contactEmail}
                    onChange={(e) => setProfileForm({...profileForm, contactEmail: e.target.value})}
                    className="input-field w-full max-w-md"
                    placeholder="admin@company.com"
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Company Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      {profileForm.logo ? (
                        <img 
                          src={URL.createObjectURL(profileForm.logo)} 
                          alt="Logo preview" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : currentBranding?.logoUrl ? (
                        <img 
                          src={currentBranding.logoUrl} 
                          alt="Current logo" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="logo-upload"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <label htmlFor="logo-upload" className="btn-outline cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG or SVG. Max 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Theme Color */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Brand Color
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={profileForm.themeColor}
                      onChange={(e) => setProfileForm({...profileForm, themeColor: e.target.value})}
                      className="w-12 h-10 border border-border rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={profileForm.themeColor}
                      onChange={(e) => setProfileForm({...profileForm, themeColor: e.target.value})}
                      className="input-field w-32"
                      placeholder="#3b82f6"
                    />
                    <div 
                      className="w-8 h-8 rounded-full border border-border"
                      style={{ backgroundColor: profileForm.themeColor }}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center space-x-4 pt-4">
                  <button 
                    onClick={handleProfileSave}
                    disabled={isSaving}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  
                  {saveStatus === 'success' && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Settings saved successfully</span>
                    </div>
                  )}
                  
                  {saveStatus === 'error' && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Failed to save settings</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Billing Overview */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Billing & Subscription</h2>
                <p className="card-description">
                  Manage your subscription and billing information
                </p>
              </div>
              <div className="card-content space-y-6">
                {/* Current Plan */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h3 className="font-medium text-foreground">Professional Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      $99/month • Up to 5,000 verifications
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">Next billing: March 15, 2024</p>
                    <p className="text-sm text-muted-foreground">Auto-renewal enabled</p>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Verifications Used</p>
                    <p className="text-xl font-bold text-foreground">1,247 / 5,000</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Team Members</p>
                    <p className="text-xl font-bold text-foreground">3 / 10</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">API Calls</p>
                    <p className="text-xl font-bold text-foreground">12,584</p>
                  </div>
                </div>

                {/* Stripe Customer Portal */}
                <div className="border border-border rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground mb-2">
                        Manage Billing Details
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Update your payment methods, billing information, and download invoices 
                        through our secure billing portal powered by Stripe.
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Update payment methods</li>
                        <li>• View and download invoices</li>
                        <li>• Update billing address</li>
                        <li>• Manage subscription</li>
                      </ul>
                    </div>
                    <CreditCard className="w-12 h-12 text-primary" />
                  </div>
                  
                  <button 
                    onClick={handleOpenCustomerPortal}
                    className="btn-primary flex items-center space-x-2 mt-4"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Billing Portal</span>
                  </button>
                </div>

                {/* Payment History Preview */}
                <div>
                  <h3 className="font-medium text-foreground mb-4">Recent Invoices</h3>
                  <div className="space-y-3">
                    {[
                      { id: 'inv_001', date: 'Feb 15, 2024', amount: '$99.00', status: 'Paid' },
                      { id: 'inv_002', date: 'Jan 15, 2024', amount: '$99.00', status: 'Paid' },
                      { id: 'inv_003', date: 'Dec 15, 2023', amount: '$99.00', status: 'Paid' }
                    ].map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">Invoice #{invoice.id}</p>
                          <p className="text-sm text-muted-foreground">{invoice.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{invoice.amount}</p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSettings; 