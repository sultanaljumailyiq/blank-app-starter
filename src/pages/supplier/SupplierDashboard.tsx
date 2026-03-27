import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Package, DollarSign, ShoppingCart, MessageCircle,
  User, Menu, X, Briefcase, ChevronDown, Settings, LogOut, Store
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { JobsPage } from '../jobs/JobsPage';
import { supabase } from '../../lib/supabase';

// Import pages
import { SupplierOverviewPage } from './SupplierOverviewPage';
import { SupplierProductsPage } from './SupplierProductsPage';
import { SupplierFinancePage } from './SupplierFinancePage';
import { SupplierOrdersPage } from './SupplierOrdersPage';
import { SupplierMessagesPage } from './SupplierMessagesPage';
import { SupplierProfilePage } from './SupplierProfilePage';

import { BottomNavigation } from '../../components/layout/BottomNavigation';

export const SupplierDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspensionChecked, setSuspensionChecked] = useState(false);

  // Check suspension status on mount
  useEffect(() => {
    const checkSuspension = async () => {
      if (!user?.id) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('banned')
        .eq('id', user.id)
        .single();
      setIsSuspended(profile?.banned === true);
      setSuspensionChecked(true);
    };
    checkSuspension();
  }, [user?.id]);

  // Sync with URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Handle Tab Change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    // Optionally push to URL, but state is enough for single page feel.
    // If deeper links are needed, we can pushState.
  };

  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'نظرة عامة', gradient: 'from-blue-500 to-blue-600' },
    { id: 'products', icon: Package, label: 'إدارة المنتجات', gradient: 'from-emerald-500 to-emerald-600' },
    { id: 'jobs', icon: Briefcase, label: 'التوظيف', gradient: 'from-blue-500 to-blue-600' }, // New Jobs Tab
    { id: 'orders', icon: ShoppingCart, label: 'الطلبات', gradient: 'from-orange-500 to-orange-600' },
    { id: 'finance', icon: DollarSign, label: 'المالية', gradient: 'from-amber-500 to-amber-600' },
    { id: 'messages', icon: MessageCircle, label: 'الرسائل', gradient: 'from-purple-500 to-purple-600' },
    { id: 'profile', icon: User, label: 'الملف الشخصي', gradient: 'from-gray-500 to-gray-600' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Real Stats State
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    views: 0,
    customers: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;

      try {
        // 1. Get Supplier ID
        const { data: supplier } = await supabase.from('suppliers').select('id').eq('user_id', user.id).single();
        if (!supplier) return;

        // 2. Fetch Counts
        // Products
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('supplier_id', supplier.id);

        // Orders (All)
        const { count: ordersCount } = await supabase
          .from('store_orders')
          .select('*', { count: 'exact', head: true })
          .eq('supplier_id', supplier.id);

        // Revenue (Delivered Orders)
        const { data: orders } = await supabase
          .from('store_orders')
          .select('total_amount')
          .eq('supplier_id', supplier.id)
          .in('status', ['delivered', 'تم التسليم', 'مكتمل']);

        const totalRevenue = orders?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;

        // Views (from product_views via join)
        // Complex join count OR separate count. 
        // Simplest: Count product_views where product.supplier_id = my_id
        const { count: viewsCount } = await supabase
          .from('product_views')
          .select('id, products!inner(supplier_id)', { count: 'exact', head: true })
          .eq('products.supplier_id', supplier.id);

        setStats({
          products: productsCount || 0,
          orders: ordersCount || 0,
          revenue: totalRevenue,
          views: viewsCount || 0,
          customers: 0 // Default or calculated value
        });

      } catch (e) {
        console.error('Error fetching dashboard stats:', e);
      }
    };
    fetchStats();
  }, [user]);

  const renderActiveComponent = () => {
    const props = { onNavigate: (tab: string) => setActiveTab(tab), stats }; // Pass stats

    switch (activeTab) {
      // @ts-ignore - passing props dynamically
      case 'overview': return <SupplierOverviewPage {...props} />;
      // @ts-ignore
      case 'products': return <SupplierProductsPage {...props} />;
      case 'jobs': return <JobsPage hideHeader={true} />; // Jobs Page without header
      // @ts-ignore
      case 'finance': return <SupplierFinancePage {...props} />;
      // @ts-ignore
      case 'orders': return <SupplierOrdersPage {...props} />;
      // @ts-ignore
      case 'messages': return <SupplierMessagesPage {...props} />;
      // @ts-ignore
      case 'profile': return <SupplierProfilePage {...props} />;
      default: return <SupplierOverviewPage {...props} />;
    }
  };

  // Show a suspension notice if account is suspended
  if (suspensionChecked && isSuspended) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border-2 border-red-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🚫</span>
          </div>
          <h1 className="text-2xl font-bold text-red-700 mb-3">حسابك معلق</h1>
          <p className="text-gray-600 mb-2">تم تعليق حساب شركتك من قِبل إدارة المنصة.</p>
          <p className="text-gray-500 text-sm mb-6">
            لن يظهر حسابك أو منتجاتك في المتجر أو المجتمع الطبي حتى يتم رفع التعليق.
          </p>
          <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 text-right space-y-1 mb-6">
            <p><span className="font-bold">للاستفسار:</span> تواصل مع الدعم الفني</p>
            <p><span className="font-bold">البريد:</span> support@smartdental.com</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full py-3 px-6 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-right font-sans" dir="rtl">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-xl text-gray-900 tracking-tight">مركز الموردين</h1>
                <p className="text-xs text-blue-600 font-medium">Smart Dental</p>
              </div>
            </div>

            {/* Desktop & Mobile Navigation (Horizontal Scroll) */}
            <nav className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar mask-gradient-x px-2 mx-4" style={{ scrollbarWidth: 'none' }}>
              {menuItems.filter(item => item.id !== 'jobs').map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 group whitespace-nowrapflex-shrink-0 ${activeTab === item.id
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg shadow-blue-500/25`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/80'
                    }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'text-white' : ''}`} />
                  <span className="font-medium text-sm">{item.label}</span>

                  {/* Active indicator */}
                  {activeTab === item.id && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-sm animate-pulse" />
                  )}
                </button>
              ))}
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-white/60 hover:bg-white transition-all ring-1 ring-transparent hover:ring-gray-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-sm overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user?.name || 'S'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-sm">{user?.name?.[0]?.toUpperCase() || 'S'}</span>
                    )}
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name || 'مورد'}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>


                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 mb-2 bg-gray-50 rounded-xl">
                      <p className="font-bold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button onClick={() => { setActiveTab('profile'); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                      <Settings className="w-4 h-4" />
                      الإعدادات
                    </button>
                    <div className="h-px bg-gray-100 my-1" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>
      </div>


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderActiveComponent()}
        </div>
      </main>

      {/* Backdrop for Dropdowns */}
      {
        (showUserMenu || isMobileMenuOpen) && (
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => { setShowUserMenu(false); setIsMobileMenuOpen(false); }}
          />
        )
      }

      <BottomNavigation />
    </div >
  );
};
