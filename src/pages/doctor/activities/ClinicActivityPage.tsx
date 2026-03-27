import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Activity,
    Filter,
    Search,
    Calendar,
    User,
    RotateCcw,
    Trash2,
    FileText,
    DollarSign,
    Package,
    Clock
} from 'lucide-react';
import { useClinicActivity, ActivityLog } from '../../../hooks/useClinicActivity';
import { useClinics } from '../../../hooks/useClinics';
// import { useLanguage } from '../../../contexts/LanguageContext';

export const ClinicActivityPage: React.FC = () => {
    const { clinicId } = useParams<{ clinicId: string }>();
    const navigate = useNavigate();
    const { clinics } = useClinics();
    const clinic = clinics.find(c => c.id === clinicId || c.id.toString() === clinicId);

    const { activities, loading, undoAction } = useClinicActivity(clinicId || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    const getIcon = (type: string) => {
        switch (type) {
            case 'patient': return User;
            case 'financial': return DollarSign;
            case 'inventory': return Package;
            case 'appointment': return Calendar;
            default: return Activity;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'patient': return 'bg-blue-100 text-blue-600';
            case 'financial': return 'bg-green-100 text-green-600';
            case 'inventory': return 'bg-orange-100 text-orange-600';
            case 'appointment': return 'bg-purple-100 text-purple-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const filteredActivities = activities.filter(log =>
        (activeFilter === 'all' || log.entityType === activeFilter) &&
        (log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!clinic) return <div>Clinic Not Found</div>;

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/doctor/clinics')}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Activity className="w-6 h-6 text-indigo-600" />
                                سجل النشاطات - {clinic.name}
                            </h1>
                            <p className="text-sm text-gray-600">مراقبة جميع الإجراءات والتغييرات في النظام</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 sticky top-20 z-0">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="بحث في السجل..."
                                className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                            {['all', 'patient', 'appointment', 'financial', 'inventory'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setActiveFilter(type)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeFilter === type
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {type === 'all' ? 'الكل' :
                                        type === 'patient' ? 'المرضى' :
                                            type === 'appointment' ? 'المواعيد' :
                                                type === 'financial' ? 'المالية' : 'المخزون'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="max-w-3xl mx-auto space-y-6">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">جاري تحميل السجل...</div>
                    ) : filteredActivities.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Activity className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-gray-900 font-medium">لا توجد سجلات مطابقة</h3>
                            <p className="text-sm text-gray-500 mt-1">حاول تغيير معايير البحث أو الفلتر</p>
                        </div>
                    ) : (
                        filteredActivities.map((log) => {
                            const Icon = getIcon(log.entityType);
                            const colorClass = getColor(log.entityType);

                            return (
                                <div key={log.id} className="relative pl-4 group">
                                    {/* Timeline Line */}
                                    <div className="absolute top-0 right-0 bottom-0 w-px bg-gray-200 group-last:hidden translate-x-[2.25rem]"></div>

                                    <div className="flex gap-4 items-start">
                                        {/* Icon */}
                                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass} border-4 border-white shadow-sm ring-1 ring-gray-100`}>
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        {/* Card */}
                                        <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-base">{log.description}</p>
                                                    <p className="text-xs text-indigo-600 font-medium mt-0.5">{log.action}</p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(log.performedAt).toLocaleString('ar-IQ')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                                        {log.performedBy.charAt(0)}
                                                    </div>
                                                    <span className="text-sm text-gray-600">قام بالاجراء: <span className="font-medium text-gray-900">{log.performedBy}</span></span>
                                                </div>

                                                {/* Undo Button */}
                                                {log.metadata?.restoreId && (
                                                    <button
                                                        onClick={() => undoAction(log.id)}
                                                        disabled={log.loading}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors border ${log.loading
                                                                ? 'bg-gray-100 text-gray-400 border-transparent cursor-wait'
                                                                : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'
                                                            }`}
                                                    >
                                                        <RotateCcw className={`w-3.5 h-3.5 ${log.loading ? 'animate-spin' : ''}`} />
                                                        {log.loading ? 'جاري التراجع...' : 'تراجع عن الاجراء'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
