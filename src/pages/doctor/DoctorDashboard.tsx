import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  Bell,
  User,
  CheckSquare,
  Menu,
  X,
  Home,
  Settings,
  LogOut,
  ChevronDown,
  Users
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { DoctorProvider, useDoctorContext } from '../../contexts/DoctorContext';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { LoadingState } from '../../components/common/LoadingState';
import { useNotifications } from '../../hooks/useNotifications';

const DoctorDashboardContent: React.FC = () => {
  const { user, logout } = useAuth();
  const { clinics, selectedClinicId, setSelectedClinicId, loading } = useDoctorContext();
  const { t, language } = useLanguage();
  const { unreadCount } = useNotifications();

  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isClinicMenuOpen, setIsClinicMenuOpen] = useState(false);

  if (loading) {
    return <LoadingState fullScreen message={t('loading')} size="lg" />;
  }

  // Helper to determine active tab based on path
  const getActiveTab = (path: string) => {
    if (path === '/doctor' || path === '/doctor/') return 'overview';
    if (path.includes('/doctor/clinics')) return 'clinics';
    if (path.includes('/doctor/tasks')) return 'tasks';
    if (path.includes('/doctor/messages')) return 'messages';
    if (path.includes('/doctor/notifications')) return 'notifications';
    if (path.includes('/doctor/profile')) return 'profile';
    if (path.includes('/doctor/home')) return 'home';
    if (path.includes('/doctor/community')) return 'community';
    if (path.includes('/doctor/jobs')) return 'jobs';
    return 'overview';
  };

  const activeTab = getActiveTab(location.pathname);

  // Filter menu items based on role
  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: user?.role === 'staff' ? 'إحصائيات العيادة' : t('overview'), path: '/doctor', gradient: 'from-blue-500 to-blue-600' },
    ...(user?.role === 'doctor' ? [{ id: 'clinics', icon: Building2, label: t('myClinics'), path: '/doctor/clinics', gradient: 'from-emerald-500 to-emerald-600' }] : []),
    { id: 'tasks', icon: CheckSquare, label: 'المهام', path: '/doctor/tasks', gradient: 'from-orange-500 to-orange-600' },
    { id: 'messages', icon: MessageSquare, label: t('messages'), path: '/doctor/messages', gradient: 'from-amber-500 to-amber-600' },
    { id: 'notifications', icon: Bell, label: t('notifications'), path: '/doctor/notifications', gradient: 'from-red-500 to-red-600' },
    { id: 'profile', icon: User, label: t('profile'), path: '/doctor/profile', gradient: 'from-gray-500 to-gray-600' },
  ];

  const userMenuItems = [
    { icon: Home, label: 'الرئيسية', href: '/' },
    ...(user?.role === 'doctor' ? [{ icon: Settings, label: 'الإعدادات', action: () => navigate('/doctor/profile') }] : []),
    { icon: LogOut, label: 'تسجيل الخروج', action: () => logout() },
  ];

  const dashboardPaths = [
    '/doctor',
    '/doctor/',
    '/doctor/clinics',
    '/doctor/tasks',
    '/doctor/messages',
    '/doctor/notifications',
    '/doctor/profile'
  ];

  const shouldShowHeader = dashboardPaths.some(path =>
    location.pathname === path || location.pathname.startsWith(path + '/')
  ) && !location.pathname.includes('/doctor/community') && !location.pathname.includes('/doctor/jobs') && !location.pathname.includes('/doctor/home');

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Top Navigation Bar */}
      {shouldShowHeader && (
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm transition-all duration-300">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">

              {/* Logo & Brand & Clinic Selector */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <LayoutDashboard className="w-6 h-6 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="font-bold text-xl text-gray-900 tracking-tight">مركز الأطباء</h1>
                  </div>
                </div>

                {/* CLINIC SELECTOR (Filter for Staff/Owner) */}
                {user?.role === 'doctor' && (
                  <div className="relative border-r border-gray-200 pr-4 mr-4 hidden md:block">
                    <button
                      onClick={() => setIsClinicMenuOpen(!isClinicMenuOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {selectedClinicId === 'all' ? 'جميع العيادات' : clinics.find(c => c.id === selectedClinicId)?.name || 'عيادة محددة'}
                      </span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>

                    {isClinicMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-in fade-in zoom-in-95">
                        <div className="p-1">
                          {/* Only Owner sees "All Clinics" */}
                          {clinics.some(c => c.owner_id === user?.id) && (
                            <button
                              onClick={() => { setSelectedClinicId('all'); setIsClinicMenuOpen(false); }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${selectedClinicId === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              <span>جميع العيادات</span>
                            </button>
                          )}

                          {clinics.map(clinic => (
                            <button
                              key={clinic.id}
                              onClick={() => { setSelectedClinicId(clinic.id); setIsClinicMenuOpen(false); }}
                              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg ${selectedClinicId === clinic.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                              <Building2 className="w-4 h-4" />
                              <span className="truncate">{clinic.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* For Staff: Show Static Clinic Name */}
                {user?.role === 'staff' && (
                  <div className="relative border-r border-gray-200 pr-4 mr-4 hidden md:block">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-bold text-blue-800">
                        {clinics[0]?.name || 'عيادتي'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop & Mobile Navigation (Scrollable) */}
              <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1 mx-2 sm:mx-4 mask-linear-fade pb-1 sm:pb-0 flex-nowrap">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`relative flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-xl transition-all duration-300 group shrink-0 whitespace-nowrap ${activeTab === item.id
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-blue-500/25`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                      }`}
                  >
                    <div className="relative">
                      <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : ''}`} />
                      {item.id === 'notifications' && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-red-500 text-[8px] sm:text-[10px] font-bold text-white border border-white">
                          {unreadCount > 9 ? '+9' : unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-xs sm:text-sm">{item.label}</span>
                    {activeTab === item.id && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full shadow-sm animate-pulse" />
                    )}
                  </button>
                ))}
              </nav>

              {/* Right Side Actions */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:p-2 rounded-xl bg-white/60 hover:bg-white transition-all ring-1 ring-transparent hover:ring-gray-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user?.name || ''} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    {/* User Name hidden globally as per request, shown only in dropdown */}
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute end-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 origin-top-end">
                      <div className="p-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center overflow-hidden">
                            {user?.avatar ? (
                              <img src={user.avatar} alt={user?.name || ''} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user?.name || 'مستخدم'}</p>
                            <p className="text-xs text-gray-500">{user?.role === 'doctor' ? 'طبيب أسنان' : user?.role === 'staff' ? 'طاقم العيادة' : 'مستخدم'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        {userMenuItems.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              if (item.action) item.action();
                              if (item.href) window.location.href = item.href;
                              setIsUserMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className={
          location.pathname.includes('/doctor/community') || location.pathname.includes('/doctor/jobs')
            ? ""
            : "container mx-auto px-4 py-6"
        }>
          <Outlet />
        </div>
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl mix-blend-multiply filter opacity-70 animate-blob animation-delay-4000 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <BottomNavigation />
    </div >
  );
};

// ... imports

export const DoctorDashboard: React.FC = () => {
  return (
    <DoctorProvider>
      <DoctorDashboardContent />
    </DoctorProvider>
  );
};
