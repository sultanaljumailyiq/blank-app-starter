import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CreditCard, Smartphone, CheckCircle, AlertCircle, Loader2, Upload, Copy } from 'lucide-react';
import { paymentService, PaymentMethod } from '../../services/payment/PaymentService';
import { toast } from 'sonner';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    description: string;
    onSuccess: (transactionId: string) => void;
    // In a real app, pass available methods here to get accurate QR Codes
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    amount,
    description,
    onSuccess
}) => {
    const [step, setStep] = useState<'method' | 'processing' | 'result'>('method');
    const [selectedMethod, setSelectedMethod] = useState<'zaincash' | 'rafidain' | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; transactionId?: string } | null>(null);

    // Form State for Manual Transfer
    const [senderInfo, setSenderInfo] = useState('');
    const [receiptImage, setReceiptImage] = useState<File | null>(null);

    // Mock Data for Display (Replace with props from Admin Settings in future)
    const methodDetails = {
        zaincash: {
            name: 'ZainCash',
            number: '07800000000',
            icon: Smartphone,
            color: 'blue',
            qrPlaceholder: 'https://via.placeholder.com/150?text=Zain+QR'
        },
        rafidain: {
            name: 'مصرف الرافدين',
            number: '1234-5678-9012-3456',
            icon: CreditCard,
            color: 'green',
            qrPlaceholder: 'https://via.placeholder.com/150?text=Rafidain+QR'
        }
    };

    const handlePayment = async () => {
        if (!selectedMethod || !receiptImage) {
            toast.error('يرجى إرفاق صورة الوصل');
            return;
        }

        setLoading(true);
        setStep('processing');

        try {
            // Simulate Upload & Verification Request
            await new Promise(resolve => setTimeout(resolve, 2000));

            const mockTransactionId = `TRX-${Date.now()}`;
            const response = {
                success: true,
                message: 'تم استلام طلب الدفع. سيتم تفعيله بعد التحقق من الوصل.',
                transactionId: mockTransactionId
            };

            setResult(response);
            setStep('result');

            if (response.success) {
                toast.success(response.message);
                onSuccess(mockTransactionId);
            }
        } catch (error) {
            setResult({ success: false, message: 'حدث خطأ غير متوقع.' });
            setStep('result');
        } finally {
            setLoading(false);
        }
    };

    const resetModal = () => {
        setStep('method');
        setSelectedMethod(null);
        setResult(null);
        setSenderInfo('');
        setReceiptImage(null);
        onClose();
    };

    const renderMethodSelection = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <p className="text-gray-600 mb-1">المبلغ المستحق</p>
                <p className="text-3xl font-bold text-gray-900 bg-gray-50 rounded-xl py-4 border border-gray-100">
                    {amount.toLocaleString()} د.ع
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => setSelectedMethod('zaincash')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${selectedMethod === 'zaincash'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                        }`}
                >
                    <Smartphone className="w-8 h-8" />
                    <span className="font-bold">ZainCash</span>
                </button>

                <button
                    onClick={() => setSelectedMethod('rafidain')}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${selectedMethod === 'rafidain'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-green-200 hover:bg-gray-50'
                        }`}
                >
                    <CreditCard className="w-8 h-8" />
                    <span className="font-bold">الرافدين</span>
                </button>
            </div>

            {selectedMethod && (
                <div className="animate-in fade-in slide-in-from-top-2 pt-6 border-t border-gray-100">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 text-center">
                        <p className="text-sm text-gray-500 mb-2">امسح الكود أو حول للمعلومات أدناه</p>

                        {/* QR Code Container (Simulated Admin Uploaded Image) */}
                        <div className="w-32 h-32 bg-white mx-auto rounded-lg shadow-sm border p-2 mb-3">
                            <img
                                src={methodDetails[selectedMethod].qrPlaceholder}
                                alt="QR Code"
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="flex items-center justify-center gap-2 text-lg font-bold text-gray-900 dir-ltr" dir="ltr">
                            <span>{methodDetails[selectedMethod].number}</span>
                            <button className="text-gray-400 hover:text-blue-600" onClick={() => {
                                navigator.clipboard.writeText(methodDetails[selectedMethod].number);
                                toast.success('تم النسخ');
                            }}>
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">اسم المستلم: شركة Smart Dental</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">اسم المرسل / رقم الهاتف</label>
                            <input
                                type="text"
                                placeholder="مثال: علي محمد - 078xxxx"
                                value={senderInfo}
                                onChange={e => setSenderInfo(e.target.value)}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-1">صورة الوصل (مطلوب)</label>
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">
                                        {receiptImage ? receiptImage.name : 'اضغط لرفع صورة إشعار التحويل'}
                                    </p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => setReceiptImage(e.target.files?.[0] || null)}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            )}

            <Button
                variant="primary"
                className="w-full py-3 mt-4 text-lg"
                disabled={!selectedMethod || !receiptImage}
                onClick={handlePayment}
            >
                تأكيد وإرسال الوصل
            </Button>
        </div>
    );

    const renderProcessing = () => (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-900">جاري رفع الطلب...</h3>
        </div>
    );

    const renderResult = () => (
        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${result?.success ? 'bg-green-100' : 'bg-red-100'}`}>
                {result?.success ? (
                    <CheckCircle className="w-10 h-10 text-green-600" />
                ) : (
                    <AlertCircle className="w-10 h-10 text-red-600" />
                )}
            </div>

            <h3 className="text-xl font-bold text-gray-900">
                {result?.success ? 'تم إرسال الطلب' : 'فشلت العملية'}
            </h3>

            <p className="text-gray-600 max-w-xs mx-auto">
                {result?.message}
            </p>

            <Button
                variant={result?.success ? 'primary' : 'secondary'}
                className="min-w-[150px] mt-4"
                onClick={resetModal}
            >
                {result?.success ? 'إغلاق' : 'حاول مرة أخرى'}
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => { if (step !== 'processing') resetModal(); }}
            title="تحويل مالي مباشر"
            size="md"
        >
            {step === 'method' && renderMethodSelection()}
            {step === 'processing' && renderProcessing()}
            {step === 'result' && renderResult()}
        </Modal>
    );
};
