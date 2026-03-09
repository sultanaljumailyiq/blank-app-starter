import React, { useState } from 'react';

import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Store,
  Users,
  Briefcase,
  Bell,
  Headphones,
  TestTube,
  Activity,
  Clock,
  Stethoscope,
  Shield,
  Megaphone
} from 'lucide-react';

// استيراد أقسام الإدارة
import { OverviewSection } from './sections/OverviewSection';
import { PlatformManagementSection } from './sections/PlatformManagementSection';
import { SubscriptionsSection } from './sections/SubscriptionsSection';
import { StoreSuppliersSection } from './sections/StoreSuppliersSection';
import { CommunitySection } from './sections/CommunitySection';
import { JobsSection } from './sections/JobsSection';
import { NotificationsSection } from './sections/NotificationsSection';
import { SupportSection } from './sections/SupportSection';
import { LaboratoryManagementSection } from './sections/LaboratoryManagementSection';
import { MedicalServicesSection } from './sections/MedicalServicesSection';




interface AdminSection {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}
const adminSections: AdminSection[] = [
  { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
  { id: 'medical-services', label: 'الخدمات الطبية', icon: Stethoscope },
  { id: 'platform', label: 'إدارة المنصة', icon: Settings },

  { id: 'store-suppliers', label: 'الموردين', icon: Store },
  { id: 'subscriptions', label: 'الاشتراكات والباقات', icon: CreditCard },
  { id: 'laboratory', label: 'إدارة المختبرات', icon: TestTube },
  { id: 'community', label: 'المجتمع الطبي', icon: Users },
  { id: 'jobs', label: 'إدارة الوظائف', icon: Briefcase },
  { id: 'notifications', label: 'الإشعارات والتنبيهات', icon: Bell },
  { id: 'support', label: 'الدعم الفني', icon: Headphones }
];

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [activeSubSection, setActiveSubSection] = useState<string | undefined>(undefined);

  const handleNavigate = (sectionId: string, subTab?: string) => {
    setActiveSection(sectionId);
    if (subTab) setActiveSubSection(subTab);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection onNavigate={handleNavigate} />;
      case 'medical-services':
        return <MedicalServicesSection />;
      case 'platform':
        return <PlatformManagementSection initialTab={activeSubSection as any} />;



      case 'subscriptions':
        return <SubscriptionsSection />;
      case 'laboratory':
        return <LaboratoryManagementSection />;
      case 'store-suppliers':
        return <StoreSuppliersSection />;
      case 'community':
        return <CommunitySection />;
      case 'jobs':
        return <JobsSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'support':
        return <SupportSection />;
      default:
        return <OverviewSection onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* عنوان الصفحة والعنوان */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100/50 sticky top-14 sm:top-[4.5rem] z-40 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* شريط التنقل الرئيسي */}
          <div className="flex overflow-x-auto scrollbar-hide py-3 gap-2">
            {adminSections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;

              return (
                <button
                  key={section.id}
                  onClick={() => handleNavigate(section.id)}
                  className={`
                    group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap
                    ${isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                      : 'bg-white/50 text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-purple-600'}`} />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>


        </div>
      </div>

      {/* محتوى القسم النشط */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderActiveSection()}
      </div>
    </div>
  );
}