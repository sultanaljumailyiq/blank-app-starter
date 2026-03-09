import React, { useState } from 'react';
import { X, Award, Shield, Building, Clock } from 'lucide-react';
import { Button } from '../../../components/common/Button';

interface VerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (data: { hospital: string; experience: number }) => void;
    type: 'elite' | 'syndicate';
    name: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({ isOpen, onClose, onConfirm, type, name }) => {
    const [hospital, setHospital] = useState('');
    const [experience, setExperience] = useState<number>(0);

    if (!isOpen) return null;

    const handleSubmit = () => {
        onConfirm({ hospital, experience });
        onClose();
        setHospital('');
        setExperience(0);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type === 'elite' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                            {type === 'elite' ? <Award className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">
                                {type === 'elite' ? 'توثيق النخبة الطبية' : 'توثيق نقابة الأسنان'}
                            </h3>
                            <p className="text-sm text-gray-500">للطبيب: {name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            مكان العمل / المستشفى
                        </label>
                        <input
                            type="text"
                            placeholder="مثال: مستشفى الكندي العام / عيادة النخبة"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                            value={hospital}
                            onChange={(e) => setHospital(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            سنوات الخبرة
                        </label>
                        <input
                            type="number"
                            placeholder="0"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                            value={experience}
                            onChange={(e) => setExperience(parseInt(e.target.value) || 0)}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex gap-3">
                    <Button variant="ghost" className="flex-1" onClick={onClose}>
                        إلغاء
                    </Button>
                    <Button
                        className={`flex-1 text-white ${type === 'elite' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                        onClick={handleSubmit}
                    >
                        تأكيد التوثيق
                    </Button>
                </div>
            </div>
        </div>
    );
};
