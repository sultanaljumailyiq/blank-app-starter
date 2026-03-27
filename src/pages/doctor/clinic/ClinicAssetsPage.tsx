import React, { useState } from 'react';
import { Briefcase, LayoutDashboard, Stethoscope, Package, Monitor, ClipboardList } from 'lucide-react';
import { Card } from '../../../components/common/Card';

// Import sub-sections
import { AssetsOverview } from './sections/assets/AssetsOverview';
import { AssetsTreatments } from './sections/assets/AssetsTreatments';
// Swapped to main page component which has Supabase integration
import { ClinicInventoryPage } from './ClinicInventoryPage';
import { AssetsDevices } from './sections/assets/AssetsDevices';

interface ClinicAssetsPageProps {
    clinicId?: string;
}

export const ClinicAssetsPage: React.FC<ClinicAssetsPageProps> = ({ clinicId = '1' }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'overview':
                return <AssetsOverview />;
            case 'treatments':
                return <AssetsTreatments />;
            case 'inventory':
                return <ClinicInventoryPage clinicId={clinicId} />;
            case 'devices':
                return <AssetsDevices clinicId={clinicId} />;
            default:
                return <AssetsOverview />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-200">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">الأصول والخدمات</h2>
                        <p className="text-gray-600">إدارة شاملة للعلاجات، المخزون، والأجهزة الطبية</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <Card>
                <div className="border-b border-gray-100">
                    <div className="flex overflow-x-auto scrollbar-hide px-2">
                        {[
                            { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
                            { id: 'treatments', label: 'العلاجات', icon: Stethoscope },
                            { id: 'inventory', label: 'المخزون', icon: Package },
                            { id: 'devices', label: 'الأصول الثابتة (أجهزة / أثاث)', icon: Monitor }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id
                                    ? 'border-emerald-600 text-emerald-600 bg-emerald-50/50'
                                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Tab Content */}
            <div className="transition-all duration-300">
                {renderActiveTab()}
            </div>
        </div>
    );
};
