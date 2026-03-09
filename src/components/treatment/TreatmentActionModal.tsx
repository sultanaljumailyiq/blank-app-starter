import React, { useState } from 'react';
import { Button } from '../common/Button';
import { ToothCondition, TreatmentType } from '../../types/treatment';
import { X, Activity, AlertCircle, Stethoscope, ChevronRight } from 'lucide-react';

interface TreatmentActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    tooth: ToothCondition;
    onSaveCondition: (condition: string) => void;
    onCreatePlan: (type: TreatmentType) => void;
}

export const TreatmentActionModal: React.FC<TreatmentActionModalProps> = ({
    isOpen,
    onClose,
    tooth,
    onSaveCondition,
    onCreatePlan
}) => {
    const [activeTab, setActiveTab] = useState<'condition' | 'treatment'>('condition');
    const [selectedCondition, setSelectedCondition] = useState<string>(tooth.condition);
    const [selectedTreatment, setSelectedTreatment] = useState<TreatmentType | null>(null);

    if (!isOpen) return null;

    const conditions = [
        { id: 'healthy', label: 'سليم', color: 'bg-white border-gray-200' },
        { id: 'decayed', label: 'تسوس', color: 'bg-red-50 border-red-200 text-red-700' },
        { id: 'missing', label: 'مفقود', color: 'bg-gray-50 border-gray-200 text-gray-500' },
        { id: 'filled', label: 'حشوة موجودة', color: 'bg-blue-50 border-blue-200 text-blue-700' },
        { id: 'crown', label: 'تويج (Crown)', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
        { id: 'endo', label: 'علاج عصب سابق', color: 'bg-purple-50 border-purple-200 text-purple-700' },
        { id: 'implant', label: 'زرعة', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    ];

    const treatments = [
        { id: 'endo', label: 'علاج عصب (RCT)', icon: Activity, desc: '4 جلسات: فتح، قياس، حشو، ترميم' },
        { id: 'implant', label: 'زراعة أسنان', icon: AlertCircle, desc: 'تخطيط، جراحة، تعويض' },
        { id: 'prosthetic', label: 'تركيبات (Crown/Bridge)', icon: Stethoscope, desc: 'برد، طبعات، تجربة، تثبيت' },
        { id: 'general', label: 'حشوة تجميلية', icon: Activity, desc: 'جلسة واحدة' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-900">
                        السن رقم <span className="text-blue-600 font-mono text-xl">#{tooth.number}</span>
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('condition')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'condition' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        تشخيص الحالة
                    </button>
                    <button
                        onClick={() => setActiveTab('treatment')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'treatment' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        خطة علاجية جديدة
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'condition' ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {conditions.map((cond) => (
                                    <button
                                        key={cond.id}
                                        onClick={() => setSelectedCondition(cond.id)}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${selectedCondition === cond.id
                                                ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                                                : 'border-transparent ' + cond.color
                                            }`}
                                    >
                                        {cond.label}
                                    </button>
                                ))}
                            </div>

                            <div className="pt-4 border-t flex justify-end">
                                <Button onClick={() => onSaveCondition(selectedCondition)} className="w-full">
                                    حفظ الحالة
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="space-y-2">
                                {treatments.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setSelectedTreatment(t.id as TreatmentType)}
                                        className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedTreatment === t.id
                                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                                : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${selectedTreatment === t.id ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                <t.icon className="w-5 h-5" />
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">{t.label}</div>
                                                <div className="text-xs text-gray-500">{t.desc}</div>
                                            </div>
                                        </div>
                                        {selectedTreatment === t.id && <ChevronRight className="w-5 h-5 text-blue-500" />}
                                    </button>
                                ))}
                            </div>

                            <div className="pt-4 border-t">
                                <Button
                                    onClick={() => selectedTreatment && onCreatePlan(selectedTreatment)}
                                    disabled={!selectedTreatment}
                                    className="w-full"
                                >
                                    إنشاء الخطة العلاجية
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
