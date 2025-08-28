import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  setCSSProperty, 
  generateColorShades, 
  getContrastTextColor, 
  debounce,
  hexToHsl,
  isLightColor
} from '../lib/utils';

/**
 * Theme configuration interface defining all themeable properties
 */
export interface ThemeConfig {
  // Brand Colors
  primaryColor: string;
  secondaryColor: string;
  
  // Typography
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  
  // Spacing and Layout
  borderRadius: string;
  
  // Branding
  logo?: {
    url: string;
    alt: string;
  };
  
  // Custom properties for advanced theming
  customProperties?: Record<string, string>;
}

/**
 * Client branding configuration from API
 */
export interface ClientBranding {
  id: string;
  clientId: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  logoAlt?: string;
  fontFamily?: string;
  borderRadius?: string;
  customCss?: string;
  isActive: boolean;
  client?: {
    id: string;
    name: string;
    slug: string;
  };
}

/**
 * Theme modes
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme context value interface
 */
interface ThemeContextValue {
  // Theme state
  theme: ThemeConfig;
  mode: ThemeMode;
  isDark: boolean;
  
  // Client branding
  branding: ClientBranding | null;
  isLoadingBranding: boolean;
  brandingError: string | null;
  
  // Theme actions
  setTheme: (theme: Partial<ThemeConfig>) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  resetTheme: () => void;
  
  // Branding actions
  loadBranding: (clientId?: string) => Promise<void>;
  applyBranding: (branding: ClientBranding) => void;
  clearBranding: () => void;
  
  // Utility functions
  applyCustomTheme: (colors: { primary?: string; secondary?: string }) => void;
  exportTheme: () => string;
  importTheme: (themeJson: string) => boolean;
}

/**
 * Default theme configuration
 */
const defaultTheme: ThemeConfig = {
  primaryColor: '#0284c7',
  secondaryColor: '#f1f5f9',
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    serif: 'Georgia, serif',
    mono: 'JetBrains Mono, monospace',
  },
  borderRadius: '0.5rem',
};

/**
 * Create theme context
 */
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
  apiEndpoint?: string;
}

/**
 * Theme provider component with centralized theme management
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'system',
  storageKey = 'theme-preference',
  apiEndpoint = '/api/v1/branding',
}) => {
  // Theme state
  const [theme, setThemeState] = useState<ThemeConfig>(defaultTheme);
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [isDark, setIsDark] = useState(false);
  
  // Branding state
  const [branding, setBranding] = useState<ClientBranding | null>(null);
  const [isLoadingBranding, setIsLoadingBranding] = useState(false);
  const [brandingError, setBrandingError] = useState<string | null>(null);

  /**
   * Apply CSS custom properties to document root
   */
  const applyCSSProperties = useCallback((themeConfig: ThemeConfig) => {
    // Apply primary colors and shades (convert to HSL format)
    const primaryShades = generateColorShades(themeConfig.primaryColor);
    Object.entries(primaryShades).forEach(([shade, value]) => {
      setCSSProperty(`--color-primary-${shade}`, value);
    });
    const primaryHsl = hexToHsl(themeConfig.primaryColor);
    if (primaryHsl) {
      setCSSProperty('--color-primary', `${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%`);
    }
    const primaryForeground = isLightColor(themeConfig.primaryColor) ? '0 0% 0%' : '0 0% 100%';
    setCSSProperty('--color-primary-foreground', primaryForeground);

    // Apply secondary colors and shades (convert to HSL format)
    const secondaryShades = generateColorShades(themeConfig.secondaryColor);
    Object.entries(secondaryShades).forEach(([shade, value]) => {
      setCSSProperty(`--color-secondary-${shade}`, value);
    });
    const secondaryHsl = hexToHsl(themeConfig.secondaryColor);
    if (secondaryHsl) {
      setCSSProperty('--color-secondary', `${secondaryHsl.h} ${secondaryHsl.s}% ${secondaryHsl.l}%`);
    }
    const secondaryForeground = isLightColor(themeConfig.secondaryColor) ? '0 0% 0%' : '0 0% 100%';
    setCSSProperty('--color-secondary-foreground', secondaryForeground);

    // Apply typography
    setCSSProperty('--font-family-sans', themeConfig.fontFamily.sans);
    setCSSProperty('--font-family-serif', themeConfig.fontFamily.serif);
    setCSSProperty('--font-family-mono', themeConfig.fontFamily.mono);

    // Apply border radius
    setCSSProperty('--radius', themeConfig.borderRadius);

    // Apply custom properties
    if (themeConfig.customProperties) {
      Object.entries(themeConfig.customProperties).forEach(([property, value]) => {
        setCSSProperty(property, value);
      });
    }
  }, []);

  /**
   * Debounced CSS application for performance
   */
  const debouncedApplyCSSProperties = useCallback(
    debounce(applyCSSProperties, 100),
    [applyCSSProperties]
  );

  /**
   * Set theme with CSS property updates
   */
  const setTheme = useCallback((newTheme: Partial<ThemeConfig>) => {
    setThemeState(prevTheme => {
      const updatedTheme = { ...prevTheme, ...newTheme };
      debouncedApplyCSSProperties(updatedTheme);
      return updatedTheme;
    });
  }, [debouncedApplyCSSProperties]);

  /**
   * Set theme mode
   */
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(storageKey, newMode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }, [storageKey]);

  /**
   * Toggle between light and dark mode
   */
  const toggleMode = useCallback(() => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  }, [mode, setMode]);

  /**
   * Reset theme to default
   */
  const resetTheme = useCallback(() => {
    setThemeState(defaultTheme);
    applyCSSProperties(defaultTheme);
    setBranding(null);
  }, [applyCSSProperties]);

  /**
   * Load client branding from API
   */
  const loadBranding = useCallback(async (clientId?: string) => {
    if (!clientId) return;

    setIsLoadingBranding(true);
    setBrandingError(null);

    try {
      const response = await fetch(`${apiEndpoint}/${clientId}`);
      if (!response.ok) {
        throw new Error(`Failed to load branding: ${response.statusText}`);
      }

      const brandingData: ClientBranding = await response.json();
      setBranding(brandingData);
      applyBranding(brandingData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load branding';
      setBrandingError(errorMessage);
      console.error('Failed to load client branding:', error);
    } finally {
      setIsLoadingBranding(false);
    }
  }, [apiEndpoint]);

  /**
   * Apply client branding to theme
   */
  const applyBranding = useCallback((brandingConfig: ClientBranding) => {
    const brandedTheme: Partial<ThemeConfig> = {
      primaryColor: brandingConfig.primaryColor,
      secondaryColor: brandingConfig.secondaryColor,
    };

    if (brandingConfig.logoUrl) {
      brandedTheme.logo = {
        url: brandingConfig.logoUrl,
        alt: brandingConfig.logoAlt || brandingConfig.client?.name || 'Logo',
      };
    }

    if (brandingConfig.fontFamily) {
      brandedTheme.fontFamily = {
        ...theme.fontFamily,
        sans: brandingConfig.fontFamily,
      };
    }

    if (brandingConfig.borderRadius) {
      brandedTheme.borderRadius = brandingConfig.borderRadius;
    }

    setTheme(brandedTheme);

    // Apply custom CSS if provided
    if (brandingConfig.customCss) {
      const styleElement = document.getElementById('custom-branding-css') || document.createElement('style');
      styleElement.id = 'custom-branding-css';
      styleElement.textContent = brandingConfig.customCss;
      document.head.appendChild(styleElement);
    }
  }, [theme.fontFamily, setTheme]);

  /**
   * Clear client branding and reset to default
   */
  const clearBranding = useCallback(() => {
    setBranding(null);
    setBrandingError(null);
    resetTheme();

    // Remove custom CSS
    const customStyleElement = document.getElementById('custom-branding-css');
    if (customStyleElement) {
      customStyleElement.remove();
    }
  }, [resetTheme]);

  /**
   * Apply custom theme colors
   */
  const applyCustomTheme = useCallback((colors: { primary?: string; secondary?: string }) => {
    const customTheme: Partial<ThemeConfig> = {};
    
    if (colors.primary) {
      customTheme.primaryColor = colors.primary;
    }
    
    if (colors.secondary) {
      customTheme.secondaryColor = colors.secondary;
    }
    
    setTheme(customTheme);
  }, [setTheme]);

  /**
   * Export current theme as JSON
   */
  const exportTheme = useCallback((): string => {
    return JSON.stringify({
      theme,
      mode,
      branding,
    }, null, 2);
  }, [theme, mode, branding]);

  /**
   * Import theme from JSON string
   */
  const importTheme = useCallback((themeJson: string): boolean => {
    try {
      const imported = JSON.parse(themeJson);
      
      if (imported.theme) {
        setThemeState(imported.theme);
        applyCSSProperties(imported.theme);
      }
      
      if (imported.mode) {
        setMode(imported.mode);
      }
      
      if (imported.branding) {
        setBranding(imported.branding);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import theme:', error);
      return false;
    }
  }, [applyCSSProperties, setMode]);

  /**
   * Initialize theme mode from localStorage and system preference
   */
  useEffect(() => {
    try {
      const storedMode = localStorage.getItem(storageKey) as ThemeMode;
      if (storedMode && ['light', 'dark', 'system'].includes(storedMode)) {
        setModeState(storedMode);
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    }
  }, [storageKey]);

  /**
   * Update dark mode state based on mode and system preference
   */
  useEffect(() => {
    const updateDarkMode = () => {
      if (mode === 'system') {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      } else {
        setIsDark(mode === 'dark');
      }
    };

    updateDarkMode();

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateDarkMode);
      return () => mediaQuery.removeEventListener('change', updateDarkMode);
    }
  }, [mode]);

  /**
   * Apply dark mode class to document
   */
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  /**
   * Apply initial theme
   */
  useEffect(() => {
    applyCSSProperties(theme);
  }, [theme, applyCSSProperties]);

  /**
   * Context value
   */
  const contextValue: ThemeContextValue = {
    // Theme state
    theme,
    mode,
    isDark,
    
    // Branding state
    branding,
    isLoadingBranding,
    brandingError,
    
    // Theme actions
    setTheme,
    setMode,
    toggleMode,
    resetTheme,
    
    // Branding actions
    loadBranding,
    applyBranding,
    clearBranding,
    
    // Utility functions
    applyCustomTheme,
    exportTheme,
    importTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Hook to use branding specifically
 */
export const useBranding = () => {
  const { branding, isLoadingBranding, brandingError, loadBranding, applyBranding, clearBranding } = useTheme();
  
  return {
    branding,
    isLoading: isLoadingBranding,
    error: brandingError,
    loadBranding,
    applyBranding,
    clearBranding,
    logoUrl: branding?.logoUrl,
    primaryColor: branding?.primaryColor,
    secondaryColor: branding?.secondaryColor,
    clientName: branding?.client?.name,
  };
}; 