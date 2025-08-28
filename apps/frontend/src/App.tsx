import React, { useState } from 'react';
import { ThemeProvider, useTheme, useBranding } from './contexts/ThemeContext';

/**
 * Demo component to showcase themed components
 */
const ThemedComponentsDemo: React.FC = () => {
  const { theme, mode, isDark, toggleMode, applyCustomTheme, resetTheme } = useTheme();
  const { branding, clearBranding } = useBranding();
  const [customPrimary, setCustomPrimary] = useState('#0284c7');
  const [customSecondary, setCustomSecondary] = useState('#f1f5f9');

  const handleApplyCustomColors = () => {
    applyCustomTheme({
      primary: customPrimary,
      secondary: customSecondary,
    });
  };

  const handleLoadDemoeBranding = () => {
    // Simulate loading demo branding
    const demoBranding = {
      id: 'demo-1',
      clientId: 'demo-client',
      primaryColor: '#7c3aed',
      secondaryColor: '#f3f4f6',
      logoUrl: 'https://via.placeholder.com/150x50/7c3aed/ffffff?text=DEMO',
      logoAlt: 'Demo Company',
      isActive: true,
      client: {
        id: 'demo-client',
        name: 'Demo Company',
        slug: 'demo',
      },
    };
    
    // Simulate API response
    setTimeout(() => {
      // Mock applying branding
      applyCustomTheme({
        primary: demoBranding.primaryColor,
        secondary: demoBranding.secondaryColor,
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header with theme controls */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold brand-primary">
                KYC Attestation Platform
              </h1>
              <p className="text-muted-foreground mt-2">
                Centralized Theming System Demo
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleMode}
                className="btn-outline btn-sm"
              >
                {isDark ? '☀️' : '🌙'} {mode === 'system' ? 'System' : mode}
              </button>
              
              <button
                onClick={resetTheme}
                className="btn-secondary btn-sm"
              >
                Reset Theme
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Theme Control Panel */}
        <section className="mb-12">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Theme Control Panel</h2>
              <p className="card-description">
                Customize colors and test white-labeling features
              </p>
            </div>
            <div className="card-content">
              <div className="responsive-flex">
                {/* Custom Colors */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-semibold">Custom Colors</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="label">Primary Color</label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={customPrimary}
                          onChange={(e) => setCustomPrimary(e.target.value)}
                          className="w-12 h-10 rounded border border-input"
                        />
                        <input
                          type="text"
                          value={customPrimary}
                          onChange={(e) => setCustomPrimary(e.target.value)}
                          className="input flex-1"
                          placeholder="#0284c7"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="label">Secondary Color</label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={customSecondary}
                          onChange={(e) => setCustomSecondary(e.target.value)}
                          className="w-12 h-10 rounded border border-input"
                        />
                        <input
                          type="text"
                          value={customSecondary}
                          onChange={(e) => setCustomSecondary(e.target.value)}
                          className="input flex-1"
                          placeholder="#f1f5f9"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={handleApplyCustomColors}
                      className="btn-primary"
                    >
                      Apply Custom Colors
                    </button>
                  </div>
                </div>

                {/* White-labeling Demo */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-semibold">White-labeling Demo</h3>
                  <div className="space-y-3">
                    <button
                      onClick={handleLoadDemoeBranding}
                      className="btn-primary w-full"
                    >
                      Load Demo Branding
                    </button>
                    
                    <button
                      onClick={clearBranding}
                      className="btn-outline w-full"
                    >
                      Clear Branding
                    </button>
                    
                    {branding && (
                      <div className="alert alert-info">
                        <strong>Active Branding:</strong> {branding.client?.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Component Showcase */}
        <section className="mb-12">
          <div className="section-header">
            <h2 className="section-title">Themed Component Showcase</h2>
            <p className="section-description">
              All components automatically inherit the centralized theme
            </p>
          </div>
          
          <div className="responsive-grid">
            {/* Buttons */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Buttons</h3>
              </div>
              <div className="card-content space-y-3">
                <button className="btn-primary btn-sm">Primary Small</button>
                <button className="btn-primary btn-md">Primary Medium</button>
                <button className="btn-primary btn-lg">Primary Large</button>
                <button className="btn-secondary btn-md">Secondary</button>
                <button className="btn-outline btn-md">Outline</button>
                <button className="btn-ghost btn-md">Ghost</button>
                <button className="btn-destructive btn-md">Destructive</button>
              </div>
            </div>

            {/* Form Elements */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Form Elements</h3>
              </div>
              <div className="card-content space-y-4">
                <div>
                  <label className="label">Text Input</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Enter text..."
                  />
                </div>
                <div>
                  <label className="label">Textarea</label>
                  <textarea 
                    className="textarea" 
                    placeholder="Enter message..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="label">Select</label>
                  <select className="input">
                    <option>Choose option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Badges and Alerts */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Badges & Alerts</h3>
              </div>
              <div className="card-content space-y-4">
                <div className="space-y-2">
                  <span className="badge-default">Default</span>
                  <span className="badge-secondary">Secondary</span>
                  <span className="badge-destructive">Destructive</span>
                  <span className="badge-outline">Outline</span>
                </div>
                
                <div className="alert alert-success">
                  <strong>Success!</strong> This is a success message.
                </div>
                
                <div className="alert alert-warning">
                  <strong>Warning!</strong> This is a warning message.
                </div>
                
                <div className="alert alert-destructive">
                  <strong>Error!</strong> This is an error message.
                </div>
              </div>
            </div>

            {/* Interactive Elements */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Interactive Elements</h3>
              </div>
              <div className="card-content space-y-4">
                <div className="interactive brand-primary-bg text-white p-4 rounded cursor-pointer">
                  Hover me! (Interactive utility)
                </div>
                
                <div className="gradient-primary text-white p-4 rounded">
                  Gradient Background
                </div>
                
                <div className="glass p-4 rounded">
                  Glass Morphism Effect
                </div>
                
                <div className="animate-fade-in p-4 bg-accent rounded">
                  Animated Element
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Current Theme Information */}
        <section>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Current Theme Configuration</h2>
              <p className="card-description">
                Live theme state - updates automatically when theme changes
              </p>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Colors</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: theme.primaryColor }}
                      />
                      <span>Primary: {theme.primaryColor}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: theme.secondaryColor }}
                      />
                      <span>Secondary: {theme.secondaryColor}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div>Mode: <span className="badge-outline">{mode}</span></div>
                    <div>Dark Mode: <span className="badge-outline">{isDark ? 'Yes' : 'No'}</span></div>
                    <div>Border Radius: {theme.borderRadius}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

/**
 * Main App component with ThemeProvider wrapper
 */
const App: React.FC = () => {
  return (
    <ThemeProvider defaultMode="system">
      <ThemedComponentsDemo />
    </ThemeProvider>
  );
};

export default App;
