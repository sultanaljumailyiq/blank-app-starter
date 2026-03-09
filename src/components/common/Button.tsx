import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  className,
  children,
  ...props 
}) => {
  const baseStyles = 'rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-dark shadow-md',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-gray-100 border border-gray-200',
    outline: 'bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-300',
    accent: 'bg-accent-orange text-accent-foreground hover:bg-orange-600 shadow-md',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
    danger: 'bg-accent-red text-white hover:bg-red-600 shadow-md',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
