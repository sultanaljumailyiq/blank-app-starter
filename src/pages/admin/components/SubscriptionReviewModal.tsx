import React, { useState } from 'react';
import { AdminModal } from '../../../components/admin/AdminModal';
import {
    Phone,
    MessageCircle,
    Eye,
    CheckCircle,
    XCircle,
    Stethoscope,
    User
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface SubscriptionReviewModalProps {
    request: any;
    isOpen: boolean;
    onClose: () => void;
    onApprove: (request: any) => void;
    onReject: (request: any) => void;
    onViewDoctor: (request: any) => void; // Trigger parent to show OwnerDetails
}

export const SubscriptionReviewModal: React.FC<SubscriptionReviewModalProps> = ({
    request,
    isOpen,
    onClose,
    onApprove,
    onReject,
    onViewDoctor
}) => {
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [doctorAvatar, setDoctorAvatar] = useState<string | null>(null);

    React.useEffect(() => {
        if (isOpen && request) {
            const fetchDoctorAvatar = async () => {
                let ownerId = request.user_id || request.doctor_id;

                if (!ownerId && (request.email || request.phone)) {
                    // Try lookup
                    try {
                        if (request.email) {
                            const { data } = await supabase.from('users').select('id').eq('email', request.email).maybeSingle();
                            if (data) ownerId = data.id;
                        }
                        if (!ownerId && request.phone) {
                            const { data } = await supabase.from('users').select('id').eq('phone_number', request.phone).maybeSingle();
                            if (data) ownerId = data.id;
                        }
                    } catch (e) { console.error(e); }
                }

                if (ownerId) {
                    const { data } = await supabase.from('profiles').select('avatar_url').eq('id', ownerId).single();
                    if (data?.avatar_url) setDoctorAvatar(data.avatar_url);
                    else setDoctorAvatar(null);
                } else {
                    setDoctorAvatar(null);
                }
            };
            fetchDoctorAvatar();
        }
    }, [isOpen, request]);

    if (!request) return null;

    return (
        <>
            <AdminModal
                isOpen={isOpen}
                onClose={onClose}
                title="مراجعة طلب الاشتراك"
                size="lg"
            >
                <div className="space-y-6">
                    {/* Doctor Header & Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl font-bold overflow-hidden">
                                {doctorAvatar ? (
                                    <img src={doctorAvatar} alt={request.doctorName} className="w-full h-full object-cover" />
                                ) : (
                                    request.doctorName?.charAt(0) || '?'
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{request.doctorName || 'غير متوفر'}</h3>
                                <p className="text-gray-500">{request.clinicName || 'اسم العيادة غير متوفر'}</p>
                                <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                    <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {request.phone}</span>
                                    <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {request.email || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => onViewDoctor(request)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Stethoscope className="w-4 h-4" />
                            تفاصيل الطبيب
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border border-gray-200 rounded-xl bg-white">
                            <span className="text-sm text-gray-500 block mb-1">الباقة المطلوبة</span>
                            <span className="font-bold text-lg text-purple-600">{request.requestedPlan}</span>
                        </div>
                        <div className="p-4 border border-gray-200 rounded-xl bg-white">
                            <span className="text-sm text-gray-500 block mb-1">طريقة الدفع</span>
                            <span className="font-bold text-lg text-gray-900">
                                {request.paymentMethod === 'zain' ? 'ZainCash' : request.paymentMethod === 'agent' ? 'عن طريق وكيل' : (request.paymentMethod === 'rafidain' ? 'QiCard' : request.paymentMethod)}
                            </span>
                        </div>
                    </div>

                    {/* Sender Details (From Payment Details) */}
                    {(request.paymentDetails?.senderName || request.paymentDetails?.notes) && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm space-y-2">
                            <h4 className="font-bold text-gray-900 border-b pb-2 mb-2">معلومات الدفع الإضافية</h4>
                            {request.paymentDetails?.senderName && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div><span className="text-gray-500">اسم المرسل:</span> <span className="font-medium">{request.paymentDetails.senderName}</span></div>
                                    <div><span className="text-gray-500">رقم الهاتف:</span> <span className="font-medium" dir="ltr">{request.paymentDetails.senderPhone}</span></div>
                                </div>
                            )}
                            {request.paymentDetails?.notes && (
                                <div className="pt-2">
                                    <span className="text-gray-500 block">ملاحظات:</span>
                                    <p className="text-gray-800 bg-white p-2 rounded border border-gray-100 mt-1">{request.paymentDetails.notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {request.paymentMethod === 'agent' ? (
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100">
                            <strong className="block mb-1">دفع عن طريق الوكيل:</strong>
                            <p className="text-sm opacity-90">يرجى الاتصال بالوكيل المحدد للتأكد من استلام المبلغ نقداً.</p>
                            <div className="mt-2 text-sm bg-white/50 p-2 rounded-lg inline-block">
                                وكيل: {request.agentName || 'عام'} - {request.agentGovernorate || 'غير محدد'}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h4 className="font-bold mb-3 text-gray-900">صورة الإشعار / الوصل</h4>
                            <div
                                onClick={() => request.receiptImageUrl && setShowImagePreview(true)}
                                className="relative group cursor-pointer border-2 border-dashed border-gray-200 rounded-xl overflow-hidden h-48 bg-gray-50 flex items-center justify-center hover:border-purple-300 transition-colors"
                            >
                                {request.receiptImageUrl ? (
                                    <img src={request.receiptImageUrl} alt="Proof" className="object-cover w-full h-full opacity-100 group-hover:opacity-90 transition-opacity" />
                                ) : (
                                    <div className="text-gray-400 text-sm">لا توجد صورة مرفقة</div>
                                )}

                                {request.receiptImageUrl && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-white flex items-center gap-2 hover:underline font-medium">
                                            <Eye className="w-5 h-5" /> تكبير الصورة
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {request.status === 'pending' && (
                        <div className="flex gap-3 pt-6 border-t border-gray-100 font-medium">
                            <button
                                onClick={() => onReject(request)}
                                className="flex-1 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-5 h-5" />
                                رفض الطلب
                            </button>
                            <button
                                onClick={() => onApprove(request)}
                                className="flex-[2] bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-5 h-5" />
                                تأكيد واستلام المبلغ
                            </button>
                        </div>
                    )}
                </div>
            </AdminModal>

            {/* Image Preview Overlay */}
            {showImagePreview && request.receiptImageUrl && (
                <div
                    className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
                    onClick={() => setShowImagePreview(false)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-white/10 rounded-full p-2"
                        onClick={() => setShowImagePreview(false)}
                    >
                        <XCircle className="w-8 h-8" />
                    </button>
                    <img
                        src={request.receiptImageUrl}
                        alt="Full Receipt"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                    />
                </div>
            )}
        </>
    );
};
