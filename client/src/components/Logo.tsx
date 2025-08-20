import React from 'react';
import LogoPrimary from '@assets/images/logos/logo-primary.png';
import LogoWhiteBg from '@assets/images/logos/logo-white-bg.png';
import LogoYellowBlue from '@assets/images/logos/logo-yellow-blue.png';
import ZishopBlueYellow from '@assets/images/logos/zishop-blue-yellow.png';
import IconPrimary from '@assets/images/logos/icon-primary.png';

export type LogoVariant = 'primary' | 'white-bg' | 'yellow-blue' | 'zishop-blue-yellow' | 'icon-only';
export type LogoSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl';

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  alt?: string;
}

const sizeClasses: Record<LogoSize, string> = {
  sm: 'h-6',
  md: 'h-10',
  lg: 'h-14',
  xl: 'h-16',
  xxl: 'h-20',
  xxxl: 'h-24',
};

const logoSources: Record<LogoVariant, string> = {
  primary: LogoPrimary,
  'white-bg': LogoWhiteBg,
  'yellow-blue': LogoYellowBlue,
  'zishop-blue-yellow': ZishopBlueYellow,
  'icon-only': IconPrimary,
};

export default function Logo({ 
  variant = 'zishop-blue-yellow', 
  size = 'md', 
  className = '', 
  alt = 'Zishop Logo' 
}: LogoProps) {
  const logoSrc = logoSources[variant];
  const sizeClass = sizeClasses[size];
  
  return (
    <img 
      src={logoSrc} 
      alt={alt} 
      className={`w-auto ${sizeClass} ${className}`}
    />
  );
} 