import React, { useState } from 'react';
import { OverviewTab } from './tabs/OverviewTab';
import { EducationTab } from './tabs/EducationTab';
import GroupsTab from './tabs/GroupsTab';
import { FriendsTab } from './tabs/FriendsTab';
import { ProfileTab } from './tabs/ProfileTab';

export const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'education' | 'groups' | 'friends' | 'profile'>('overview');

  const tabs = [
    { id: 'overview', label: 'نظرة عامة' },
    { id: 'education', label: 'التعليم' },
    { id: 'groups', label: 'المجموعات' },
    { id: 'friends', label: 'الأصدقاء' },
    { id: 'profile', label: 'الملف الشخصي' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Sticky Top Navigation */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="flex overflow-x-auto no-scrollbar px-2 justify-center">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                                flex-shrink-0 px-4 py-4 text-sm font-bold relative transition-colors
                                ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'}
                            `}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Application Content */}
      <div className="max-w-3xl mx-auto min-h-[calc(100vh-120px)]">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'education' && <EducationTab />}
        {activeTab === 'groups' && <GroupsTab />}
        {activeTab === 'friends' && <FriendsTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </div>
    </div>
  );
};
