import React, { useState } from 'react';
import { BentoStatCard } from '../../../components/dashboard/BentoStatCard';
import {
  Users,
  GraduationCap,
  Award,
  BookOpen,
  Box,
  Video
} from 'lucide-react';
import { CoursesManager } from '../community/CoursesManager';
import { WebinarsManager } from '../community/WebinarsManager';
import { UsersManager } from '../community/UsersManager';
import { ResourcesManager } from '../community/ResourcesManager';
import { ModelsManager } from '../community/ModelsManager';
// Duplicate ModelsManager import removed

import { GroupsManager } from '../community/GroupsManager';

export const CommunitySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('courses');

  // Mock stats - in real app would come from context/api
  const stats = {
    courses: 12,
    webinars: 8,
    elite: 45,
    resources: 156
  };

  return (
    <div className="space-y-8">
      {/* العنوان */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">إدارة المجتمع الطبي والتعليم</h2>
        <p className="text-gray-600">إدارة الندوات والدورات، المصادر العلمية، والنخبة الطبية</p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <BentoStatCard
          title="الدورات التدريبية"
          value={stats.courses}
          icon={GraduationCap}
          color="blue"
          trend="neutral"
          trendValue="دورة نشطة"
          delay={0}
        />

        <BentoStatCard
          title="الندوات الإلكترونية"
          value={stats.webinars}
          icon={Video}
          color="green"
          trend="neutral"
          trendValue="ندوة قادمة"
          delay={100}
        />

        <BentoStatCard
          title="النخبة الطبية"
          value={stats.elite}
          icon={Award}
          color="orange"
          trend="neutral"
          trendValue="طبيب معتمد"
          delay={200}
        />

        <BentoStatCard
          title="المصادر العلمية"
          value={stats.resources}
          icon={BookOpen}
          color="purple"
          trend="neutral"
          trendValue="مرجع وبحث"
          delay={300}
        />
      </div>

      {/* التبويبات */}
      <div className="bg-white p-1 rounded-2xl border border-gray-200 inline-flex flex-wrap gap-1">
        {[
          { id: 'courses', label: 'الدورات', icon: GraduationCap },
          { id: 'webinars', label: 'الندوات', icon: Video },
          { id: 'groups', label: 'المجموعات', icon: Users }, // New Tab
          { id: 'users', label: 'الأطباء والنخبة', icon: Award },
          { id: 'resources', label: 'المصادر', icon: BookOpen },
          { id: 'models', label: 'نماذج 3D', icon: Box }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-2.5 px-6 rounded-xl font-medium text-sm transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* محتوى التبويب النشط */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-6 min-h-[500px]">
        {activeTab === 'courses' && <CoursesManager />}
        {activeTab === 'webinars' && <WebinarsManager />}
        {activeTab === 'groups' && <GroupsManager />}
        {activeTab === 'users' && <UsersManager />}
        {activeTab === 'resources' && <ResourcesManager />}
        {activeTab === 'models' && <ModelsManager />}
      </div>
    </div>
  );
};