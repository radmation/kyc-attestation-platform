export class Branding {
  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly logoUrl?: string,
    public readonly primaryColor?: string,
    public readonly secondaryColor?: string,
    public readonly accentColor?: string,
    public readonly backgroundColor?: string,
    public readonly surfaceColor?: string,
    public readonly textColor?: string,
    public readonly borderColor?: string,
    public readonly fontFamily?: string,
    public readonly borderRadius?: string,
    public readonly shadow?: string,
    public readonly customCSS?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  /**
   * Create a new branding instance with updated values
   */
  update(
    updates: Partial<
      Omit<Branding, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>
    >,
  ): Branding {
    return new Branding(
      this.id,
      this.clientId,
      updates.logoUrl ?? this.logoUrl,
      updates.primaryColor ?? this.primaryColor,
      updates.secondaryColor ?? this.secondaryColor,
      updates.accentColor ?? this.accentColor,
      updates.backgroundColor ?? this.backgroundColor,
      updates.surfaceColor ?? this.surfaceColor,
      updates.textColor ?? this.textColor,
      updates.borderColor ?? this.borderColor,
      updates.fontFamily ?? this.fontFamily,
      updates.borderRadius ?? this.borderRadius,
      updates.shadow ?? this.shadow,
      updates.customCSS ?? this.customCSS,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Get default branding values
   */
  static getDefaults(): Partial<
    Omit<Branding, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>
  > {
    return {
      primaryColor: '#000000',
      secondaryColor: '#666666',
      accentColor: '#007bff',
      backgroundColor: '#ffffff',
      surfaceColor: '#f8f9fa',
      textColor: '#212529',
      borderColor: '#dee2e6',
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: '0.375rem',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    };
  }

  /**
   * Apply default values to missing branding properties
   */
  withDefaults(): Branding {
    const defaults = Branding.getDefaults();
    return new Branding(
      this.id,
      this.clientId,
      this.logoUrl,
      this.primaryColor ?? defaults.primaryColor,
      this.secondaryColor ?? defaults.secondaryColor,
      this.accentColor ?? defaults.accentColor,
      this.backgroundColor ?? defaults.backgroundColor,
      this.surfaceColor ?? defaults.surfaceColor,
      this.textColor ?? defaults.textColor,
      this.borderColor ?? defaults.borderColor,
      this.fontFamily ?? defaults.fontFamily,
      this.borderRadius ?? defaults.borderRadius,
      this.shadow ?? defaults.shadow,
      this.customCSS,
      this.createdAt,
      this.updatedAt,
    );
  }

  /**
   * Convert to plain object for API responses
   */
  toJSON() {
    return {
      id: this.id,
      clientId: this.clientId,
      logoUrl: this.logoUrl,
      primaryColor: this.primaryColor,
      secondaryColor: this.secondaryColor,
      accentColor: this.accentColor,
      backgroundColor: this.backgroundColor,
      surfaceColor: this.surfaceColor,
      textColor: this.textColor,
      borderColor: this.borderColor,
      fontFamily: this.fontFamily,
      borderRadius: this.borderRadius,
      shadow: this.shadow,
      customCSS: this.customCSS,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
