import React from 'react';

interface BentoStatCardProps {
  title?: string;
  value?: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: string;
  color?: string;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export const BentoStatCard: React.FC<BentoStatCardProps> = ({ title, value, icon, description, className = '', children }) => (
  <div className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm ${className}`}>
    <div className="flex items-center justify-between mb-2">
      {icon && <div className="text-primary">{icon}</div>}
      {title && <span className="text-sm text-muted-foreground">{title}</span>}
    </div>
    {value !== undefined && <div className="text-2xl font-bold">{value}</div>}
    {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    {children}
  </div>
);
