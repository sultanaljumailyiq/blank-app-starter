import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Stethoscope, UserCog, UserPlus, Package, Home, Users, LayoutDashboard, Briefcase, Store, LogOut, Settings, User, Bell, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePlatform } from '../../contexts/PlatformContext';
import { LoadingState } from '../common/LoadingState';
import { useNotifications } from '../../hooks/useNotifications';

interface GlobalHeaderProps {
  cartItemsCount?: number;
  notificationsCount?: number;
  messagesCount?: number;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  cartItemsCount = 0,
  notificationsCount = 3,
  messagesCount = 5,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { notifications, updates, markAsRead } = useNotifications();
  const { settings } = usePlatform();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // تحديد نوع الأزرار بناءً على الصفحة الحالية (`getNavigationButtons` logic for guests)
  const getGuestButtons = () => {
    const path = location.pathname;

    if (path === '/doctor-welcome') {
      return [
        {
          text: 'تسجيل',
          icon: <UserPlus className="w-4 h-4 sm:w-6 sm:h-6" />,
          path: '/login',
          gradient: 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
        },
        {
          text: 'هل أنت معمل أسنان؟',
          icon: <Stethoscope className="w-4 h-4 sm:w-6 sm:h-6" />,
          path: '/lab-welcome',
          gradient: 'from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600'
        },
        {
          text: 'هل أنت مورد؟',
          icon: <Package className="w-4 h-4 sm:w-6 sm:h-6" />,
          path: '/supplier-welcome',
          gradient: 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600'
        }
      ];
    } else if (path === '/supplier-welcome' || path === '/lab-welcome') {
      return [
        {
          text: 'تسجيل',
          icon: <UserPlus className="w-4 h-4 sm:w-6 sm:h-6" />,
          path: '/login',
          gradient: 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
        },
        {
          text: 'هل أنت طبيب أسنان؟',
          icon: <UserCog className="w-4 h-4 sm:w-6 sm:h-6" />,
          path: '/doctor-welcome',
          gradient: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
        }
      ];
    } else {
      // Default Public Pages
      return [
        {
          text: 'الخدمات الطبية',
          icon: <Stethoscope className="w-4 h-4 sm:w-6 sm:h-6" />,
          path: '/services',
          gradient: 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
        },
        {
          text: 'هل أنت طبيب أسنان؟',
          icon: <UserCog className="w-4 h-4 sm:w-6 sm:h-6" />,
          path: '/doctor-welcome',
          gradient: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
        }
      ];
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-18">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-xl" />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <span className="text-white font-bold text-sm sm:text-base">S</span>
              </div>
            )}
          </button>

          {/* Action Area */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {loading ? (
              <LoadingState size="sm" message="" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                    {(notifications.filter(n => !n.isRead).length > 0 || updates.length > 0) && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-left animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">الإشعارات</h3>
                        {notifications.length > 0 && <button onClick={() => markAsRead('all')} className="text-xs text-blue-600 hover:text-blue-700">تحديد الكل كمقروء</button>}
                      </div>

                      <div className="max-h-[400px] overflow-y-auto">
                        {/* Platform Updates Highlight */}
                        {updates.length > 0 && (
                          <div className="bg-blue-50/50 p-2 m-2 rounded-lg border border-blue-100">
                            <p className="text-xs font-bold text-blue-800 mb-2 px-1">تحديثات المنصة</p>
                            {updates.slice(0, 1).map((update, i) => (
                              <div key={i} className="bg-white p-2 rounded border border-blue-50 shadow-sm mb-1 last:mb-0">
                                <div className="flex justify-between items-start">
                                  <span className="text-sm font-semibold text-gray-900">{update.title}</span>
                                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">{update.version}</span>
                                </div>
                              </div>
                            ))}
                            <button onClick={() => { navigate('/doctor/updates'); setIsNotificationsOpen(false); }} className="text-xs text-blue-600 hover:text-blue-700 w-full text-center mt-1">عرض كل التحديثات</button>
                          </div>
                        )}

                        {notifications.length === 0 && updates.length === 0 ? (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">لا توجد إشعارات جديدة</p>
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                            >
                              <div className="flex gap-3">
                                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notification.isRead ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                <div className="flex-1">
                                  <div className="flex justify-between items-start gap-2">
                                    <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                      {notification.title}
                                    </p>
                                    {notification.clinicName && (
                                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                        {notification.clinicName}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.description}</p>
                                  <p className="text[10px] text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2 border-t border-gray-50 bg-gray-50/50 rounded-b-xl">
                        <button
                          onClick={() => {
                            navigate(user.role === 'admin' ? '/admin/notifications' : '/doctor/notifications');
                            setIsNotificationsOpen(false);
                          }}
                          className="w-full py-2 text-sm text-center text-gray-600 hover:text-purple-600 font-medium transition-colors"
                        >
                          عرض كل الإشعارات
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl hover:bg-gray-100/80 transition-all duration-200 border border-transparent hover:border-gray-200"
                  >
                    {user.role === 'admin' && settings.logo_url ? (
                      <img src={settings.logo_url} alt="Admin" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-contain border border-purple-200 bg-white" />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg flex items-center justify-center text-purple-700 font-bold text-sm sm:text-base border border-purple-200">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="hidden sm:block text-right">
                      <p className="text-xs sm:text-sm font-bold text-gray-700 truncate max-w-[100px]">{user.name}</p>
                      <p className="text-[10px] sm:text-xs text-purple-600 font-medium">
                        {user.role === 'admin' ? 'مسؤول النظام' : user.role === 'doctor' ? 'طبيب' : user.role === 'laboratory' ? 'معمل' : 'مستخدم'}
                      </p>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 transform origin-top-left animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      <button
                        onClick={() => {
                          navigate(user.role === 'admin' ? '/admin' : user.role === 'laboratory' ? '/lab' : '/doctor');
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-right px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-600 flex items-center gap-2 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        لوحة التحكم
                      </button>

                      {user.role === 'doctor' && (
                        <button
                          onClick={() => { navigate('/doctor/updates'); setIsProfileOpen(false); }}
                          className="w-full text-right px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-600 flex items-center gap-2 transition-colors"
                        >
                          <RefreshCw className="w-4 h-4" />
                          مركز التحديثات
                        </button>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full text-right px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors border-t border-gray-50 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        تسجيل الخروج
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Guest / Public Navigation Buttons */
              getGuestButtons().map((button, index) => (
                <button
                  key={index}
                  onClick={() => navigate(button.path)}
                  className={`group relative px-2.5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r ${button.gradient} text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-xs sm:text-base whitespace-nowrap`}
                >
                  <span className="flex items-center gap-1 sm:gap-3">
                    <div className="w-4 h-4 sm:w-6 sm:h-6">
                      {button.icon}
                    </div>
                    <span className="font-medium">{button.text}</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
