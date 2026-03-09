import React, { useState } from 'react';
import {
    X, Calendar, CreditCard, FileText, Clock, CheckCircle, AlertTriangle, Download, Upload,
    MessageSquare, Phone, MapPin, Stethoscope, ChevronRight, Printer, Share2, DollarSign,
    Activity, Shield, TestTube, Building2, Truck, RotateCcw, Edit, Star, ThumbsUp, Wallet, AlertOctagon
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { DoctorLabChat } from './DoctorLabChat';
import { getLabs } from '../../data/mock/assets';

interface LabCaseDetailsProps {
    caseId: string;
    isOpen: boolean;
    onClose: () => void;
    caseData: any;
    onUpdateStatus?: (id: string, status: string, updates?: any) => void;
    isManualManagement?: boolean;
    onAddToExpenses?: (caseData: any) => void;
}

export const LabCaseDetails: React.FC<LabCaseDetailsProps> = ({ caseId, isOpen, onClose, caseData, onUpdateStatus, isManualManagement = false, onAddToExpenses }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'financial' | 'timeline' | 'files'>('details');
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [showModificationModal, setShowModificationModal] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);


    const [returnReason, setReturnReason] = useState('');
    const [modificationNote, setModificationNote] = useState('');
    const [rating, setRating] = useState(5);
    const [reviewNote, setReviewNote] = useState('');

    // Manual Management State
    const [manualStatus, setManualStatus] = useState(caseData?.status || 'pending');
    const [msgPaymentAmount, setMsgPaymentAmount] = useState(caseData?.paymentAmount || 0);
    const [manualExpectedDate, setManualExpectedDate] = useState(caseData?.expectedDate || '');

    if (!isOpen || !caseData) return null;

    const handleConfirmReceipt = () => {
        onUpdateStatus?.(caseData.id, 'delivered');
        // onClose(); // Don't close, allow them to finish/rate immediately if they want
    };

    const handleReturn = () => {
        if (!returnReason) return;
        onUpdateStatus?.(caseData.id, 'returned', { return_reason: returnReason, is_return_cycle: true });
        setShowReturnModal(false);
        onClose();
    };

    const handleRequestModification = () => {
        if (!modificationNote) return;
        onUpdateStatus?.(caseData.id, 'modification_requested', { return_reason: modificationNote });
        setShowModificationModal(false);
        onClose();
    };

    const handleFinishOrder = () => {
        setShowRatingModal(true);
    };

    const handleSubmitRating = () => {
        onUpdateStatus?.(caseData.id, 'completed', {
            rating: rating,
            review_note: reviewNote
        });
        setShowRatingModal(false);
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${caseData.isDisputed ? 'bg-amber-100 text-amber-600' :
                                caseData.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                    caseData.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                        'bg-blue-100 text-blue-600'
                                }`}>
                                {caseData.isDisputed ? <AlertOctagon className="w-5 h-5" /> : <TestTube className="w-5 h-5" />}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    سجل الحالة #{caseData.id}
                                    <span className={`px-2 py-0.5 text-xs rounded-full ${caseData.isDisputed ? 'bg-amber-100 text-amber-700' :
                                        caseData.status === 'completed' || caseData.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                            caseData.status === 'returned' || caseData.status === 'rejected' || caseData.status === 'modification_requested' ? 'bg-red-100 text-red-700' :
                                                caseData.status === 'out_for_delivery' ? 'bg-indigo-100 text-indigo-700' :
                                                    'bg-blue-100 text-blue-700'
                                        }`}>
                                        {caseData.isDisputed ? 'قيد النزاع' :
                                            caseData.status === 'out_for_delivery' ? 'جارِ التوصيل' :
                                                caseData.status === 'delivered' ? 'تم التسليم' :
                                                    caseData.status === 'returned' ? 'طلب استرجاع' :
                                                        caseData.status === 'modification_requested' ? 'طلب تعديل' :
                                                            caseData.status}
                                    </span>
                                </h2>
                                <p className="text-sm text-gray-500">
                                    المريض: <span className="font-medium text-gray-900">{caseData.patientName}</span> • المختبر: <span className="font-medium text-gray-900">{caseData.labName}</span>
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    تاريخ الطلب: <span className="font-medium text-gray-900">{caseData.createdAt || caseData.sentDate}</span> • المتوقع: <span className="font-medium text-indigo-600">{caseData.expectedDate}</span>
                                </p>
                            </div>
                        </div>
                        {/* ... Same as before ... */}
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => window.print()}>
                                <Printer className="w-4 h-4 ml-2" />
                                طباعة
                            </Button>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b px-4 bg-white sticky top-0 z-10">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            تفاصيل الطلب
                        </button>
                        <button
                            onClick={() => setActiveTab('financial')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'financial' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            المالية
                        </button>
                        <button
                            onClick={() => setActiveTab('timeline')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'timeline' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            سجل النشاط
                        </button>
                        <button
                            onClick={() => setActiveTab('files')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'files' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            الملفات ({caseData.attachments?.length || 0})
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                        {activeTab === 'details' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Main Info */}
                                <div className="lg:col-span-2 space-y-6">
                                    <Card className="p-6">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">المواصفات الفنية</h3>
                                        <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                            <div>
                                                <span className="text-xs text-gray-500 block">اسم الخدمة المطلوبة</span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-medium text-gray-900">
                                                        {caseData.testType?.split(' - ')[0] || caseData.treatmentType || 'غير محدد'}
                                                    </span>
                                                    {caseData.price !== undefined && (
                                                        <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md text-sm border border-blue-100">
                                                            {caseData.price.toLocaleString()} د.ع
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 block">رقم السن / المنطقة</span>
                                                <span className="font-medium mt-1 block">
                                                    {(() => {
                                                        const testParts = caseData.testType?.includes(' - ') ? caseData.testType.split(' - ').slice(1).join(' - ') : null;
                                                        if (testParts) return testParts;
                                                        const toothNums = caseData.tooth_numbers || caseData.toothNumbers || (caseData.tooth_number !== undefined ? [caseData.tooth_number] : (caseData.toothNumber !== undefined ? [caseData.toothNumber] : []));
                                                        if (toothNums.length === 0 || (toothNums.length === 1 && toothNums[0] === 0)) return 'علاج عام';
                                                        if (toothNums.length === 1) return `سن رقم: ${toothNums[0]}`;
                                                        return `الأسنان: ${toothNums.join(', ')}`;
                                                    })()}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500 block">تاريخ التسليم المتوقع</span>
                                                {isManualManagement ? (
                                                    <div className="flex flex-col gap-1">
                                                        <input
                                                            type="date"
                                                            value={manualExpectedDate}
                                                            onChange={(e) => {
                                                                setManualExpectedDate(e.target.value);
                                                                onUpdateStatus?.(caseData.id, manualStatus, { expectedDate: e.target.value });
                                                            }}
                                                            className="font-medium text-blue-600 bg-transparent border-b border-blue-200 focus:border-blue-500 focus:outline-none"
                                                        />
                                                        {new Date(manualExpectedDate) < new Date() && manualStatus !== 'delivered' && manualStatus !== 'completed' && (
                                                            <span className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                                                                <AlertTriangle className="w-3 h-3" />
                                                                متأخر
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="font-medium text-blue-600">{caseData.expectedDate}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-6">
                                            <span className="text-xs text-gray-500 block mb-2">ملاحظات الطبيب</span>
                                            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-gray-700 italic">
                                                "{caseData.notes || 'لا توجد ملاحظات إضافية'}"
                                            </div>
                                        </div>

                                        {caseData.return_reason && (
                                            <div className="mt-4">
                                                <span className="text-xs text-red-500 block mb-2">سبب الإرجاع</span>
                                                <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-700 font-medium">
                                                    {caseData.return_reason}
                                                </div>
                                            </div>
                                        )}
                                    </Card>

                                    <Card className="p-6">
                                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">تفاصيل المختبر</h3>
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Building2 className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                                            {caseData.labName}
                                                            {caseData.isAccredited && (
                                                                <div className="bg-purple-100 p-0.5 rounded-full" title="مختبر معتمد">
                                                                    <CheckCircle className="w-4 h-4 text-purple-600" />
                                                                </div>
                                                            )}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">{caseData.labAddress || caseData.lab_address || 'العنوان غير متوفر'}</p>
                                                    </div>
                                                    {!isManualManagement && (
                                                        <div className="flex gap-2">
                                                            {(() => {
                                                                const labPhone = caseData.contactInfo?.phone || caseData.lab_phone || getLabs().find(l => l.name === caseData.labName || l.id === caseData.laboratoryId)?.phone;
                                                                return labPhone ? (
                                                                    <a href={`tel:${labPhone}`} className="rounded-lg flex items-center justify-center font-medium transition-all duration-200 active:scale-95 bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-300 px-3 h-8 text-xs">
                                                                        <Phone className="w-3 h-3 ml-1" />
                                                                        اتصال
                                                                    </a>
                                                                ) : (
                                                                    <Button variant="outline" size="sm" className="h-8 text-xs" disabled>
                                                                        <Phone className="w-3 h-3 ml-1" />
                                                                        اتصال
                                                                    </Button>
                                                                );
                                                            })()}
                                                            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowChatModal(true)}>
                                                                <MessageSquare className="w-3 h-3 ml-1" />
                                                                مراسلة
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Delegate Info */}
                                                {(caseData.pickup_delegate_name || caseData.delivery_delegate_name || caseData.delegate_name) && (
                                                    <div className="flex flex-col gap-3 mb-3">
                                                        {(caseData.pickup_delegate_name || (!caseData.delivery_delegate_name && caseData.delegate_name)) && (
                                                            <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-lg border border-purple-100">
                                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                                                    <Truck className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <span className="text-xs text-purple-600 block font-bold">مندوب الاستلام</span>
                                                                    <span className="text-sm font-medium text-gray-900">{caseData.pickup_delegate_name || caseData.delegate_name}</span>
                                                                </div>
                                                                {caseData.pickup_delegate_phone ? (
                                                                    <a
                                                                        href={`tel:${caseData.pickup_delegate_phone}`}
                                                                        className="rounded-lg font-medium transition-all duration-200 active:scale-95 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs flex items-center gap-1 shadow-sm h-8"
                                                                    >
                                                                        <Phone className="w-3 h-3 ml-1" />
                                                                        اتصال
                                                                    </a>
                                                                ) : (
                                                                    <Button variant="outline" size="sm" className="h-8 text-xs bg-white text-gray-400 border-gray-200 cursor-not-allowed" disabled>
                                                                        <Phone className="w-3 h-3 ml-1" />
                                                                        اتصال
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}

                                                        {caseData.delivery_delegate_name && (
                                                            <div className="flex items-center gap-2 bg-cyan-50 p-2 rounded-lg border border-cyan-100">
                                                                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600">
                                                                    <Truck className="w-4 h-4" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <span className="text-xs text-cyan-600 block font-bold">مندوب التوصيل</span>
                                                                    <span className="text-sm font-medium text-gray-900">{caseData.delivery_delegate_name}</span>
                                                                </div>
                                                                {caseData.delivery_delegate_phone ? (
                                                                    <a
                                                                        href={`tel:${caseData.delivery_delegate_phone}`}
                                                                        className="rounded-lg font-medium transition-all duration-200 active:scale-95 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs flex items-center gap-1 shadow-sm h-8"
                                                                    >
                                                                        <Phone className="w-3 h-3 ml-1" />
                                                                        اتصال
                                                                    </a>
                                                                ) : (
                                                                    <Button variant="outline" size="sm" className="h-8 text-xs bg-white text-gray-400 border-gray-200 cursor-not-allowed" disabled>
                                                                        <Phone className="w-3 h-3 ml-1" />
                                                                        اتصال
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </Card>
                                </div>

                                {/* Side Info */}
                                <div className="space-y-6">
                                    <Card className="p-6 bg-blue-50 border-blue-100">
                                        <div className="text-center">
                                            <h3 className="text-sm font-medium text-blue-800 mb-1">الحالة الحالية</h3>

                                            {isManualManagement ? (
                                                <div className="space-y-4 mt-2">
                                                    <select
                                                        value={manualStatus}
                                                        onChange={(e) => {
                                                            const newStatus = e.target.value;
                                                            setManualStatus(newStatus);
                                                            onUpdateStatus?.(caseData.id, newStatus);
                                                        }}
                                                        className="w-full p-2 rounded-lg border-2 border-blue-200 bg-white text-blue-800 font-bold focus:border-blue-500 focus:outline-none"
                                                    >
                                                        <option value="pending">في انتظار الموافقة</option>
                                                        <option value="waiting_for_representative">بانتظار المندوب</option>
                                                        <option value="representative_dispatched">تم إرسال المندوب</option>
                                                        <option value="in_progress">قيد العمل</option>
                                                        <option value="out_for_delivery">جارِ التوصيل</option>
                                                        <option value="completed">مكتمل</option>
                                                        <option value="returned">طلب اعادة</option>
                                                        <option value="cancelled">ملغي</option>
                                                    </select>

                                                    <div className="flex items-center gap-2 justify-center text-xs text-blue-600">
                                                        <Edit className="w-3 h-3" />
                                                        <span>يمكنك تغيير الحالة يدوياً</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className={`text-2xl font-bold mb-2 ${caseData.status === 'out_for_delivery' ? 'text-indigo-700' :
                                                        caseData.status === 'delivered' ? 'text-green-700' :
                                                            caseData.status === 'returned' || caseData.status === 'modification_requested' ? 'text-red-700' : 'text-blue-700'
                                                        }`}>
                                                        {caseData.status === 'in_progress' ? 'قيد التنفيذ' :
                                                            caseData.status === 'completed' ? 'مكتمل (مغلق)' :
                                                                caseData.status === 'out_for_delivery' ? 'جارِ التوصيل' :
                                                                    caseData.status === 'delivered' ? 'مستلم' :
                                                                        caseData.status === 'returned' ? 'طلب استرجاع' :
                                                                            caseData.status === 'modification_requested' ? 'طلب تعديل' :
                                                                                'قيد الانتظار'}
                                                    </p>
                                                    <div className="w-full bg-blue-200 h-2 rounded-full mt-2 overflow-hidden">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-500 ${caseData.status === 'returned' || caseData.status === 'rejected' ? 'bg-red-500' : 'bg-blue-600'
                                                                }`}
                                                            style={{ width: caseData.status === 'completed' || caseData.status === 'delivered' ? '100%' : '50%' }}
                                                        ></div>
                                                    </div>
                                                </>
                                            )}

                                            {caseData.delegate_name && !isManualManagement && (
                                                <div className="mt-4 pt-4 border-t border-blue-100">
                                                    <div className="flex items-center justify-center gap-2 text-indigo-700 font-medium text-sm">
                                                        <Truck className="w-4 h-4" />
                                                        <span>المندوب: {caseData.delegate_name}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>

                                    <Card className="p-4">
                                        <h4 className="text-sm font-bold text-gray-900 mb-3">التواريخ المهمة</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">تم الإرسال</span>
                                                <span className="font-medium">{caseData.sentDate}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">الاستلام المجدول</span>
                                                <span className="font-medium">{caseData.expectedDate}</span>
                                            </div>
                                            {caseData.receivedDate && (
                                                <div className="flex justify-between text-sm pt-2 border-t text-green-600 font-medium">
                                                    <span>تم الاستلام فعلياً</span>
                                                    <span>{caseData.receivedDate}</span>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {activeTab === 'financial' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    <Card className="p-4 bg-gray-50">
                                        <span className="text-xs text-gray-500">التكلفة الإجمالية</span>
                                        <div className="text-xl font-bold text-gray-900 mt-1">{caseData.price?.toLocaleString()} د.ع</div>
                                    </Card>
                                    <Card className="p-4 bg-green-50 border-green-100">
                                        <span className="text-xs text-green-600">المدفوع</span>
                                        {isManualManagement ? (
                                            <div className="flex items-center gap-1 mt-1">
                                                <input
                                                    type="number"
                                                    value={msgPaymentAmount}
                                                    onChange={(e) => {
                                                        const val = Number(e.target.value);
                                                        setMsgPaymentAmount(val);
                                                        onUpdateStatus?.(caseData.id, manualStatus, { paymentAmount: val });
                                                    }}
                                                    className="text-xl font-bold text-green-700 bg-transparent border-b border-green-300 w-full focus:outline-none"
                                                />
                                                <span className="text-xs text-green-600">د.ع</span>
                                            </div>
                                        ) : (
                                            <div className="text-xl font-bold text-green-700 mt-1">{caseData.paymentAmount?.toLocaleString() || 0} د.ع</div>
                                        )}
                                    </Card>
                                    <Card className="p-4 bg-red-50 border-red-100">
                                        <span className="text-xs text-red-600">المتبقي</span>
                                        <div className="text-xl font-bold text-red-700 mt-1">{(caseData.price - (isManualManagement ? msgPaymentAmount : (caseData.paymentAmount || 0)))?.toLocaleString()} د.ع</div>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            <div className="relative border-r border-gray-200 mr-3 space-y-8 py-4">
                                {/* Timeline content placeholder */}
                            </div>
                        )}

                        {activeTab === 'files' && (
                            <div className="space-y-4">
                                {/* Files content placeholder */}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t bg-white flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>إغلاق</Button>

                        {/* Payment & Expense Workflow */}
                        <div className="flex-1 flex justify-start gap-2">
                            {/* Only show Payment workflow if Order is Completed or Delivered */}
                            {(caseData.status === 'completed' || caseData.status === 'delivered') && (
                                <>
                                    {/* 1. Payment Button */}
                                    {caseData.paymentStatus !== 'paid' && (
                                        <Button
                                            onClick={() => {
                                                if (isManualManagement) {
                                                    // Manual: Immediate Pay
                                                    onUpdateStatus?.(caseData.id, caseData.status, {
                                                        paymentStatus: 'paid',
                                                        paymentAmount: caseData.price
                                                    });
                                                    // Force UI update if needed via local state or rely on parent
                                                } else {
                                                    // Platform: Request Settlement
                                                    onUpdateStatus?.(caseData.id, caseData.status, {
                                                        paymentStatus: 'waiting_approval'
                                                    });
                                                }
                                            }}
                                            className={`${caseData.paymentStatus === 'waiting_approval'
                                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300'
                                                : 'bg-red-600 text-white hover:bg-red-700'
                                                }`}
                                        >
                                            <DollarSign className="w-4 h-4 ml-2" />
                                            {caseData.paymentStatus === 'waiting_approval' ? 'بانتظار موافقة المعمل' : 'تسديد'}
                                        </Button>
                                    )}

                                    {/* Platform Dev Tool: Simulate Lab Approval */}
                                    {!isManualManagement && caseData.paymentStatus === 'waiting_approval' && (
                                        <button
                                            onClick={() => {
                                                if (confirm('Dev Tool: Simulate Lab Approving the Payment?')) {
                                                    onUpdateStatus?.(caseData.id, caseData.status, {
                                                        paymentStatus: 'paid',
                                                        paymentAmount: caseData.price
                                                    });
                                                }
                                            }}
                                            className="text-[10px] text-gray-400 underline hover:text-gray-600"
                                            title="Simulate Lab Approval (Dev Only)"
                                        >
                                            [Dev: Approve]
                                        </button>
                                    )}

                                    {/* 2. Paid Status Badge */}
                                    {caseData.paymentStatus === 'paid' && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg font-bold border border-green-200">
                                            <CheckCircle className="w-4 h-4" />
                                            تم التسديد
                                        </div>
                                    )}

                                    {/* 3. Add to Expenses Button */}
                                    <Button
                                        onClick={() => onAddToExpenses?.(caseData)}
                                        disabled={caseData.paymentStatus !== 'paid'}
                                        variant={caseData.paymentStatus === 'paid' ? 'primary' : 'outline'}
                                        className={caseData.paymentStatus === 'paid' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-gray-400 border-gray-200'}
                                    >
                                        <Wallet className="w-4 h-4 ml-2" />
                                        إضافة للصرفيات
                                    </Button>
                                </>
                            )}
                        </div>

                        {!isManualManagement && (
                            <>
                                {caseData.status === 'out_for_delivery' && (
                                    <Button onClick={handleConfirmReceipt} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        <CheckCircle className="w-4 h-4 ml-2" />
                                        تأكيد استلام الطلب
                                    </Button>
                                )}

                                {caseData.status === 'delivered' && (
                                    <Button onClick={handleFinishOrder} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 animate-pulse">
                                        <ThumbsUp className="w-4 h-4 ml-2" />
                                        إنهاء وتقييم الخدمة
                                    </Button>
                                )}

                                {caseData.status !== 'completed' && caseData.status !== 'cancelled' && (
                                    <Button onClick={() => setShowReturnModal(true)} className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">
                                        <RotateCcw className="w-4 h-4 ml-2" />
                                        إرجاع
                                    </Button>
                                )}

                                {(caseData.status === 'pending' || caseData.status === 'waiting_for_representative' || caseData.status === 'in_progress') && (
                                    <Button onClick={() => setShowModificationModal(true)} className="bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200">
                                        <AlertTriangle className="w-4 h-4 ml-2" />
                                        طلب تعديل
                                    </Button>
                                )}
                            </>
                        )}

                        {isManualManagement && (
                            <>
                                <div className="text-xs text-gray-500 self-center mr-auto">
                                    * التعديلات تحفظ تلقائياً
                                </div>
                                {/* Messaging disabled for manual labs per user request */}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Return Modal */}
            <Modal
                isOpen={showReturnModal}
                onClose={() => setShowReturnModal(false)}
                title="إرجاع الطلب للمختبر"
                size="md"
            >
                <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800 border border-yellow-200 flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p>سيتم إعادة الطلب للمختبر للتعديل. يرجى ذكر الأسباب بوضوح.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">سبب الإرجاع</label>
                        <textarea
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="اشرح المشكلة بالتفصيل..."
                        />
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                        <Button variant="outline" onClick={() => setShowReturnModal(false)}>إلغاء</Button>
                        <Button onClick={handleReturn} className="bg-red-600 hover:bg-red-700 text-white" disabled={!returnReason}>
                            تأكيد الإرجاع
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modification Modal */}
            <Modal
                isOpen={showModificationModal}
                onClose={() => setShowModificationModal(false)}
                title="طلب تعديل عل الطلب"
                size="md"
            >
                <div className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-lg text-sm text-orange-800 border border-orange-200 flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p>سيتم إشعار المختبر بطلب التعديل. قد يؤثر هذا على وقت التسليم.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">تفاصيل التعديل المطلوب</label>
                        <textarea
                            value={modificationNote}
                            onChange={(e) => setModificationNote(e.target.value)}
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="اكتب التعديلات المطلوبة بوضوح..."
                        />
                    </div>
                    <div className="flex gap-2 justify-end pt-4">
                        <Button variant="outline" onClick={() => setShowModificationModal(false)}>إلغاء</Button>
                        <Button onClick={handleRequestModification} className="bg-orange-600 hover:bg-orange-700 text-white" disabled={!modificationNote}>
                            إرسال الطلب
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Rating Modal */}
            <Modal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                title="تقييم الخدمة وإنهاء الطلب"
                size="md"
            >
                <div className="space-y-6 text-center py-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">كيف كانت تجربتك؟</h3>
                        <p className="text-gray-500 text-sm">ساعدنا في تحسين الخدمة من خلال تقييم أداء المختبر</p>
                    </div>

                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110 focus:outline-none"
                            >
                                <Star
                                    className={`w-10 h-10 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                            </button>
                        ))}
                    </div>

                    <textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-400 transition-all outline-none text-sm"
                        placeholder="هل لديك أي ملاحظات إضافية؟ (اختياري)"
                        rows={3}
                    />

                    <div className="flex gap-3 pt-4 border-t">
                        <Button variant="outline" className="flex-1" onClick={() => setShowRatingModal(false)}>إلغاء</Button>
                        <Button onClick={handleSubmitRating} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold shadow-lg shadow-yellow-200">
                            تقييم وإنهاء
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Chat Modal */}
            <Modal
                isOpen={showChatModal}
                onClose={() => setShowChatModal(false)}
                title={`محادثة مع: ${caseData.labName}`}
                size="lg"
            >
                <DoctorLabChat
                    orderId={caseData.id}
                    labName={caseData.labName}
                    onClose={() => setShowChatModal(false)}
                />
            </Modal>
        </>
    );
};

