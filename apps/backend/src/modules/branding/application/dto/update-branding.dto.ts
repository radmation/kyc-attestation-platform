import {
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  IsIn,
} from 'class-validator';

export class UpdateBrandingDto {
  @IsOptional()
  @IsString()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Primary color must be a valid hex color',
  })
  primaryColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Secondary color must be a valid hex color',
  })
  secondaryColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Accent color must be a valid hex color',
  })
  accentColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Background color must be a valid hex color',
  })
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Surface color must be a valid hex color',
  })
  surfaceColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Text color must be a valid hex color',
  })
  textColor?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i, {
    message: 'Border color must be a valid hex color',
  })
  borderColor?: string;

  @IsOptional()
  @IsString()
  @IsIn(
    [
      'Inter',
      'Roboto',
      'Open Sans',
      'Lato',
      'Poppins',
      'system-ui',
      'sans-serif',
    ],
    {
      message:
        'Font family must be one of: Inter, Roboto, Open Sans, Lato, Poppins, system-ui, sans-serif',
    },
  )
  fontFamily?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]+(\.[0-9]+)?(px|rem|em)$/, {
    message: 'Border radius must be in px, rem, or em units',
  })
  borderRadius?: string;

  @IsOptional()
  @IsString()
  shadow?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000, { message: 'Custom CSS is too long' })
  customCSS?: string;
}
