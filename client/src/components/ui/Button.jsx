import React from 'react';
import { Spinner } from './Spinner';

export const Button = React.forwardRef(({ 
  className = '', 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  children, 
  disabled, 
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-card transition-colors disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    secondary: 'bg-surface-alt text-text-main border border-border hover:bg-gray-100',
    danger: 'bg-danger text-white hover:bg-red-700',
    ghost: 'bg-transparent text-text-main hover:bg-surface-alt',
  };
  
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base min-h-[44px]',
    lg: 'h-12 px-6 text-lg min-h-[48px]',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="mr-2 text-current" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
