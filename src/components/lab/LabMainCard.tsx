import React, { ReactNode } from 'react';
import { 
  Bell, 
  MoreVertical, 
  Download, 
  RefreshCw, 
  Settings,
  Star,
  User,
  Calendar,
  Clock,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { Card } from '../common/Card';
import { cn } from '@/lib/utils';

interface LabMainCardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  actions?: {
    type: 'notification' | 'refresh' | 'download' | 'settings' | 'custom';
    icon?: React.ElementType;
    onClick?: () => void;
    badge?: number;
  }[];
  filters?: {
    show?: boolean;
    onFilterChange?: (filter: string, value: string) => void;
    filters?: {
      label: string;
      value: string;
      options: { label: string; value: string }[];
    }[];
  };
  search?: {
    show?: boolean;
    placeholder?: string;
    onSearch?: (query: string) => void;
  };
  stats?: {
    total?: number;
    today?: number;
    completed?: number;
    pending?: number;
  };
  showHeader?: boolean;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
}

export const LabMainCard: React.FC<LabMainCardProps> = ({
  children,
  title,
  subtitle,
  className,
  actions = [],
  filters,
  search,
  stats,
  showHeader = true,
  headerContent,
  footerContent
}) => {
  const defaultActions = [
    { type: 'refresh' as const, icon: RefreshCw },
    { type: 'download' as const, icon: Download },
    { type: 'settings' as const, icon: Settings }
  ];

  const getActionIcon = (actionType: string) => {
    const customAction = actions.find(a => a.type === actionType);
    if (customAction?.icon) return customAction.icon;
    
    const defaultAction = defaultActions.find(a => a.type === actionType);
    return defaultAction?.icon || MoreVertical;
  };

  const handleActionClick = (actionType: string) => {
    const customAction = actions.find(a => a.type === actionType);
    customAction?.onClick?.();
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      {showHeader && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
            {/* Title and Stats */}
            <div className="flex-1">
              {title && (
                <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
              
              {/* Stats Row */}
              {stats && (
                <div className="flex items-center space-x-6 space-x-reverse mt-3">
                  {stats.total !== undefined && (
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-600">إجمالي: </span>
                      <span className="text-sm font-semibold text-gray-900">{stats.total}</span>
                    </div>
                  )}
                  {stats.today !== undefined && (
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">اليوم: </span>
                      <span className="text-sm font-semibold text-gray-900">{stats.today}</span>
                    </div>
                  )}
                  {stats.completed !== undefined && (
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Star className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-gray-600">مكتمل: </span>
                      <span className="text-sm font-semibold text-gray-900">{stats.completed}</span>
                    </div>
                  )}
                  {stats.pending !== undefined && (
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-sm text-gray-600">معلق: </span>
                      <span className="text-sm font-semibold text-gray-900">{stats.pending}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 space-x-reverse">
              {/* Custom Header Content */}
              {headerContent}
              
              {/* Search */}
              {search?.show && (
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={search.placeholder || 'بحث...'}
                    onChange={(e) => search.onSearch?.(e.target.value)}
                    className="w-64 pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>
              )}

              {/* Action Buttons */}
              {actions.map((action, index) => {
                const Icon = action.icon || getActionIcon(action.type);
                return (
                  <button
                    key={index}
                    onClick={() => handleActionClick(action.type)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
                  >
                    <Icon className="w-5 h-5" />
                    {action.badge && action.badge > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {action.badge > 9 ? '9+' : action.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters */}
          {filters?.show && filters.filters && (
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">تصفية:</span>
              </div>
              
              {filters.filters.map((filter, index) => (
                <select
                  key={index}
                  onChange={(e) => filters.onFilterChange?.(filter.value, e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {filter.options.map((option, optionIndex) => (
                    <option key={optionIndex} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {children}
      </div>

      {/* Footer */}
      {footerContent && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footerContent}
        </div>
      )}
    </Card>
  );
};

// Quick Actions Component
export const QuickActions: React.FC<{
  actions: {
    label: string;
    icon: React.ElementType;
    onClick: () => void;
    color?: 'primary' | 'green' | 'blue' | 'amber' | 'red';
  }[];
  className?: string;
}> = ({ actions, className }) => {
  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'blue':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'amber':
        return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'red':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-primary hover:bg-primary-dark text-white';
    }
  };

  return (
    <div className={cn('flex space-x-2 space-x-reverse', className)}>
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={index}
            onClick={action.onClick}
            className={cn(
              'flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg font-medium text-sm transition-colors',
              getColorClasses(action.color)
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};