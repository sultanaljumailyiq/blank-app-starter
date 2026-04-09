import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Activity, User, Building, FileText, Search, CreditCard, Box } from 'lucide-react';
import { useStaff } from '../../hooks/useStaff';
import { usePatients } from '../../hooks/usePatients';
import { useInventory } from '../../hooks/useInventory';
import { treatments } from '../../data/mock/assets';
import { useAdminLabs } from '../../hooks/useAdminLabs';
import { useLabOrders } from '../../hooks/useLabOrders';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'income' | 'expense';
    clinicId?: string;
    preselectedPatientId?: string;
    prefillData?: any; // For new entries with defaults
    onSave: (transactionData: any) => Promise<void>;
    initialData?: any; // For editing existing entries
    lockFields?: ('amount' | 'patient' | 'treatment')[]; // New prop to lock specific fields
}

export const ComprehensiveTransactionModal: React.FC<TransactionModalProps> = ({
    isOpen,
    onClose,
    type,
    clinicId,
    preselectedPatientId,
    onSave,
    initialData,
    prefillData,
    lockFields = [] // Default empty
}) => {
    // Hooks
    const { staff } = useStaff(clinicId || '0');
    const { patients } = usePatients(clinicId || '0');
    const { inventory: inventoryItems } = useInventory(clinicId || '0');
    const { labs: adminLabs } = useAdminLabs();
    const { orders: labOrders } = useLabOrders({ clinicId });

    // Local State
    const [formData, setFormData] = useState({
        amount: '' as string | number,
        category: '',
        description: '',
        patientId: preselectedPatientId || '',
        doctorId: '',
        staffId: '', // For expenses like salary
        inventoryItemId: '',
        itemName: '',
        paymentMethod: 'cash',
        labId: '',
        labRequestId: '',
        paymentStatus: 'paid',
        date: new Date().toISOString().split('T')[0],
        extraCost: 0,
        treatmentId: '',
        assistantId: '',
        recordedById: '', // New: Who recorded this?
        quantity: 0,
        // Asset Fields
        assetLifeYears: 5,
        assetSalvageValue: 0
    });

    // Filters for Lab Orders (Smart Selection)
    const [labFilter, setLabFilter] = useState('');
    const [patientFilter, setPatientFilter] = useState('');
    const [doctorFilter, setDoctorFilter] = useState('');

    // Reset or Initialize when opening
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Poppyulate for Edit Mode (Existing Transaction)
                setFormData({
                    amount: initialData.amount,
                    category: initialData.category,
                    description: initialData.description,
                    patientId: initialData.patientId || '',
                    doctorId: initialData.doctorId || '',
                    staffId: initialData.staffId || '',
                    inventoryItemId: initialData.inventoryItemId || '',
                    itemName: '',
                    paymentMethod: initialData.paymentMethod || 'cash',
                    labId: initialData.labId || '',
                    labRequestId: initialData.labRequestId || '',
                    paymentStatus: 'paid',
                    date: initialData.date ? initialData.date.split('T')[0] : new Date().toISOString().split('T')[0],
                    extraCost: initialData.extraCost || 0,
                    treatmentId: initialData.treatmentId || '',
                    assistantId: initialData.assistantId || '',
                    recordedById: initialData.recordedById || '',
                    quantity: initialData.quantity || 0,
                    assetLifeYears: initialData.assetLifeYears || 5,
                    assetSalvageValue: initialData.assetSalvageValue || 0
                });
                if (initialData.patientId) setPatientFilter(initialData.patientId);
            } else if (prefillData) {
                // New Entry Mode with Pre-filled Defaults (e.g., from Treatment Plan)
                setFormData(prev => ({
                    ...prev,
                    patientId: prefillData.patientId || preselectedPatientId || '',
                    doctorId: prefillData.doctorId || '',
                    treatmentId: prefillData.treatmentId || '',
                    amount: prefillData.amount || '',
                    category: prefillData.category || (type === 'income' ? 'treatment' : 'other'),
                    description: prefillData.description || '',
                    // Reset others
                    staffId: '', inventoryItemId: '', itemName: '',
                    labId: '', labRequestId: '', paymentStatus: 'paid', extraCost: 0, assistantId: '',
                    recordedById: ''
                }));
                // Set filters context if helpful
                if (prefillData.patientId) setPatientFilter(prefillData.patientId);
            } else {
                // Reset for New Entry (Blank)
                setFormData(prev => ({
                    ...prev,
                    patientId: preselectedPatientId || '',
                    category: type === 'income' ? 'treatment' : 'other',
                    amount: '',
                    description: '',
                    doctorId: '', staffId: '', inventoryItemId: '', itemName: '',
                    labId: '', labRequestId: '', paymentStatus: 'paid', extraCost: 0, treatmentId: '', assistantId: '',
                    recordedById: ''
                }));
                setLabFilter('');
                setPatientFilter(preselectedPatientId || '');
                setDoctorFilter('');
            }
        }
    }, [isOpen, type, preselectedPatientId, initialData, prefillData]);


    // Derived Lab Orders based on Filters
    const filteredLabOrders = labOrders.filter(order => {
        const matchLab = labFilter ? order.laboratory_id === labFilter : true;
        const matchPatient = patientFilter ? order.patient_id === patientFilter : true;
        const matchDoctor = doctorFilter ? order.doctor_id === doctorFilter : true;
        return matchLab && matchPatient && matchDoctor;
    });

    const handleLabOrderSelect = (orderId: string) => {
        const order = labOrders.find(o => o.id === orderId);
        if (order) {
            setFormData({
                ...formData,
                labRequestId: order.id,
                labId: order.laboratory_id || '',
                amount: order.final_amount || 0,
                // Also auto-fill filters for context if not set, or just visual feedback? 
                // Let's not force-set filters to avoid confusion, but we could validly deduce them.
            });
            // Optional: Auto-set filters to match selected order for clarity
            if (order.laboratory_id) setLabFilter(order.laboratory_id);
            if (order.patient_id) setPatientFilter(order.patient_id);
            if (order.doctor_id) setDoctorFilter(order.doctor_id);
        } else {
            setFormData({ ...formData, labRequestId: '', labId: '', amount: '' });
        }
    };


    const handleSubmit = async () => {
        if (!formData.amount || !formData.category) {
            alert('يرجى تعبئة المبلغ والتصنيف');
            return;
        }

        await onSave({
            type: type,
            amount: typeof formData.amount === 'string' ? parseFloat(formData.amount) : formData.amount,
            category: formData.category,
            description: formData.description,
            date: formData.date,
            paymentMethod: formData.paymentMethod,
            clinicId: clinicId,
            patientId: formData.patientId,
            doctorId: formData.doctorId,
            staffId: formData.staffId, // For salary expense
            recordedById: formData.recordedById, // New Field
            inventoryItemId: formData.inventoryItemId,
            itemName: formData.itemName,
            quantity: formData.quantity, // Pass quantity to sync with inventory
            treatmentId: formData.treatmentId,
            labRequestId: formData.labRequestId,
            assistantId: formData.assistantId,
            // Asset Data
            assetLifeYears: formData.assetLifeYears,
            assetSalvageValue: formData.assetSalvageValue
        });

        onClose();
    };

    if (!isOpen) return null;

    const isConsultation = formData.category === 'consultation';
    const isTreatment = formData.category === 'treatment';
    const isOtherIncome = formData.category === 'other';
    const showPatientFields = isTreatment || isConsultation || (type === 'income' && isOtherIncome);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
                <div className={`px-6 py-4 border-b flex justify-between items-center ${type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                    <h3 className={`font-bold text-lg ${type === 'income' ? 'text-green-800' : 'text-red-800'}`}>
                        {initialData ? 'تعديل المعاملة' : (type === 'income' ? 'تسجيل إيراد جديد' : 'تسجيل مصروف جديد')}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <SettingsIcon className="w-6 h-6 rotate-45" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar" dir="rtl">

                    {/* --- COMMON FIELDS ROW 1 --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                            {type === 'income' ? (
                                <select
                                    value={formData.category}
                                    onChange={e => {
                                        setFormData({ ...formData, category: e.target.value, treatmentId: '' });
                                    }}
                                    className="w-full border rounded-lg p-2.5 text-right focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">اختر التصنيف...</option>
                                    <option value="treatment">علاج (من القائمة)</option>
                                    <option value="consultation">كشفية</option>
                                    <option value="other">إيراد آخر</option>
                                </select>
                            ) : (
                                <select
                                    value={formData.category}
                                    onChange={e => {
                                        setFormData({ ...formData, category: e.target.value });
                                    }}
                                    className="w-full border rounded-lg p-2.5 text-right focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="">اختر التصنيف...</option>
                                    <option value="salary">رواتب موظفين</option>
                                    <option value="inventory">مشتريات مخزون</option>
                                    <option value="lab">دفعات مختبر (طلب)</option>
                                    <option value="rent">إيجار</option>
                                    <option value="bills">فواتير (كهرباء/ماء/نت)</option>
                                    <option value="asset_purchase">شراء أصل ثابت (جهاز/أثاث)</option>
                                    <option value="other">مصروف آخر</option>
                                </select>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ الإجمالي (د.ع)</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                                className={`w-full border rounded-lg p-2.5 text-right font-bold text-gray-900 ${lockFields.includes('amount') ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                                placeholder="0.00"
                                disabled={lockFields.includes('amount')}
                            />
                        </div>
                    </div>


                    {/* --- INCOME SPECIFIC: "Recorded By" integrated here naturally for Income --- */}
                    {type === 'income' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الموظف المسجل (مستلم المبلغ)</label>
                            <select
                                className="w-full border rounded-lg p-2.5 text-right bg-white"
                                value={formData.recordedById}
                                onChange={e => setFormData({ ...formData, recordedById: e.target.value })}
                            >
                                <option value="">اختر الموظف...</option>
                                {staff.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.position})</option>
                                ))}
                            </select>
                        </div>
                    )}


                    {/* --- DYNAMIC INCOME FORMS (Treatment OR Consultation) --- */}
                    {type === 'income' && showPatientFields && (
                        <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 space-y-4">
                            <h4 className="font-semibold text-green-800 text-sm flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                {isConsultation ? 'تفاصيل الكشفية' : (isTreatment ? 'تفاصيل العلاج' : 'تفاصيل الإيراد')}
                            </h4>

                            {/* Treatment Selection (Only if Treatment) */}
                            {isTreatment && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع العلاج</label>
                                    <select
                                        className={`w-full border rounded-lg p-2.5 text-right bg-white ${lockFields.includes('treatment') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        value={formData.treatmentId || ''}
                                        disabled={lockFields.includes('treatment')}
                                        onChange={e => {
                                            const tId = e.target.value;
                                            const treatment = treatments.find(t => t.id === tId);
                                            setFormData({
                                                ...formData,
                                                treatmentId: tId,
                                                amount: treatment ? treatment.basePrice : 0 // Auto-fill price
                                            });
                                        }}
                                    >
                                        <option value="">اختر العلاج...</option>
                                        {formData.treatmentId && !treatments.some(t => t.id === formData.treatmentId) && (
                                            <option value={formData.treatmentId}>
                                                {formData.description ? formData.description.replace('إيراد علاج - ', '') : 'علاج خطة العمل'}
                                            </option>
                                        )}
                                        {treatments.filter(t => t.isActive).map(t => (
                                            <option key={t.id} value={t.id}>{t.name} - {t.basePrice.toLocaleString()} د.ع</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Patient & Doctor (Required for both) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الطبيب المعالج</label>
                                    <select
                                        className="w-full border rounded-lg p-2.5 text-right bg-white"
                                        value={formData.doctorId || ''}
                                        onChange={e => setFormData({ ...formData, doctorId: e.target.value })}
                                    >
                                        <option value="">اختر الطبيب...</option>
                                        {staff.map(doc => (
                                            <option key={doc.id} value={doc.id}>{doc.name} - {doc.position}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">المريض</label>
                                    <select
                                        className={`w-full border rounded-lg p-2.5 text-right bg-white ${lockFields.includes('patient') ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        value={formData.patientId || ''}
                                        onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                                        disabled={!!preselectedPatientId || lockFields.includes('patient')} // Lock if preselected or explicit lock
                                    >
                                        <option value="">اختر المريض...</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Assistant & Extra Cost */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">المساعد (اختياري)</label>
                                    <select
                                        className="w-full border rounded-lg p-2.5 text-right bg-white"
                                        value={formData.assistantId || ''}
                                        onChange={e => setFormData({ ...formData, assistantId: e.target.value })}
                                    >
                                        <option value="">بدون مساعد</option>
                                        {staff.filter(s => !s.position?.includes('طبيب') && !s.position?.includes('Doctor')).map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {isTreatment && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">تكلفة إضافية</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2.5 text-right bg-white"
                                            placeholder="0"
                                            value={formData.extraCost || ''}
                                            onChange={e => {
                                                const extra = parseFloat(e.target.value) || 0;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    extraCost: extra,
                                                    amount: (treatments.find(t => t.id === prev.treatmentId)?.basePrice || 0) + extra
                                                }));
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- DYNAMIC EXPENSE FORMS --- */}
                    {type === 'expense' && formData.category === 'salary' && (
                        <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                            <label className="block text-sm font-medium text-gray-700 mb-1">اختر الموظف (المستلم للراتب)</label>
                            <select
                                className="w-full border rounded-lg p-2.5 text-right bg-white"
                                value={formData.staffId || ''}
                                onChange={e => setFormData({ ...formData, staffId: e.target.value })}
                            >
                                <option value="">اختر الموظف...</option>
                                {staff.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} - {s.position}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {type === 'expense' && formData.category === 'inventory' && (
                        <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">المادة المشتراة</label>
                                <select
                                    className="w-full border rounded-lg p-2.5 text-right bg-white"
                                    value={formData.inventoryItemId || ''}
                                    onChange={e => {
                                        const item = inventoryItems.find(i => i.id === e.target.value);
                                        setFormData({ ...formData, inventoryItemId: e.target.value, itemName: item?.name || '' });
                                    }}
                                >
                                    <option value="">اختر من المخزون (اختياري)...</option>
                                    {inventoryItems.map(item => (
                                        <option key={item.id} value={item.id}>{item.name} ({item.quantity} {item.unit})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">أو اسم المادة (شراء جديد)</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2.5 text-right bg-white"
                                        value={formData.itemName}
                                        onChange={e => setFormData({ ...formData, itemName: e.target.value })}
                                        placeholder="اسم المادة..."
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الكمية (للمخزون)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2.5 text-right bg-white"
                                        value={formData.quantity || ''}
                                        onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {type === 'expense' && formData.category === 'lab' && (
                        <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 space-y-3">
                            <h4 className="font-semibold text-red-800 text-sm flex items-center gap-2 mb-2">
                                <Search className="w-4 h-4" /> البحث عن طلب المختبر
                            </h4>

                            {/* --- LAB FILTERS --- */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div>
                                    <label className="text-xs text-black-500 mb-1 block">تصفية حسب المختبر</label>
                                    <select
                                        className="w-full border rounded-lg p-2 text-xs text-right bg-white"
                                        value={labFilter}
                                        onChange={e => setLabFilter(e.target.value)}
                                    >
                                        <option value="">الكل</option>
                                        {adminLabs.map(lab => (
                                            <option key={lab.id} value={lab.id}>{lab.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">تصفية حسب المريض</label>
                                    <select
                                        className="w-full border rounded-lg p-2 text-xs text-right bg-white"
                                        value={patientFilter}
                                        onChange={e => setPatientFilter(e.target.value)}
                                    >
                                        <option value="">الكل</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">تصفية حسب الطبيب</label>
                                    <select
                                        className="w-full border rounded-lg p-2 text-xs text-right bg-white"
                                        value={doctorFilter}
                                        onChange={e => setDoctorFilter(e.target.value)}
                                    >
                                        <option value="">الكل</option>
                                        {staff.filter(s => s.position?.includes('طبيب') || s.position?.includes('Doctor')).map(doc => (
                                            <option key={doc.id} value={doc.id}>{doc.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* --- ORDERS DROPDOWN --- */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اختر الطلب (للدفع)</label>
                                <select
                                    className="w-full border rounded-lg p-2.5 text-right bg-white focus:ring-2 focus:ring-red-500"
                                    value={formData.labRequestId || ''}
                                    onChange={e => handleLabOrderSelect(e.target.value)}
                                >
                                    <option value="">
                                        {filteredLabOrders.length === 0 ? 'لا توجد طلبات مطابقة' : 'اختر طلب المختبر...'}
                                    </option>
                                    {filteredLabOrders.map(order => (
                                        <option key={order.id} value={order.id}>
                                            #{order.id.slice(0, 5)} - {order.patient_name} - {order.lab_name} ({order.final_amount} د.ع)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}


                    {/* --- EXPENSE SPECIFIC: ASSET PURCHASE --- */}
                    {type === 'expense' && formData.category === 'asset_purchase' && (
                        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
                            <h4 className="font-semibold text-indigo-800 text-sm flex items-center gap-2 mb-2">
                                <Box className="w-4 h-4" /> تفاصيل الأصل الثابت
                            </h4>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الأصل (الجهاز/المعدة)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2.5 text-right bg-white"
                                    value={formData.itemName} // reusing itemName
                                    onChange={e => setFormData({ ...formData, itemName: e.target.value, description: `شراء أصل: ${e.target.value}` })}
                                    placeholder="مثال: كرسي أسنان، جهاز مسح ضوئي..."
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">العمر الافتراضي (سنوات)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2.5 text-right bg-white"
                                        value={formData.assetLifeYears}
                                        onChange={e => setFormData({ ...formData, assetLifeYears: parseInt(e.target.value) || 5 })}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">قيمة الخردة (نهاية العمر)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2.5 text-right bg-white"
                                        value={formData.assetSalvageValue}
                                        onChange={e => setFormData({ ...formData, assetSalvageValue: parseFloat(e.target.value) || 0 })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    )}


                    {/* --- EXPENSE SPECIFIC: Recorded By (Above Description) --- */}
                    {type === 'expense' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">الموظف المسؤول عن الصرف (المسجل)</label>
                            <select
                                className="w-full border rounded-lg p-2.5 text-right bg-white"
                                value={formData.recordedById}
                                onChange={e => setFormData({ ...formData, recordedById: e.target.value })}
                            >
                                <option value="">اختر الموظف...</option>
                                {staff.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} ({s.position})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">البيان / التفاصيل</label>
                        <textarea
                            className="w-full border rounded-lg p-2.5 text-right h-24 resize-none"
                            placeholder="اكتب ملاحظات إضافية حول المعاملة..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex gap-4">
                    <button
                        onClick={handleSubmit}
                        className={`flex-1 py-3 px-4 rounded-xl text-white font-bold transition-colors ${type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                        حفظ المعاملة
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors"
                    >
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};
