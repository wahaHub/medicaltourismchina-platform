import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeroProps {
  // Title configuration
  title: string;
  subtitle?: string;
  
  // Control section
  children?: ReactNode;
  controlsBackground?: 'white' | 'transparent' | 'frosted';
  controlsPadding?: 'none' | 'small' | 'medium' | 'large';
  stickyControls?: boolean;
  stickyTop?: string;
  
  // Style customization
  className?: string;
  headerClassName?: string;
  controlsClassName?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
}

const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  children,
  controlsBackground = 'frosted',
  controlsPadding = 'medium',
  stickyControls = false,
  stickyTop = 'top-[140px]',
  className,
  headerClassName,
  controlsClassName,
  maxWidth = '6xl'
}) => {

  const paddingClasses = {
    none: '',
    small: 'py-2',
    medium: 'py-3',
    large: 'py-4'
  };

  const backgroundClasses = {
    white: 'bg-white',
    transparent: 'bg-transparent',
    frosted: 'bg-white/90 backdrop-blur-md shadow-sm'
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    full: 'max-w-full'
  };

  return (
    <>
      {/* Header/Hero Section */}
      <div className={cn("bg-white", headerClassName)}>
        <div className="container mx-auto px-4 pt-8 pb-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm md:text-base text-gray-600 mt-3 max-w-4xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Controls Section (optional) */}
      {children && (
        <div className={cn(
          backgroundClasses[controlsBackground],
          paddingClasses[controlsPadding],
          stickyControls && `sticky ${stickyTop} z-30`,
          controlsClassName,
          className
        )}>
          <div className="container mx-auto px-4">
            <div className={cn("mx-auto", maxWidthClasses[maxWidth])}>
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PageHero;