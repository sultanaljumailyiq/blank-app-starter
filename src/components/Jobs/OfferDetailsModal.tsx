import React from 'react';
import { X, Calendar, User, Briefcase, MessageSquare } from 'lucide-react';
import { Button } from '../common/Button';

interface OfferDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    offer: any;
}

export const OfferDetailsModal: React.FC<OfferDetailsModalProps> = ({ isOpen, onClose, offer }) => {
    if (!isOpen || !offer) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold mb-1">تفاصيل عرض العمل</h2>
                        <p className="text-blue-100 text-sm flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(offer.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Job Info */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200 text-blue-600">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-1">المسمى الوظيفي</p>
                            <h3 className="font-bold text-gray-900">{offer.job_title || 'عرض عام (غير محدد)'}</h3>
                        </div>
                    </div>

                    {/* Sender Info */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">مقدم العرض</p>
                            <p className="font-bold text-gray-900">{offer.sender?.title || 'مجهول'}</p>
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            رسالة العرض
                        </h4>
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {offer.message}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <Button onClick={onClose} className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                            إغلاق
                        </Button>
                        {/* Future: Add Accept/Reject buttons here */}
                    </div>
                </div>
            </div>
        </div>
    );
};
