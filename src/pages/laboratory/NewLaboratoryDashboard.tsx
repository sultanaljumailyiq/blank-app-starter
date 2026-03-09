import React, { useState } from 'react';
import {
  LayoutDashboard,
  FlaskConical,
  MessageSquare,
  Headphones,
  User,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  Bell,
  UserCheck,
  Settings,
  BarChart3,
  DollarSign,
  Truck,
  XCircle,
  Package,
  Plus // Added
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { LaboratoryOverview } from './LaboratoryOverview';
import { LaboratoryRequests } from './LaboratoryRequests';
import { LabMessagesSection } from './sections/LabMessagesSection';
import { LaboratorySupport } from './LaboratorySupport';
import { LaboratoryProfile } from './LaboratoryProfile';
import { LabOrdersSection } from './sections/LabOrdersSection';
import { LabRepresentativeSection } from './sections/LabRepresentativeSection';
import { LabAnalyticsPage } from './LabAnalyticsPage';



// Lab Management Panel Component
const LabManagementPanel: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [labSettings, setLabSettings] = useState({
    id: '',
    workingHours: '',
    responseTime: '',
    emergencyService: false,
    priceList: [] as { service: string; price: number }[],
    specialties: [] as string[]
  });

  const PREDEFINED_SPECIALTIES = [
    'Crown & Bridge',
    'Orthodontics',
    'Implants',
    'Removable Prosthetics',
    'Veneers',
    'Pediatric',
    '3D Printing'
  ];

  const [customSpecialty, setCustomSpecialty] = useState('');

  // New Service State
  const [newService, setNewService] = useState({ name: '', price: '' });

  // Fetch Settings
  React.useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('dental_laboratories')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setLabSettings({
            id: data.id,
            workingHours: data.working_hours || '',
            responseTime: data.response_time || '',
            emergencyService: data.emergency_service || false, // Assuming schema has this or we store in metadata
            priceList: (data.services as any[] || []).map(s => ({ service: s.name, price: s.price })),
            specialties: data.specialties || []
          });
        }
      } catch (err) {
        console.error('Error fetching lab settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    if (!labSettings.id) return;
    try {
      setLoading(true);

      // Transform priceList back to services schema
      const services = labSettings.priceList.map(item => ({
        name: item.service,
        price: Number(item.price),
        time_estimate: 24 // Default or add to UI if needed
      }));

      const { error } = await supabase
        .from('dental_laboratories')
        .update({
          working_hours: labSettings.workingHours,
          response_time: labSettings.responseTime,
          services: services,
          specialties: labSettings.specialties
          // emergency_service: labSettings.emergencyService // Check schema, omitting for safety if column missing
        })
        .eq('id', labSettings.id);

      if (error) throw error;
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('فشل حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const addService = () => {
    if (!newService.name || !newService.price) return;
    setLabSettings(prev => ({
      ...prev,
      priceList: [...prev.priceList, { service: newService.name, price: Number(newService.price) }]
    }));
    setNewService({ name: '', price: '' });
  };

  const removeService = (index: number) => {
    setLabSettings(prev => ({
      ...prev,
      priceList: prev.priceList.filter((_, i) => i !== index)
    }));
  };

  const toggleSpecialty = (spec: string) => {
    setLabSettings(prev => {
      const exists = prev.specialties.includes(spec);
      return {
        ...prev,
        specialties: exists
          ? prev.specialties.filter(s => s !== spec)
          : [...prev.specialties, spec]
      };
    });
  };

  const addCustomSpecialty = () => {
    if (customSpecialty && !labSettings.specialties.includes(customSpecialty)) {
      setLabSettings(prev => ({
        ...prev,
        specialties: [...prev.specialties, customSpecialty]
      }));
      setCustomSpecialty('');
    }
  };

  if (loading && !labSettings.id) return <div className="p-8 text-center text-gray-500">جاري تحميل الإعدادات...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">إعدادات المختبر والخدمات</h2>
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">معلومات العمل</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">ساعات العمل</label>
              <div className="relative">
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={labSettings.workingHours}
                  onChange={(e) => setLabSettings(prev => ({ ...prev, workingHours: e.target.value }))}
                  placeholder="مثال: 9:00 ص - 6:00 م"
                  className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">وقت الاستجابة المتوقع</label>
              <div className="relative">
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={labSettings.responseTime}
                  onChange={(e) => setLabSettings(prev => ({ ...prev, responseTime: e.target.value }))}
                  placeholder="مثال: 24 ساعة"
                  className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={labSettings.emergencyService}
                  onChange={(e) => setLabSettings(prev => ({ ...prev, emergencyService: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="font-medium text-gray-700">تفعيل خدمة طلبات الطوارئ (Urgent)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Specialties Management */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">التخصصات</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {PREDEFINED_SPECIALTIES.map(spec => (
              <button
                key={spec}
                onClick={() => toggleSpecialty(spec)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${labSettings.specialties.includes(spec)
                  ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
              >
                {spec}
                {labSettings.specialties.includes(spec) && <CheckCircle className="inline-block w-4 h-4 ml-1.5" />}
              </button>
            ))}

            {/* Display Custom Specialties */}
            {labSettings.specialties.filter(s => !PREDEFINED_SPECIALTIES.includes(s)).map(spec => (
              <button
                key={spec}
                onClick={() => toggleSpecialty(spec)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all border bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
              >
                {spec}
                <XCircle className="inline-block w-4 h-4 ml-1.5" />
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customSpecialty}
              onChange={(e) => setCustomSpecialty(e.target.value)}
              placeholder="إضافة تخصص آخر..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <button
              onClick={addCustomSpecialty}
              disabled={!customSpecialty}
              className="bg-gray-800 text-white p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Services & Prices */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex justify-between items-center">
            <span>قائمة الخدمات والأسعار</span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{labSettings.priceList.length} خدمة</span>
          </h3>

          <div className="space-y-4 mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newService.name}
                onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                placeholder="اسم الخدمة (مثال: تاج زركون)"
                className="flex-[2] px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <input
                type="number"
                value={newService.price}
                onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                placeholder="السعر"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <button
                onClick={addService}
                disabled={!newService.name || !newService.price}
                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {labSettings.priceList.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed rounded-lg">
                أضف خدماتك ليراها الأطباء
              </div>
            ) : (
              labSettings.priceList.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-purple-600 font-bold text-sm shadow-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">{item.service}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                      {item.price.toLocaleString()} د.ع
                    </span>
                    <button
                      onClick={() => removeService(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const DentalLabCenter: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Menu items for dental lab center dashboard
  const menuItems = [
    { id: 'overview', label: 'النظرة العامة', icon: LayoutDashboard },
    { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
    { id: 'orders', label: 'إدارة الطلبات', icon: Package },
    { id: 'requests', label: 'طلبات المختبر', icon: FlaskConical },
    { id: 'representative', label: 'المندوب', icon: CheckCircle },
    { id: 'lab-management', label: 'إدارة المختبر', icon: TrendingUp },
    { id: 'messages', label: 'الرسائل', icon: MessageSquare },
    { id: 'support', label: 'الدعم الفني', icon: Headphones },
    { id: 'profile', label: 'الملف الشخصي', icon: User }
  ];

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <LaboratoryOverview />;
      case 'analytics':
        return <LabAnalyticsPage />;
      case 'orders':
        return <LabOrdersSection />;
      case 'requests':
        return <LaboratoryRequests />;
      case 'representative':
        return <LabRepresentativeSection />;
      case 'lab-management':
        return <LabManagementPanel />;
      case 'messages':
        return <LabMessagesSection />;
      case 'support':
        return <LaboratorySupport />;
      case 'profile':
        return <LaboratoryProfile />;
      default:
        return <LaboratoryOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center ml-3">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">مركز معمل الأسنان</h1>
                <p className="text-sm text-gray-600">منصة شاملة لإدارة المختبرات السنية</p>
              </div>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4 space-x-reverse">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'مختبر تجريبي'}</p>
                  <p className="text-xs text-gray-600">مختبر معتمد</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">ل</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 space-x-reverse overflow-x-auto no-scrollbar pb-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 space-x-reverse py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${activeTab === item.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

// Export both names for compatibility
export { DentalLabCenter as NewLaboratoryDashboard };
