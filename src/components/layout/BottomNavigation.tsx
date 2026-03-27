import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  Users,
  Stethoscope,
  Briefcase,
  ShoppingBag,
  LayoutDashboard,
  Package,
  TestTube
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth(); // Get user to access role

  // Check if current path is in excluded pages
  const isExcludedPage = (path: string) => {
    const excludedPages = [
      '/doctor-welcome', // صفحة استقبال الأطباء
      '/supplier-welcome', // صفحة استقبال الموردين
      '/services', // الخدمات الطبية
      '/login',
      '/register',
      '/forgot-password',
      '/privacy-policy',
      '/terms-of-service'
    ];

    // Add services sub-paths
    if (path.startsWith('/services')) {
      return true;
    }

    // Hide bottom navigation in Clinic Dashboard to prevent modal overlap
    if (path.includes('/doctor/clinic/')) {
      return true;
    }

    return excludedPages.includes(path);
  };

  // Don't show bottom navigation if:
  // 1. User is not authenticated
  // 2. Or user is on excluded pages
  if (!isAuthenticated || isExcludedPage(location.pathname)) {
    return null;
  }

  // --- Menu Variants ---

  // 1. Generic Menu (Staff / Clinic Owner - fallback)
  const genericMenu = [
    { id: 'home', label: 'الرئيسية', icon: Building2, path: '/', activeOn: ['/', '/services', '/article'] },
    { id: 'community', label: 'المجتمع', icon: Users, path: '/community', activeOn: ['/community'] },
    { id: 'doctor', label: 'مركز الأطباء', icon: Stethoscope, path: '/doctor', activeOn: ['/doctor-welcome', '/doctor'] },
    { id: 'jobs', label: 'التوظيف', icon: Briefcase, path: '/jobs', activeOn: ['/jobs'] },
    { id: 'store', label: 'المتجر', icon: ShoppingBag, path: '/store', activeOn: ['/store'] },
  ];

  // 1.1 Doctor Specific Menu (Internal Routing)
  const doctorMenu = [
    { id: 'home', label: 'الرئيسية', icon: Building2, path: '/doctor/home', activeOn: ['/doctor/home', '/', '/services'] },
    { id: 'community', label: 'المجتمع', icon: Users, path: '/doctor/community', activeOn: ['/doctor/community', '/community'] },
    { id: 'doctor', label: 'مركز الأطباء', icon: Stethoscope, path: '/doctor', activeOn: ['/doctor', '/doctor/overview'] },
    { id: 'jobs', label: 'التوظيف', icon: Briefcase, path: '/doctor/jobs', activeOn: ['/doctor/jobs', '/jobs'] },
    { id: 'store', label: 'المتجر', icon: ShoppingBag, path: '/store', activeOn: ['/store'] },
  ];

  // 2. Supplier Menu
  const supplierMenu = [
    { id: 'store', label: 'المتجر', icon: ShoppingBag, path: '/store', activeOn: ['/store'] },
    { id: 'supplier', label: 'مركز الموردين', icon: Package, path: '/supplier', activeOn: ['/supplier'] },
    { id: 'jobs', label: 'التوظيف', icon: Briefcase, path: '/jobs', activeOn: ['/jobs'] },
  ];

  // 3. Lab Menu
  const labMenu = [
    { id: 'store', label: 'المتجر', icon: ShoppingBag, path: '/store', activeOn: ['/store'] },
    { id: 'lab', label: 'مركز المعامل', icon: TestTube, path: '/laboratory', activeOn: ['/laboratory'] },
    { id: 'jobs', label: 'التوظيف', icon: Briefcase, path: '/laboratory/jobs', activeOn: ['/laboratory/jobs', '/jobs'] },
  ];

  // 4. Admin Menu
  const adminMenu = [
    { id: 'home', label: 'الرئيسية', icon: Building2, path: '/', activeOn: ['/', '/services', '/article'] },
    { id: 'community', label: 'المجتمع', icon: Users, path: '/community', activeOn: ['/community'] },
    { id: 'admin', label: 'إدارة المنصة', icon: LayoutDashboard, path: '/admin', activeOn: ['/admin'] },
    { id: 'jobs', label: 'التوظيف', icon: Briefcase, path: '/jobs', activeOn: ['/jobs'] },
    { id: 'store', label: 'المتجر', icon: ShoppingBag, path: '/store', activeOn: ['/store'] },
  ];

  // --- Select Menu Based on Role ---
  let navItems = genericMenu; // Default

  if (user?.role === 'doctor') {
    navItems = doctorMenu;
  } else if (user?.role === 'supplier') {
    navItems = supplierMenu;
  } else if (user?.role === 'laboratory') {
    navItems = labMenu;
  } else if (user?.role === 'admin') {
    navItems = adminMenu;
  }
  // 'staff', 'clinic-owner' fallback to genericMenu

  const isActive = (activeOn: string[]) => {
    return activeOn.some(path => {
      if (path === '/') {
        return location.pathname === '/' || location.pathname === '/services' || location.pathname.startsWith('/article');
      }
      return location.pathname.startsWith(path);
    });
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50" dir="ltr">
      <div className="max-w-7xl mx-auto px-2 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.activeOn);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center justify-center px-2 py-1.5 rounded-xl transition-all min-w-[64px] no-underline duration-200 ${active
                  ? 'text-blue-600 bg-blue-50/80 -translate-y-1'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                aria-label={item.label}
              >
                <Icon className={`w-6 h-6 mb-1 transition-colors ${active ? 'text-blue-600 fill-blue-600/10' : 'text-gray-500'}`} strokeWidth={active ? 2.5 : 2} />
                <span className={`text-[10px] font-bold ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
