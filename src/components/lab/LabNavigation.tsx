import React from 'react';
import { 
  LayoutDashboard, 
  FlaskConical, 
  MessageSquare, 
  Headphones, 
  User,
  FileText,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  active?: boolean;
  onClick?: () => void;
}

interface LabNavigationProps {
  items: NavigationItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
  showQuickActions?: boolean;
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  onQuickAction?: (action: string) => void;
  notificationCount?: number;
}

export const LabNavigation: React.FC<LabNavigationProps> = ({
  items,
  activeTab,
  onTabChange,
  className,
  showSearch = true,
  showNotifications = true,
  showQuickActions = true,
  onSearch,
  onNotificationClick,
  onQuickAction,
  notificationCount = 0
}) => {
  const quickActionItems = [
    {
      id: 'new-request',
      label: 'طلب جديد',
      icon: Plus,
      color: 'bg-primary hover:bg-primary-dark'
    },
    {
      id: 'schedule',
      label: 'جدولة',
      icon: Calendar,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'report',
      label: 'تقرير',
      icon: BarChart3,
      color: 'bg-blue-500 hover:bg-blue-600'
    }
  ];

  return (
    <div className={cn('bg-white border-b border-gray-200 shadow-sm', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Logo and Main Navigation */}
          <div className="flex items-center space-x-6 space-x-reverse">
            {/* Logo */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">مركز المختبرات</h1>
                <p className="text-sm text-gray-600">إدارة المختبرات الطبية</p>
              </div>
            </div>

            {/* Main Navigation Tabs */}
            <nav className="hidden lg:flex space-x-6 space-x-reverse border-r border-gray-200 pr-6">
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      'flex items-center space-x-2 space-x-reverse py-4 px-3 border-b-2 font-medium text-sm transition-all duration-200 relative group',
                      isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className={cn(
                        'absolute -top-1 -right-1 w-5 h-5 text-xs font-bold text-white rounded-full flex items-center justify-center',
                        isActive ? 'bg-red-500' : 'bg-red-500'
                      )}>
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Search */}
            {showSearch && (
              <div className="relative hidden md:block">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="البحث في المختبر..."
                  onChange={(e) => onSearch?.(e.target.value)}
                  className="w-64 pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>
            )}

            {/* Quick Actions */}
            {showQuickActions && (
              <div className="hidden md:flex items-center space-x-2 space-x-reverse">
                {quickActionItems.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => onQuickAction?.(action.id)}
                      className={cn(
                        'flex items-center space-x-1 space-x-reverse px-3 py-2 text-white text-sm font-medium rounded-lg transition-colors',
                        action.color
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden lg:inline">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Notifications */}
            {showNotifications && (
              <div className="relative">
                <button
                  onClick={onNotificationClick}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Settings */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-4">
          <div className="flex space-x-1 space-x-reverse overflow-x-auto scrollbar-hide">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'flex flex-col items-center space-y-1 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="md:hidden pb-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="البحث في المختبر..."
                onChange={(e) => onSearch?.(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}

        {/* Mobile Quick Actions */}
        {showQuickActions && (
          <div className="md:hidden pb-4">
            <div className="flex space-x-2 space-x-reverse">
              {quickActionItems.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => onQuickAction?.(action.id)}
                    className={cn(
                      'flex items-center space-x-2 space-x-reverse px-3 py-2 text-white text-sm font-medium rounded-lg transition-colors flex-1 justify-center',
                      action.color
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Default navigation items for lab
export const getDefaultLabNavigation = (): NavigationItem[] => [
  {
    id: 'overview',
    label: 'النظرة العامة',
    icon: LayoutDashboard,
    badge: 0
  },
  {
    id: 'requests',
    label: 'الطلبات',
    icon: FileText,
    badge: 5
  },
  {
    id: 'messages',
    label: 'الرسائل',
    icon: MessageSquare,
    badge: 3
  },
  {
    id: 'support',
    label: 'الدعم الفني',
    icon: Headphones,
    badge: 0
  },
  {
    id: 'profile',
    label: 'الملف الشخصي',
    icon: User,
    badge: 0
  }
];