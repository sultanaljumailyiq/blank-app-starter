import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  ShoppingCart,
  BarChart3,
  Menu,
  X,
  User,
  Bell,
  MessageSquare,
  ChevronDown,
  LogOut,
  Home,
  FileText,
  Settings,
  Activity,
  TestTube,
  Briefcase,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
// import { useLanguage } from '../../contexts/LanguageContext';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useClinics } from '@/hooks/useClinics';
import { ClinicOverviewPage } from './ClinicOverviewPage';
import { ClinicAppointmentsPage } from './ClinicAppointmentsPage';
import { ClinicPatientsPage } from './ClinicPatientsPage';
import { ClinicStaffPage } from './ClinicStaffPage';
import { ClinicInventoryPage } from './ClinicInventoryPage';
import { ClinicReportsPage } from './ClinicReportsPage';
import ClinicLabPage from './ClinicLabPage';
import { ClinicAssetsPage } from './ClinicAssetsPage';
import { ClinicFinancePage } from './ClinicFinancePage';


import { BottomNavigation } from '../../../components/layout/BottomNavigation';

export const ClinicDashboard: React.FC = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  const id = clinicId; // Alias for compatibility with existing code
  const navigate = useNavigate();
  // const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const language = 'ar'; // ت временно

  // Use the hook to get clinics data
  const { clinics, loading } = useClinics();

  // Find the specific clinic
  let clinic = clinics.find(c => c.id === id || c.id.toString() === id);

  // Fail-safe for Demo Mode: If accessing ID 1 or 2 and not found (e.g. because DB has real UUIDs), use mock data
  if (!clinic && (id === '1' || id === '2')) {
    const mockClinics = [
      { id: '1', name: 'عيادة النور التخصصية', location: 'بغداد - شارع فلسطين', phone: '07701234567', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', rating: 4.8, openTime: '09:00', closeTime: '21:00', specialties: ['طب عام', 'تجميل'], totalPatients: 124, dailyAppointments: 15, totalStaff: 8, mainDoctor: 'د. أحمد محمد' },
      { id: '2', name: 'مركز الابتسامة الرقمي', location: 'بغداد - حي الكرادة', phone: '07901234567', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', rating: 4.9, openTime: '10:00', closeTime: '22:00', specialties: ['تقويم', 'زراعة'], totalPatients: 85, dailyAppointments: 12, totalStaff: 5, mainDoctor: 'د. سارة علي' }
    ];
    clinic = mockClinics.find(c => c.id === id) as any;
  }

  // URL Tab Support
  const location = useLocation();
  const { user } = useAuth(); // Moved to top level to avoid Hook violation

  useEffect(() => {
    if (!loading && !clinic) {

    }

    // Parse Tab from URL
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [id, clinics, loading, clinic, location.search]);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات العيادة...</p>
        </div>
      </div>
    );
  }

  // Handle not found state
  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">العيادة غير موجودة</h1>
          <p className="text-gray-600 mb-6">لم يتم العثور على عيادة بهذا المعرف</p>
          <button
            onClick={() => navigate('/doctor')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  /* 
   * Updated Menu Items based on user request:
   * - Finance added (Owner Only)
   * - Inventory removed (moved to Assets)
   * - Assets renamed to Assets & Services
   */
  const isOwner = user?.role === 'doctor';

  const menuItems = [
    {
      id: 'overview',
      icon: LayoutDashboard,
      label: 'النظرة العامة',
      gradient: 'from-blue-500 to-blue-600',
      description: 'إحصائيات ومؤشرات العيادة'
    },
    {
      id: 'appointments',
      icon: Calendar,
      label: ' المواعيد',
      gradient: 'from-purple-500 to-purple-600',
      description: 'تقويم المواعيد والجدولة'
    },
    {
      id: 'patients',
      icon: Users,
      label: 'المرضى',
      gradient: 'from-emerald-500 to-emerald-600',
      description: 'ملفات المرضى والسجلات'
    },
    {
      id: 'staff',
      icon: User,
      label: 'الطاقم',
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'الموظفين والموارد البشرية'
    },
    {
      id: 'assets',
      icon: Briefcase,
      label: 'الأصول ',
      gradient: 'from-cyan-500 to-cyan-600',
      description: 'إدارة الأصول، المخزون، والعلاجات'
    },
    ...(isOwner ? [
      {
        id: 'finance',
        icon: DollarSign,
        label: 'المالية',
        gradient: 'from-orange-500 to-orange-600',
        description: 'الإيرادات والمصروفات'
      },
      {
        id: 'reports',
        icon: BarChart3,
        label: 'التقارير ',
        gradient: 'from-rose-500 to-rose-600',
        description: 'التقارير المالية والإحصائية'
      },

    ] : []),
    {
      id: 'lab',
      icon: TestTube,
      label: 'معامل الاسنان',
      gradient: 'from-violet-500 to-violet-600',
      description: 'طلبات المعامل وإدارة معامل الاسنان'
    }
  ];

  /* User menu items... */
  const userMenuItems = [
    { icon: Home, label: 'الرئيسية', action: () => setActiveTab('overview') },
    { icon: FileText, label: 'التقارير', action: () => setActiveTab('reports') },
    { icon: Settings, label: 'الإعدادات', action: () => { } },
    { icon: LogOut, label: 'تسجيل الخروج', action: () => { } }
  ];

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'overview':
        return <ClinicOverviewPage clinicId={clinic.id} defaultClinic={clinic} onNavigate={setActiveTab} />;
      case 'appointments':
        return <ClinicAppointmentsPage clinicId={clinic.id} />;
      case 'patients':
        return <ClinicPatientsPage clinicId={clinic.id} />;
      case 'staff':
        return <ClinicStaffPage clinicId={clinic.id} />;
      case 'assets':
        return <ClinicAssetsPage clinicId={clinic.id} />;
      case 'finance':
        return <ClinicFinancePage clinicId={clinic.id} />;
      case 'lab':
        return <ClinicLabPage clinicId={clinic.id} />;
      case 'reports':
        return <ClinicReportsPage clinicId={clinic.id} />;
      default:
        return <ClinicOverviewPage clinicId={clinic.id} onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className={`flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Back Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/doctor')}
                className="flex items-center justify-center p-2 bg-gray-100/50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-lg transition-all"
                title="الرجوع للمركز"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Navigation */}
            <div className="flex-1 overflow-x-auto mx-4 scrollbar-hide">
              <nav className="flex items-center gap-2 min-w-max pb-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-300 group ${activeTab === item.id
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-emerald-500/25`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                      }`}
                  >
                    <item.icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : ''
                      }`} />
                    <span className="font-medium text-sm">{item.label}</span>

                    {/* Active indicator */}
                    {activeTab === item.id && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-sm" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right Side Actions - Empty now as User Menu is removed */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu Toggle - Kept as fallback/optional if needed, but navigation is now scrollable */}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden p-2.5 rounded-xl bg-white/60 text-gray-600 hover:bg-white hover:text-gray-900 transition-all"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden pb-4 border-t border-gray-100 mt-2 pt-4">
            <div className="grid grid-cols-2 gap-3">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${activeTab === item.id
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                    : 'bg-white/60 text-gray-600 hover:bg-white hover:text-gray-900'
                    }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="text-xs font-medium text-center">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container mx-auto px-4 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                {(() => {
                  const activeItem = menuItems.find(item => item.id === activeTab);
                  return activeItem ? React.createElement(activeItem.icon, {
                    className: "w-4 h-4 text-white"
                  }) : null;
                })()}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {menuItems.find(item => item.id === activeTab)?.label}
              </h1>
            </div>
            <p className="text-gray-600 text-sm">
              {menuItems.find(item => item.id === activeTab)?.description}
            </p>
          </div>

          {/* Active Content */}
          {renderActiveSection()}
        </div>
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <BottomNavigation />
    </div >
  );
};