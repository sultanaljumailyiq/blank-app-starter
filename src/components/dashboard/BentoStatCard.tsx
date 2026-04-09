import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface BentoStatCardProps {
  title?: string;
  value?: string | number;
  icon?: React.ReactNode | LucideIcon;
  description?: string;
  trend?: string;
  color?: string;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export const BentoStatCard: React.FC<BentoStatCardProps> = ({ title, value, icon, description, className = '', children }) => {
  const IconComponent = icon as any;
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && 'render' in (icon as any))) {
      return <IconComponent className="w-5 h-5" />;
    }
    return icon;
  };

  return (
    <div className={`bg-card rounded-xl border border-border p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-primary">{renderIcon()}</div>
        {title && <span className="text-sm text-muted-foreground">{title}</span>}
      </div>
      {value !== undefined && <div className="text-2xl font-bold text-foreground">{value}</div>}
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      {children}
    </div>
  );
};
