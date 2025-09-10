import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  Upload, 
  Save,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ClientSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'billing'>('profile');
  const [profileForm, setProfileForm] = useState({
    companyName: 'Acme Corp',
    contactEmail: 'admin@acmecorp.com',
    themeColor: '#3b82f6',
    logo: null as File | null
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
    
    try {
      // TODO: Call the white-labeling API from P0-INF-008
      const formData = new FormData();
      formData.append('companyName', profileForm.companyName);
      formData.append('contactEmail', profileForm.contactEmail);
      formData.append('themeColor', profileForm.themeColor);
      if (profileForm.logo) {
        formData.append('logo', profileForm.logo);
      }

      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenCustomerPortal = async () => {
    try {
      // TODO: Call the Stripe Customer Portal endpoint from P1-CPP-001
      // This should redirect to Stripe's Customer Portal
      console.log('Opening Stripe Customer Portal...');
      
      // Mock redirect - replace with actual Stripe portal URL
      window.open('https://billing.stripe.com/p/login/test_customer_portal', '_blank');
    } catch (error) {
      console.error('Failed to open customer portal:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

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
                    <Save className="w-4 h-4" />
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