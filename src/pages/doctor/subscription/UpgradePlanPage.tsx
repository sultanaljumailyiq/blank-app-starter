import React, { useState } from 'react';
import { useAdminSubscriptions } from '../../../hooks/useAdminSubscriptions';
import { useAdminData, PaymentMethod, Agent } from '../../../hooks/useAdminData';
import { useAuth } from '../../../contexts/AuthContext';
import { useStorage } from '../../../hooks/useStorage';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import {
    CheckCircle, Star, Shield, CreditCard, Upload,
    MapPin, Phone, User, Copy, QrCode, Info, Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PaymentModal } from '../../../components/payment/PaymentModal';

import { useDoctorSubscription } from '../../../hooks/useDoctorSubscription';
import { sendRoleNotification } from '../../../lib/notifications';

export const UpgradePlanPage: React.FC = () => {
    const { plans: fetchedPlans, coupons } = useAdminSubscriptions();
    const { subscription } = useDoctorSubscription(); // New Hook
    const { paymentMethods, agents } = useAdminData();
    const { uploadFile } = useStorage();
    const { user } = useAuth();

    const plans = fetchedPlans;

    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [step, setStep] = useState(1); // 1: Select Plan, 2: Payment
    const [selectedPayment, setSelectedPayment] = useState<'zain' | 'rafidain' | 'agent' | null>(null);
    const [selectedAgentId, setSelectedAgentId] = useState<string>('');
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    // proofImage removed as it was part of old logic
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // Payment State
    const [senderName, setSenderName] = useState('');
    const [senderPhone, setSenderPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [receiptImage, setReceiptImage] = useState<File | null>(null);

    // Auto-fill profile data
    React.useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                console.log('Fetching profile for auto-fill...', user.id);
                const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) {
                    console.log('Profile found:', data);
                    setSenderName(data.full_name || '');
                    setSenderPhone(data.phone || '');
                } else if (error) {
                    console.error('Error fetching profile:', error);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const selectedPlan = plans.find(p => p.id === selectedPlanId);

    const monthlyPrice = selectedPlan?.price.monthly || 0;

    const handleApplyCoupon = () => {
        // Correctly accessing coupon from useAdminSubscriptions
        const coupon = coupons.find(c => c.code === couponCode.toUpperCase()) as any;

        if (!coupon) {
            alert('كوبون غير صالح');
            return;
        }

        if (!coupon.isActive) {
            alert('هذا الكوبون معطل حالياً');
            return;
        }

        // 1. Check Expiry
        if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
            alert('عذراً، انتهت صلاحية هذا الكوبون');
            return;
        }

        // 2. Check Start Date
        if (coupon.startDate && new Date(coupon.startDate) > new Date()) {
            alert('هذا الكوبون غير فعال بعد');
            return;
        }

        // 3. Check Usage Limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            alert('عذراً، نفد العدد المسموح لهذا الكوبون');
            return;
        }

        // Apply Logic
        const discountValue = coupon.type === 'percentage'
            ? (monthlyPrice * (coupon.value / 100))
            : coupon.value;

        setDiscount(discountValue);
        alert(`تم تطبيق خصم بقيمة ${discountValue.toLocaleString()} دينار!`);
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
                <Card className="max-w-md w-full p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">تم استلام طلبك بنجاح!</h1>
                    <p className="text-gray-600 mb-6">
                        طلب الاشتراك قيد المراجعة حالياً. سيصلك إشعار فور تأكيد العملية من قبل الإدارة.
                    </p>
                    <Link to="/doctor">
                        <Button className="w-full">العودة للرئيسية</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    // --- Step 1: Select Plan ---
    if (step === 1) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">اختر خطة الاشتراك المناسبة</h1>
                        <p className="text-gray-600">ارتقِ بعيادتك للمستوى التالي مع باقات Smart Dental المتقدمة</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.length === 0 && (
                            <div className="col-span-3 text-center py-12 text-gray-500">
                                لا توجد باقات متاحة حالياً. يرجى مراجعة الإدارة.
                            </div>
                        )}

                        {plans.map(plan => {
                            const isFree = plan.price.monthly === 0;
                            const isSelected = selectedPlanId === plan.id;
                            const isCurrent = subscription ? subscription.plan.id === plan.id : isFree;

                            return (
                                <Card
                                    key={plan.id}
                                    className={`p-8 relative transition-all border-2 flex flex-col
                                        ${isCurrent ? 'opacity-90 border-gray-200' : 'hover:shadow-xl'}
                                        ${isSelected ? 'border-blue-600 ring-4 ring-blue-50' : 'border-transparent'}
                                    `}
                                >
                                    {(plan.isPopular || plan.name.includes('ميز')) && !isFree ? (
                                        <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                                            الأكثر طلباً
                                        </div>
                                    ) : null}

                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className={`text-3xl font-bold mb-6 ${isFree ? 'text-gray-400' : 'text-blue-600'}`}>
                                        {plan.price.monthly.toLocaleString()} <span className="text-sm font-normal text-gray-500">{plan.price.currency || 'د.ع'} / شهرياً</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-50 p-2 rounded-lg">
                                        <div className="flex flex-col items-center p-2 bg-white rounded border border-gray-100 shadow-sm">
                                            <span className="text-xs text-gray-500 mb-1">العيادات</span>
                                            <span className="font-bold text-gray-900">{plan.maxClinics >= 999 ? '∞' : plan.maxClinics}</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 bg-white rounded border border-gray-100 shadow-sm">
                                            <span className="text-xs text-gray-500 mb-1">المرضى</span>
                                            <span className="font-bold text-gray-900">{plan.maxPatients >= 999999 ? '∞' : plan.maxPatients}</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 bg-white rounded border border-gray-100 shadow-sm">
                                            <span className="text-xs text-gray-500 mb-1">الخدمات</span>
                                            <span className="font-bold text-gray-900">{plan.maxServices >= 999 ? '∞' : plan.maxServices}</span>
                                        </div>
                                        <div className="flex flex-col items-center p-2 bg-white rounded border border-gray-100 shadow-sm">
                                            <span className="text-xs text-gray-500 mb-1">AI يومي</span>
                                            <span className={`font-bold ${plan.aiRequestLimit === -1 ? 'text-purple-600' : 'text-gray-900'}`}>
                                                {plan.aiRequestLimit === -1 ? '∞' : (plan.aiRequestLimit || 0)}
                                            </span>
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-3 text-gray-700">
                                                <CheckCircle className={`w-5 h-5 flex-shrink-0 ${isFree ? 'text-gray-400' : 'text-green-500'}`} />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button
                                        className={`w-full ${isSelected ? 'bg-blue-600' : isCurrent ? 'bg-green-600 text-white cursor-default opacity-100 hover:bg-green-700' : 'bg-gray-900 text-white'}`}
                                        disabled={isCurrent}
                                        onClick={() => !isCurrent && setSelectedPlanId(plan.id)}
                                    >
                                        {isCurrent ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <CheckCircle className="w-4 h-4" />
                                                باقتك الحالية
                                            </span>
                                        ) : isSelected ? 'تم الاختيار' : 'ترقية لهذه الباقة'}
                                    </Button>
                                </Card>
                            );
                        })}
                    </div>

                    <div className="mt-12 text-center">
                        <Button
                            size="lg"
                            disabled={!selectedPlanId}
                            onClick={() => setStep(2)}
                            className="px-12"
                        >
                            متابعة للدفع
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- Step 2: Payment Integration (Inline) ---
    const finalPrice = Math.max(0, monthlyPrice - discount);

    // Map payment methods from Admin Data + add static logic for Agent
    // We treat Agent as a special static type for now alongside dynamic methods
    const allMethods = [
        ...paymentMethods.map(pm => ({ ...pm, type: pm.name.toLowerCase().includes('zain') ? 'zain' : 'rafidain' })),
        { id: 'agent-method', name: 'الدفع نقداً (وكيل)', type: 'agent', isActive: true, number: '', recipientName: '', qrCodeUrl: '' }
    ];






    const handleSubmitPayment = async () => {
        if (!selectedPlan || !selectedPayment) return;

        // Find current method details
        const currentMethod = allMethods.find(m => m.id === selectedPayment);
        if (!currentMethod) {
            alert('يرجى اختيار طريقة دفع صالحة');
            return;
        }

        if (selectedPayment === 'agent' && !selectedAgentId) {
            alert('يرجى اختيار الوكيل');
            return;
        }

        // For direct payment methods, require receipt
        if (selectedPayment !== 'agent' && !receiptImage) {
            alert('يرجى إرفاق صورة الوصل');
            return;
        }

        if (!senderName || !senderPhone) {
            alert('يرجى إكمال معلومات المرسل (الاسم ورقم الهاتف)');
            return;
        }

        setIsSubmitting(true);
        try {
            let receiptUrl = '';

            // 1. Upload Receipt if exists
            if (receiptImage) {
                const result = await uploadFile(
                    receiptImage,
                    'documents',
                    'receipts'
                );
                // Assume uploadFile throws on error or returns null
                if (!result) throw new Error('فشل رفع الملف');
                receiptUrl = result.url;
            }

            // 2. Prepare Payment Details
            const paymentDetails = {
                method: selectedPayment,
                agentId: selectedAgentId || null,
                senderName,
                senderPhone,
                notes,
                receiptUrl,
                discount_applied: discount
            };

            // Update Profile with Phone Number to ensure contact info is saved
            if (user?.id && senderPhone) {
                await supabase.from('profiles').update({ phone: senderPhone }).eq('id', user.id);
            }

            // 3. Insert Request
            const { error: insertError } = await supabase
                .from('subscription_requests')
                .insert([{
                    doctor_id: user?.id,
                    user_id: user?.id,
                    plan_id: selectedPlan.id,
                    status: 'pending',
                    payment_method: selectedPayment === 'agent' ? 'cash_agent' : selectedPayment,
                    payment_details: paymentDetails,
                    amount_paid: Math.max(0, (selectedPlan.price.monthly || 0) - discount)
                }]);

            if (insertError) throw insertError;

            // Notify Admins
            await sendRoleNotification(
                'admin',
                'طلب اشتراك جديد',
                `قام ${senderName} بإرسال طلب اشتراك في باقة ${selectedPlan.name}.`,
                '/admin/subscriptions'
            );

            setShowSuccess(true);
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderPaymentMethodCard = (method: any) => {
        const isSelected = selectedPayment === method.id;
        const isAgent = method.type === 'agent';

        // Determine Icon & Colors
        let Icon = CreditCard;
        let colorClass = 'border-gray-200 hover:border-gray-300';
        let bgClass = 'bg-white';

        if (method.type === 'zain') {
            Icon = Phone; // Zain uses phone icon usually
            if (isSelected) { colorClass = 'border-blue-600 ring-2 ring-blue-50'; bgClass = 'bg-blue-50/50'; }
        } else if (method.type === 'rafidain') {
            Icon = CreditCard;
            if (isSelected) { colorClass = 'border-green-600 ring-2 ring-green-50'; bgClass = 'bg-green-50/50'; }
        } else {
            Icon = User;
            if (isSelected) { colorClass = 'border-purple-600 ring-2 ring-purple-50'; bgClass = 'bg-purple-50/50'; }
        }

        return (
            <div
                key={method.id}
                className={`transition-all duration-300 ${isSelected ? 'col-span-1 md:col-span-2' : ''}`}
            >
                <div
                    onClick={() => {
                        if (selectedPayment !== method.id) {
                            setSelectedPayment(method.id);
                            // We probably keep the profile auto-fill data? 
                            // But usually if switching methods, we might want to keep the name/phone if already typed.
                            // Let's NOT clear name/phone, only image.
                            // setSenderName(''); 
                            // setSenderPhone('');
                            // setNotes('');
                            setReceiptImage(null);
                        }
                    }}
                    className={`p-5 rounded-2xl border-2 cursor-pointer relative overflow-hidden ${colorClass} ${bgClass}`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">{method.name}</h3>
                            <p className="text-xs text-gray-500">{isAgent ? 'الدفع المباشر لأحد وكلائنا' : 'تحويل مالي مباشر'}</p>
                        </div>
                        {isSelected && <div className="mr-auto text-green-600"><CheckCircle className="w-6 h-6" /></div>}
                    </div>

                    {/* EXPANDED CONTENT for Inline Payment */}
                    {isSelected && (
                        <div className="mt-6 pt-6 border-t border-gray-200/50 animate-in fade-in slide-in-from-top-2">

                            {/* --- AGENT FLOW --- */}
                            {isAgent && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">اختر الوكيل المعتمد</label>
                                        <select
                                            className="w-full input-field bg-white"
                                            onChange={(e) => setSelectedAgentId(e.target.value)}
                                            value={selectedAgentId}
                                        >
                                            <option value="">اختر الوكيل...</option>
                                            {agents.map(agent => (
                                                <option key={agent.id} value={agent.id}>{agent.name} - {agent.governorate}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Selected Agent Details */}
                                    {selectedAgentId && (() => {
                                        const agent = agents.find(a => a.id === selectedAgentId);
                                        if (!agent) return null;
                                        return (
                                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-2 text-sm text-purple-900 animate-in fade-in">
                                                <div className="font-bold flex justify-between">
                                                    <span>{agent.name}</span>
                                                    <span>{agent.phone}</span>
                                                </div>
                                                <div className="text-purple-700">{agent.address || agent.governorate}</div>
                                            </div>
                                        );
                                    })()}

                                    {/* Sender Info for Agent (Now required as requested) */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">اسم المرسل</label>
                                            <div className="relative">
                                                <User className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    value={senderName}
                                                    onChange={e => setSenderName(e.target.value)}
                                                    className="input-field w-full pr-10"
                                                    placeholder="الاسم الثلاثي"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                                            <div className="relative">
                                                <Phone className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                                                <input
                                                    type="text"
                                                    dir="ltr"
                                                    value={senderPhone}
                                                    onChange={e => setSenderPhone(e.target.value)}
                                                    className="input-field w-full pr-10 text-right"
                                                    placeholder="07xxxxxxxxx"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">معلومات إضافية (ملاحظات)</label>
                                        <textarea
                                            rows={2}
                                            value={notes}
                                            onChange={e => setNotes(e.target.value)}
                                            className="input-field w-full resize-none"
                                            placeholder="أي ملاحظات إضافية بخصوص الدفع..."
                                        />
                                    </div>

                                    {/* Receipt Upload */}
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">صورة الوصل (من الوكيل)</label>
                                        <label className={`
                                            flex flex-col items-center justify-center w-full h-32
                                            border-2 border-dashed rounded-xl cursor-pointer transition-all
                                            ${receiptImage ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'}
                                        `}>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => setReceiptImage(e.target.files?.[0] || null)} />

                                            {receiptImage ? (
                                                <div className="text-center text-green-700">
                                                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                                                    <span className="text-sm font-bold">{receiptImage.name}</span>
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-500">
                                                    <Upload className="w-8 h-8 mx-auto mb-2" />
                                                    <span className="text-sm">اضغط لرفع صورة الوصل</span>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            )}

                            {/* --- ZAIN / RAFIDAIN FLOW --- */}
                            {!isAgent && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Transfer To Info */}
                                    <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-4">معلومات التحويل</p>

                                        {method.qrCodeUrl ? (
                                            <div
                                                className="w-40 h-40 mx-auto bg-gray-50 rounded-lg mb-4 p-2 border cursor-pointer hover:border-blue-400 transition-all relative group"
                                                onClick={() => setPreviewImage(method.qrCodeUrl)}
                                            >
                                                <img src={method.qrCodeUrl} className="w-full h-full object-contain" alt="QR" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                    <div className="bg-white/90 rounded-full p-2 text-gray-800">
                                                        <Search className="w-5 h-5" />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-40 h-40 mx-auto bg-gray-50 rounded-lg mb-4 flex items-center justify-center text-gray-300">
                                                <QrCode className="w-12 h-12" />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <div className="font-mono text-lg font-bold text-gray-900 dir-ltr bg-gray-50 py-2 rounded copy-all select-all">
                                                {method.number}
                                            </div>
                                            {method.recipientName && (
                                                <div className="text-sm font-medium text-blue-600">
                                                    المستلم: {method.recipientName}
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-400 mt-2">يرجى التحويل إلى هذا الرقم/الحساب</p>
                                        </div>
                                    </div>

                                    {/* Sender Inputs */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">اسم المرسل</label>
                                                <div className="relative">
                                                    <User className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                                                    <input
                                                        type="text"
                                                        value={senderName}
                                                        onChange={e => setSenderName(e.target.value)}
                                                        className="input-field w-full pr-10"
                                                        placeholder="الاسم الثلاثي"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">رقم الهاتف</label>
                                                <div className="relative">
                                                    <Phone className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                                                    <input
                                                        type="text"
                                                        dir="ltr"
                                                        value={senderPhone}
                                                        onChange={e => setSenderPhone(e.target.value)}
                                                        className="input-field w-full pr-10 text-right"
                                                        placeholder="07xxxxxxxxx"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات (اختياري)</label>
                                                <textarea
                                                    rows={1}
                                                    value={notes}
                                                    onChange={e => setNotes(e.target.value)}
                                                    className="input-field w-full resize-none"
                                                    placeholder="رقم العملية، تاريخ التحويل..."
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">صورة الوصل</label>
                                            <label className={`
                                                flex flex-col items-center justify-center w-full h-32
                                                border-2 border-dashed rounded-xl cursor-pointer transition-all
                                                ${receiptImage ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
                                            `}>
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => setReceiptImage(e.target.files?.[0] || null)} />

                                                {receiptImage ? (
                                                    <div className="text-center text-green-700">
                                                        <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                                                        <span className="text-sm font-bold">{receiptImage.name}</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-center text-gray-500">
                                                        <Upload className="w-8 h-8 mx-auto mb-2" />
                                                        <span className="text-sm">اضغط لرفع الصورة</span>
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 flex justify-end">
                                <Button
                                    className={`px-8 py-3 text-lg shadow-lg ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                                    onClick={handleSubmitPayment}
                                    disabled={isSubmitting} // Add more disabled logical checks if needed but handleSubmit handles alerts
                                >
                                    {isSubmitting ? 'جاري الإرسال...' : 'تأكيد الطلب وإرسال'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">تفاصيل الطلب والدفع</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Payment Methods Section */}
                    <div className="md:col-span-2 space-y-4">
                        <Card className="p-6 bg-white border-none shadow-sm sticky top-24">
                            <h3 className="font-bold mb-6 flex items-center gap-2 text-lg border-b pb-4">
                                <Shield className="w-5 h-5 text-blue-600" />
                                اختر طريقة الدفع
                            </h3>

                            <div className="space-y-4"> {/* Keep it vertical stack for cleanliness when expanded */}
                                {allMethods.filter(m => m.isActive).map(method => renderPaymentMethodCard(method))}
                            </div>

                            {allMethods.filter(m => m.isActive).length === 0 && (
                                <p className="text-center text-gray-500 py-8">لا توجد طرق دفع متاحة حالياً.</p>
                            )}
                        </Card>
                    </div>

                    {/* Summary */}
                    <div className="md:col-span-1">
                        <Card className="p-6 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">ملخص الطلب</h3>
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">الباقة</span>
                                    <span className="font-bold">{selectedPlan?.name}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">المبلغ</span>
                                    <span>{(selectedPlan?.price?.monthly || 0).toLocaleString()} د.ع</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600 font-medium">
                                        <span>خصم</span>
                                        <span>- {discount.toLocaleString()} د.ع</span>
                                    </div>
                                )}
                                <div className="border-t pt-3 flex justify-between font-bold text-lg mt-2">
                                    <span>الإجمالي</span>
                                    <span className="text-blue-600">{finalPrice.toLocaleString()} د.ع</span>
                                </div>
                            </div>

                            {/* Coupon Section */}
                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    placeholder="كود الخصم"
                                    className="input-field text-sm h-10"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                />
                                <Button variant="outline" size="sm" onClick={handleApplyCoupon} className="h-10 px-3">تطبيق</Button>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-800 leading-relaxed">
                                <Info className="w-4 h-4 inline-block ml-1 mb-1" />
                                عند إتمام الطلب، سيقوم فريقنا بمراجعته وتفعيله خلال مدة أقصاها 24 ساعة.
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Image Preview Overlay */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 bg-white/10 rounded-full p-2"
                        onClick={() => setPreviewImage(null)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                    </button>
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};
