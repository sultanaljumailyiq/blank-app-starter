import React from 'react';
import {
    Brain, CheckCircle, AlertTriangle, Phone, Mail, MapPin,
    Activity, Calendar, Clock, AlertCircle, FileText, Plus,
    Stethoscope, Pill, History
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { formatDate } from '../../../lib/utils';

// We can move these interfaces to a shared types file later
interface Patient {
    id: string;
    name: string;
    age: number;
    gender: 'male' | 'female';
    phone: string;
    email: string;
    address: string;
    registrationDate: string;
    medicalHistory: string[];
    allergies: string[];
    medications: string[];
    emergencyContact: {
        name: string;
        phone: string;
        relation: string;
    };
    upcomingAppointments: {
        id: string;
        type: string;
        date: string;
        time: string;
        doctor: string;
        status: 'scheduled' | 'confirmed' | 'cancelled';
    }[];
    recentActivity: {
        id: string;
        type: string;
        description: string;
        date: string;
        cost: number;
        status: string;
    }[];
}

interface OverviewTabProps {
    patient: Patient;
    stats: {
        totalTeeth: number;
        healthyTeeth: number;
        needsTreatment: number;
        completedTreatments: number;
        inProgressTreatments: number;
    };
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ patient, stats }) => {
    return (
        <div className="space-y-6">
            {/* 1. Smart Health Summary (Top Dashboard) */}
            <Card className="border-2 border-gradient-to-r from-blue-500 to-purple-600 bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            ملخص الحالة الصحية
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 text-sm font-bold">{stats.totalTeeth}</span>
                                </div>
                                <h4 className="text-sm font-medium text-gray-700">إجمالي الأسنان</h4>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                </div>
                                <h4 className="text-sm font-medium text-gray-700">أسنان سليمة</h4>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-green-600">{stats.healthyTeeth}</span>
                                <span className="text-xs text-gray-500">
                                    {stats.totalTeeth > 0 ? Math.round((stats.healthyTeeth / stats.totalTeeth) * 100) : 0}%
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                                </div>
                                <h4 className="text-sm font-medium text-gray-700">تحتاج علاج</h4>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-orange-600">{stats.needsTreatment}</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-purple-600" />
                                </div>
                                <h4 className="text-sm font-medium text-gray-700">علاجات جارية</h4>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xl font-bold text-purple-600">{stats.inProgressTreatments}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. Right Column: Patient Info & Medical History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <Card>
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-500" />
                                المعلومات الشخصية
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">الاسم الكامل</span>
                                        <span className="font-medium text-gray-900">{patient.name}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">العمر / الجنس</span>
                                        <span className="font-medium text-gray-900">{patient.age} سنة / {patient.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                        <span className="text-gray-500">تاريخ التسجيل</span>
                                        <span className="font-medium text-gray-900">{patient.registrationDate}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span dir="ltr">{patient.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span>{patient.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{patient.address}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg w-fit">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-sm font-medium">طوارئ: {patient.emergencyContact.name} ({patient.emergencyContact.phone})</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Medical History Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        التنبيهات والأمراض المزمنة
                                    </h4>
                                    <button className="text-blue-600 hover:bg-blue-50 p-1 rounded-full">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {patient.medicalHistory.map((item, idx) => (
                                        <span key={idx} className="bg-red-50 text-red-700 px-2.5 py-1 rounded-md text-sm font-medium border border-red-100">
                                            {item}
                                        </span>
                                    ))}
                                    {patient.medicalHistory.length === 0 && <span className="text-gray-400 text-sm">لا توجد أمراض مسجلة</span>}
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        <Stethoscope className="w-5 h-5 text-blue-500" />
                                        الحساسية
                                    </h4>
                                    <button className="text-blue-600 hover:bg-blue-50 p-1 rounded-full">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {patient.allergies.map((item, idx) => (
                                        <span key={idx} className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-md text-sm font-medium border border-orange-100">
                                            {item}
                                        </span>
                                    ))}
                                    {patient.allergies.length === 0 && <span className="text-gray-400 text-sm">لا توجد حساسية مسجلة</span>}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* 3. Left Column: Appointments & Activity */}
                <div className="space-y-6">
                    {/* Upcoming Appointments */}
                    <Card>
                        <div className="p-5">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                المواعيد القادمة
                            </h3>
                            <div className="space-y-3">
                                {patient.upcomingAppointments.length > 0 ? (
                                    patient.upcomingAppointments.map((apt) => (
                                        <div key={apt.id} className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-blue-800">{apt.type}</span>
                                                <span className="bg-white text-blue-600 text-xs px-2 py-0.5 rounded-full border border-blue-200">مؤكد</span>
                                            </div>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{apt.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{apt.time}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                        لا توجد مواعيد قادمة
                                    </div>
                                )}
                                <Button variant="outline" className="w-full mt-2 text-sm">
                                    حجز موعد جديد
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                        <div className="p-5">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <History className="w-5 h-5 text-gray-600" />
                                النشاط الأخير
                            </h3>
                            <div className="space-y-4">
                                {patient.recentActivity.map((act) => (
                                    <div key={act.id} className="relative pl-4 border-l-2 border-gray-100 pb-1 last:pb-0">
                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white ring-1 ring-gray-100"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{act.description}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{act.date}</p>
                                        </div>
                                    </div>
                                ))}
                                <button className="text-blue-600 text-sm font-medium hover:underline w-full text-center mt-2">
                                    عرض كل السجل
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
