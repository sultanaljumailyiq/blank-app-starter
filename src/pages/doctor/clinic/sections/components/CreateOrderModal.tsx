import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, User, Plus, Building2, CheckCircle } from 'lucide-react';
import { Button } from '../../../../../components/common/Button';
import { useLabOrders } from '../../../../../hooks/useLabOrders';
import { usePatients } from '../../../../../hooks/usePatients';
import { useClinicLabs } from '../../../../../hooks/useClinicLabs';
import { useStaff } from '../../../../../hooks/useStaff';
import { supabase } from '../../../../../lib/supabase';
import { toast } from 'sonner';

interface CreateOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    clinicId: string;
    lab?: any; // If set, context is "Ordering from Lab"
    patientId?: string; // If set, context is "Ordering for Patient"
    patientName?: string;
    selectedPlanId?: string;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ isOpen, onClose, clinicId, lab, patientId, patientName, selectedPlanId: initialPlanId }) => {
    const { createOrder } = useLabOrders({ clinicId });
    const { patients } = usePatients(clinicId);
    const { labs } = useClinicLabs(clinicId);
    const { staff } = useStaff(clinicId);

    // Show ALL staff as requested by user
    const staffMembers = staff;

    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); // Success feedback state

    // Derived State for Selections
    const [selectedPatientId, setSelectedPatientId] = useState<string>(patientId || '');
    const [selectedLabId, setSelectedLabId] = useState<string>(lab?.id || '');

    // Dental Plan & Service State
    const [patientPlans, setPatientPlans] = useState<any[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId || '');
    const [labServices, setLabServices] = useState<any[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [manualPrice, setManualPrice] = useState<number>(0);
    const [manualServiceName, setManualServiceName] = useState<string>('');

    // Fetch Treatment Plans
    useEffect(() => {
        if (!selectedPatientId) {
            setPatientPlans([]);
            return;
        }
        const loadPlans = async () => {
            const { data } = await supabase
                .from('tooth_treatment_plans')
                .select('*')
                .eq('patient_id', selectedPatientId)
                .neq('overall_status', 'completed')
                .neq('overall_status', 'post_treatment');
            setPatientPlans(data || []);
        };
        loadPlans();
    }, [selectedPatientId]);

    // Fetch Lab Services
    useEffect(() => {
        const targetLab = labs.find(l => l.id === selectedLabId) || lab;
        if (!targetLab || targetLab.isCustom) {
            setLabServices([]);
            return;
        }
        const loadServices = async () => {
            const { data } = await supabase
                .from('lab_services')
                .select('*')
                .eq('lab_id', targetLab.id)
                .eq('is_active', true);
            setLabServices(data || []);
        };
        loadServices();
    }, [selectedLabId, labs, lab]);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedPatientId(patientId || '');
            setSelectedLabId(lab?.id || '');
            setSelectedPlanId(initialPlanId || '');
            setSelectedServiceId('');
            setManualPrice(0);
            setManualServiceName('');
        }
    }, [isOpen, patientId, lab, initialPlanId]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            // Determine Lab Details
            // Use selectedLabId to find the lab in 'labs' list
            const targetLab = labs.find(l => l.id === selectedLabId) || lab;

            if (!targetLab) {
                toast.error('يرجى اختيار المختبر');
                setLoading(false);
                return;
            }

            // Determine Patient Name
            // Determine Patient Name
            let finalPatientName = formData.get('patientName') as string;

            // If input was hidden (Dropdown mode) or empty, find from list
            if (!finalPatientName && selectedPatientId) {
                const p = patients.find(pat => pat.id.toString() === selectedPatientId.toString());
                if (p) finalPatientName = p.name || (p as any).full_name || 'Unknown Patient';
            }

            // Fallback for Locked Mode if input was not captured or readOnly issue
            if (!finalPatientName && patientName) {
                finalPatientName = patientName;
            }

            if (!finalPatientName) {
                toast.error('لم يتم تحديد اسم المريض');
                setLoading(false);
                return;
            }

            // --- Multi-Tooth Pricing Calculation ---
            const selectedPlan = patientPlans.find(p => p.id === selectedPlanId);
            const isCustomLab = targetLab.isCustom;
            let finalServiceName = '';
            let basePrice = 0;

            if (isCustomLab) {
                finalServiceName = manualServiceName;
                basePrice = manualPrice;
            } else {
                const srv = labServices.find(s => s.id === selectedServiceId);
                if (srv) {
                    finalServiceName = srv.name;
                    basePrice = Number(srv.base_price || 0);
                }
            }

            if (!finalServiceName) {
                toast.error('يرجى تحديد الخدمة المطلوبة أو إدخال إسم الخدمة');
                setLoading(false);
                return;
            }

            let quantity = 1;
            let teethNote = 'علاج عام';

            if (selectedPlan) {
                if (selectedPlan.tooth_numbers && selectedPlan.tooth_numbers.length > 0) {
                    quantity = selectedPlan.tooth_numbers.length;
                    teethNote = `أسنان: ${selectedPlan.tooth_numbers.join(', ')} (العدد: ${quantity})`;
                } else if (selectedPlan.tooth_number && selectedPlan.tooth_number !== 0) {
                    quantity = 1;
                    teethNote = `سن رقم: ${selectedPlan.tooth_number}`;
                }
            }

            const totalPrice = basePrice * quantity;
            finalServiceName = `${finalServiceName} - ${teethNote}`;

            await createOrder({
                clinic_id: clinicId,
                patient_name: finalPatientName,
                patient_id: selectedPatientId || null,

                // Unified link logic
                laboratory_id: targetLab.isCustom ? null : targetLab.id,
                custom_lab_id: targetLab.isCustom ? targetLab.id : null,
                custom_lab_name: targetLab.isCustom ? targetLab.name : null,

                service_name: finalServiceName,
                price: totalPrice,
                // Add Doctor / Staff Member
                // User wants to use id from staff table (integer)
                // We send both for compatibility
                doctor_id: (() => {
                    const docId = formData.get('doctorId') as string;
                    const doc = staffMembers.find(d => d.id.toString() === docId);
                    return (doc as any)?.user_id || null; // Send Auth UUID only if available
                })(),
                staff_record_id: (() => {
                    const docId = formData.get('doctorId') as string;
                    // docId from select is staff.id (int)
                    return !isNaN(Number(docId)) ? Number(docId) : null;
                })(),
                doctor_name: (() => {
                    const docId = formData.get('doctorId') as string;
                    const doc = staffMembers.find(d => d.id.toString() === docId);
                    return doc?.name || null;
                })(),

                priority: formData.get('priority') as any,
                notes: formData.get('notes') as string,
                expected_delivery_date: formData.get('expectedDate') as string,
            });
            setIsSuccess(true); // Trigger success UI

            setTimeout(() => {
                onClose();
                setIsSuccess(false);
            }, 1000);
        } catch (error: any) {
            console.error(error);
            // DEBUG ALERT: Force error visibility
            alert(`Failed to create order: ${error.message || JSON.stringify(error)}`);
            toast.error('حدث خطأ أثناء إنشاء الطلب');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">
                        {lab ? `طلب جديد - ${lab.name}` : 'إنشاء طلب معمل'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Doctor Selection */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">الطبيب المعالج</label>
                            <div className="relative">
                                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    name="doctorId"
                                    required
                                    className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                                >
                                    <option value="">اختر الطبيب المعالج...</option>
                                    {staffMembers.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} {((d as any).position || (d as any).role_title) ? `- ${(d as any).position || (d as any).role_title}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Patient Selection Logic */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">المريض</label>
                            <div className="relative">
                                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                {patientId ? (
                                    // Locked Patient Input (Context: Patient File)
                                    <input
                                        name="patientName"
                                        readOnly
                                        className="w-full pr-10 pl-4 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                        defaultValue={patientName || 'Loading...'}
                                    />
                                ) : (
                                    // Select Patient Dropdown (Context: Lab Page)
                                    <select
                                        name="patientId"
                                        value={selectedPatientId}
                                        onChange={(e) => setSelectedPatientId(e.target.value)}
                                        required
                                        className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                                    >
                                        <option value="">اختر المريض...</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            {/* Hidden input for name if using dropdown logic internally handles it, 
                                but form submit needs 'patientName' if we type manually. 
                                Actually, if dropdown used, we find name in submit handler.
                                If manual entry allowed, we need a toggle. For now, strict dropdown if no ID. */}
                        </div>

                        {/* Lab Selection Logic */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">المختبر</label>
                            <div className="relative">
                                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                {lab ? (
                                    // Locked Lab Input (Context: Lab Page)
                                    <input
                                        disabled
                                        className="w-full pr-10 pl-4 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                        value={lab.name}
                                    />
                                ) : (
                                    // Select Lab Dropdown (Context: Patient File)
                                    <select
                                        value={selectedLabId}
                                        onChange={(e) => setSelectedLabId(e.target.value)}
                                        required
                                        className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                                    >
                                        <option value="">اختر المختبر...</option>

                                        {labs.length === 0 && (
                                            <option disabled>لا توجد مختبرات محفوظة. انتقل لقسم المعامل لإضافة مختبر.</option>
                                        )}

                                        {labs.some(l => !l.isCustom && l.isFavorite) && (
                                            <optgroup label="معامل المنصة">
                                                {labs.filter(l => !l.isCustom && l.isFavorite).map(l => (
                                                    <option key={l.id} value={l.id}>{l.name}</option>
                                                ))}
                                            </optgroup>
                                        )}

                                        {labs.some(l => l.isCustom) && (
                                            <optgroup label="معامل يدوية">
                                                {labs.filter(l => l.isCustom).map(l => (
                                                    <option key={l.id} value={l.id}>{l.name}</option>
                                                ))}
                                            </optgroup>
                                        )}
                                    </select>
                                )}
                            </div>
                        </div>

                        {/* Treatment Plan Dropdown */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">الخطة العلاجية المرتبطة</label>
                            <select
                                value={selectedPlanId}
                                onChange={(e) => setSelectedPlanId(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">(اختياري) بدون خطة علاجية مرتبطة</option>
                                {patientPlans.map(plan => {
                                    const teeth = plan.tooth_numbers && plan.tooth_numbers.length > 0
                                        ? `أسنان (${plan.tooth_numbers.join(', ')})`
                                        : plan.tooth_number ? `سن (${plan.tooth_number})` : 'علاج عام';
                                    return (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.treatment_type || 'علاج'} - {teeth}
                                        </option>
                                    );
                                })}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                اختيار الخطة يحدد كمية الأسنان تلقائياً لحساب السعر الإجمالي للخدمة.
                            </p>
                        </div>

                        {/* Lab Service Selection based on Lab Type */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">الخدمة المطلوبة</label>
                            {!selectedLabId ? (
                                <select disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 appearance-none">
                                    <option>الرجاء اختيار المختبر أولاً لعرض الخدمات...</option>
                                </select>
                            ) : (labs.find(l => l.id === selectedLabId) || lab)?.isCustom ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={manualServiceName}
                                        onChange={(e) => setManualServiceName(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="اسم الخدمة (مختبر خارجي)..."
                                    />
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={manualPrice || ''}
                                            onChange={(e) => setManualPrice(Number(e.target.value))}
                                            required
                                            min="0"
                                            className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="سعر الوحدة..."
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">IQD</span>
                                    </div>
                                </div>
                            ) : (
                                <select
                                    value={selectedServiceId}
                                    onChange={(e) => setSelectedServiceId(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">اختر اسم الخدمة من خدمات المعمل...</option>
                                    {labServices.map(srv => {
                                        // Calculate total based on quantity
                                        let quantity = 1;
                                        if (selectedPlanId) {
                                            const plan = patientPlans.find(p => p.id === selectedPlanId);
                                            if (plan && plan.tooth_numbers && plan.tooth_numbers.length > 0) {
                                                quantity = plan.tooth_numbers.length;
                                            }
                                        }
                                        const total = Number(srv.base_price || 0) * quantity;
                                        return (
                                            <option key={srv.id} value={srv.id}>
                                                {srv.name} - السعر الفردي: {Number(srv.base_price || 0).toLocaleString()} (الإجمالي: {total.toLocaleString()} د.ع)
                                            </option>
                                        );
                                    })}
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ التسليم المتوقع</label>
                            <div className="relative">
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    name="expectedDate"
                                    required
                                    className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    min={new Date().toISOString().split('T')[0]} // updated min date
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
                            <select name="priority" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="normal">عادية</option>
                                <option value="high">عالية</option>
                                <option value="urgent">عاجلة</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية</label>
                        <textarea
                            name="notes"
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="أي تفاصيل إضافية للمختبر..."
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            className={`flex-1 text-white transition-all flex items-center justify-center gap-2 ${isSuccess
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            disabled={loading || isSuccess}
                        >
                            {loading ? 'جاري الإرسال...' : isSuccess ? (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    تم الإرسال بنجاح
                                </>
                            ) : 'إرسال الطلب'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
