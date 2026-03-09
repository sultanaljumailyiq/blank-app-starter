import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, CheckCircle, X } from 'lucide-react';
import { Button } from '../common/Button';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description: string;
    feature?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, title, description, feature }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Crown className="w-10 h-10 text-purple-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {description}
                    </p>

                    <div className="bg-purple-50 rounded-2xl p-4 mb-8 text-right">
                        <h4 className="font-bold text-purple-900 mb-2 text-sm">مزايا الترقية:</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-sm text-purple-700">
                                <CheckCircle className="w-4 h-4 text-purple-600" />
                                <span>صلاحيات غير محدودة</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-purple-700">
                                <CheckCircle className="w-4 h-4 text-purple-600" />
                                <span>فتح جميع المميزات الحصرية</span>
                            </li>
                            <li className="flex items-center gap-2 text-sm text-purple-700">
                                <CheckCircle className="w-4 h-4 text-purple-600" />
                                <span>أولوية في الدعم الفني</span>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => navigate('/doctor/subscription/upgrade')}
                            className="w-full py-4 text-lg shadow-lg shadow-purple-200 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            ترقية الباقة الآن
                        </Button>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-sm font-medium py-2"
                        >
                            ليس الآن
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
