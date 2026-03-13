import React, { useState, useEffect } from 'react';
import { User, Key, Shield, Clock, Search, Loader2, Check } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { StaffMember } from '../../../hooks/useStaff';
import { supabase } from '../../../lib/supabase';

interface StaffFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: StaffMember | null;
    onSave: (data: Partial<StaffMember>) => Promise<void>;
    onInvite?: (email: string, role: string) => Promise<boolean>;
    loading?: boolean;
    clinicId?: string;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
    isOpen,
    onClose,
    initialData,
    onSave,
    onInvite,
    loading = false,
    clinicId
}) => {
    const [mode, setMode] = useState<'create' | 'invite'>('create');
    const [activeTab, setActiveTab] = useState<'details' | 'account' | 'permissions' | 'schedule'>('details');
    const [formData, setFormData] = useState<Partial<StaffMember>>({
        name: '',
        email: '',
        phone: '',
        position: 'doctor',
        department: 'general',
        salary: 0,
        status: 'active',
        username: '',
        password: '',
        permissions: {
            appointments: false,
            patients: false,
            financials: false,
            settings: false,
            reports: false,
            activityLog: false,
            assets: false,
            staff: false,
            manageStaff: false,
            lab: false,
            assistantManager: false,
        },
        workSchedule: {
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
            startTime: '09:00',
            endTime: '17:00',
            breaks: []
        }
    });

    const [isOwnerAccount, setIsOwnerAccount] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    ...initialData,
                    password: '' // Reset password field for security
                });
            } else {
                // Reset to defaults
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    position: 'doctor',
                    department: 'general',
                    salary: 0,
                    status: 'active',
                    username: '',
                    password: '',
                    permissions: {
                        appointments: false,
                        patients: false,
                        financials: false,
                        settings: false,
                        reports: false,
                        activityLog: false,
                        assets: false,
                        staff: false,
                        manageStaff: false,
                        lab: false,
                        assistantManager: false,
                    },
                    workSchedule: {
                        days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                        startTime: '09:00',
                        endTime: '17:00',
                        breaks: []
                    }
                });
            }
            setActiveTab('details');
            setSearchResults([]);
            setSearchQuery('');
            setSearched(false);

            // Check if this is the clinic owner
            const checkOwner = async () => {
                if (clinicId && (initialData?.authUserId || initialData?.userId)) {
                    const { data: clinic } = await supabase
                        .from('clinics')
                        .select('owner_id')
                        .eq('id', clinicId)
                        .single();

                    const isOwner = clinic && (
                        clinic.owner_id === initialData.authUserId ||
                        clinic.owner_id === initialData.userId
                    );

                    if (isOwner) {
                        setIsOwnerAccount(true);
                    } else {
                        setIsOwnerAccount(false);
                    }
                } else {
                    setIsOwnerAccount(false);
                }
            };
            checkOwner();
        }
    }, [isOpen, initialData, clinicId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Force 'pending' status for newly linked existing accounts
        let dataToSave = { ...formData };
        if (!initialData && dataToSave.isLinkedAccount && dataToSave.userId) {
            dataToSave.status = 'pending';
        }

        await onSave(dataToSave);
        onClose();
    };

    const togglePermission = (key: keyof typeof formData.permissions) => {
        if (!formData.permissions) return;

        let newPermissions = { ...formData.permissions, [key]: !formData.permissions[key] };

        // Handle Assistant Manager shortcut
        if (key === 'assistantManager' && newPermissions.assistantManager) {
            newPermissions = {
                appointments: true,
                patients: true,
                financials: true,
                settings: true,
                reports: true,
                activityLog: true,
                assets: true,
                staff: true,
                manageStaff: true,
                lab: true,
                assistantManager: true,
            };
        }

        setFormData({
            ...formData,
            permissions: newPermissions
        });
    };

    // User Search Logic
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setSearched(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, phone, avatar_url, role')
                .or(`email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`)
                .limit(5);

            if (error) throw error;
            setSearchResults(data || []);
        } catch (error) {
            console.error('Error searching users:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? 'تعديل بيانات الموظف' : (mode === 'create' ? 'إضافة موظف جديد' : 'دعوة موظف جديد')}
            size={mode === 'invite' ? 'md' : 'lg'}
        >
            {!initialData && (
                <div className="flex bg-gray-100 p-1 rounded-lg mb-6 mx-1">
                    <button
                        onClick={() => setMode('create')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'create' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        إضافة مباشرة
                    </button>
                    <button
                        onClick={() => setMode('invite')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${mode === 'invite' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        دعوة عبر البريد
                    </button>
                </div>
            )}

            {mode === 'invite' ? (
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (onInvite) {
                        const success = await onInvite(formData.email || '', formData.position || 'doctor');
                        if (success) onClose();
                    }
                }} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 text-blue-800 text-sm mb-4">
                        <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold">نظام الدعوات الآمن</p>
                            <p className="mt-1">سيتم إرسال دعوة عبر البريد الإلكتروني للمستخدم. عند القبول، سيتم إنشاء حساب موظف تلقائياً وربطه ببياناته.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الدور الوظيفي</label>
                        <select
                            value={formData.position}
                            onChange={e => setFormData({ ...formData, position: e.target.value as any })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="doctor">طبيب</option>
                            <option value="nurse">ممرض</option>
                            <option value="receptionist">موظف استقبال</option>
                            <option value="assistant">مساعد</option>
                            <option value="admin">مدير</option>
                            <option value="technician">فني</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                        <Button type="submit" variant="primary">إرسال الدعوة</Button>
                    </div>
                </form>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col h-[500px]">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 mb-6 shrink-0">
                        <button
                            type="button"
                            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('details')}
                        >
                            <User className="w-4 h-4 inline-block ml-2" />
                            البيانات الشخصية
                        </button>
                        <button
                            type="button"
                            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'account' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('account')}
                        >
                            <Key className="w-4 h-4 inline-block ml-2" />
                            الحساب والدخول
                        </button>
                        <button
                            type="button"
                            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'permissions' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('permissions')}
                        >
                            <Shield className="w-4 h-4 inline-block ml-2" />
                            الصلاحيات
                        </button>
                        <button
                            type="button"
                            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'schedule' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('schedule')}
                        >
                            <Clock className="w-4 h-4 inline-block ml-2" />
                            الدوام
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-1">
                        {activeTab === 'details' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">الدور الوظيفي</label>
                                        <select
                                            value={formData.position}
                                            onChange={e => setFormData({ ...formData, position: e.target.value as any })}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="doctor">طبيب</option>
                                            <option value="nurse">ممرض</option>
                                            <option value="receptionist">موظف استقبال</option>
                                            <option value="assistant">مساعد</option>
                                            <option value="admin">مدير</option>
                                            <option value="technician">فني</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                                        <input
                                            type="text"
                                            value={formData.department}
                                            onChange={e => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الراتب الشهري</label>
                                    <input
                                        type="number"
                                        value={formData.salary}
                                        onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                            </div>
                        )}

                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                {formData.isLinkedAccount || formData.userId ? (
                                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-gray-50 border-b p-4 flex justify-between items-center">
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                <div className="bg-green-100 p-1.5 rounded-full">
                                                    <Shield className="w-4 h-4 text-green-600" />
                                                </div>
                                                حساب مرتبط
                                            </h3>
                                            {!isOwnerAccount && (
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (confirm('هل أنت متأكد من إلغاء ربط هذا الحساب؟ سيفقد الموظف صلاحية الدخول.')) {
                                                                setFormData({ ...formData, userId: undefined, isLinkedAccount: false, authUserId: undefined });
                                                            }
                                                        }}
                                                        className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        إلغاء الربط (Unlink)
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 border-4 border-white shadow-sm">
                                                    {(formData.name || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                                        {formData.name}
                                                        {isOwnerAccount && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full border border-amber-200">المالك</span>}
                                                    </p>
                                                    <p className="text-gray-500 font-mono text-sm">{formData.email}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md text-xs font-bold border border-blue-100">
                                                            ID: {formData.userId?.slice(0, 8)}...
                                                        </span>
                                                        <span className="bg-green-50 text-green-700 px-2.5 py-0.5 rounded-md text-xs font-bold border border-green-100">
                                                            Active
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Reset Password Section - Conditional */}
                                            {!isOwnerAccount && (
                                                <div className="border-t pt-4 mt-4">
                                                    <h4 className="font-bold text-gray-900 mb-2 text-sm">إدارة الأمان</h4>
                                                    <p className="text-xs text-gray-500 mb-3">
                                                        يمكنك تغيير كلمة المرور لهذا المستخدم فقط إذا كان حسابه مخصصاً لهذه العيادة وغير مرتبط بجهات أخرى.
                                                    </p>

                                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">تعيين كلمة مرور جديدة</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text" // Visible for admin convenience
                                                                placeholder="كلمة المرور الجديدة"
                                                                className="flex-1 px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                            />
                                                            <button
                                                                type="button"
                                                                className="bg-white border hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                                                                onClick={() => {
                                                                    const newPass = Math.random().toString(36).slice(-8) + "!1";
                                                                    setFormData({ ...formData, password: newPass });
                                                                }}
                                                            >
                                                                توليد تلقائي
                                                            </button>
                                                        </div>
                                                        {formData.password && (
                                                            <p className="text-xs text-green-600 mt-2 font-medium">
                                                                ⚠️ سيتم تحديث كلمة المرور عند الحفظ.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Unlinked State Options */}
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 text-sm text-blue-800">
                                            <div className="bg-white p-2 rounded-lg h-fit text-blue-600 shadow-sm">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold">الموظف غير مرتبط بحساب دخول</p>
                                                <p className="opacity-90 mt-1">
                                                    يمكنك إما ربطه بمستخدم موجود مسبقاً في النظام، أو إنشاء بيانات دخول جديدة له مباشرة.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Option 1: Link Existing */}
                                            <div className="border rounded-xl p-5 hover:border-blue-300 transition-colors relative group bg-white">
                                                <div className="absolute top-4 left-4 text-gray-400 group-hover:text-blue-500">
                                                    1
                                                </div>
                                                <h4 className="font-bold text-gray-900 mb-3">ربط بمستخدم موجود</h4>
                                                <div className="space-y-3">
                                                    <div className="space-y-3">
                                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">ابحث عن المستخدم</label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                                                                placeholder="الاسم، البريد الإلكتروني، أو رقم الهاتف..."
                                                                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                                            />
                                                            <Search
                                                                className="absolute left-3 top-2.5 text-gray-400 w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors"
                                                                onClick={handleSearch}
                                                            />
                                                        </div>

                                                        {isSearching && (
                                                            <div className="text-center py-4 text-gray-500">
                                                                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                                                                جاري البحث...
                                                            </div>
                                                        )}

                                                        {!isSearching && searched && searchResults.length === 0 && (
                                                            <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-lg">
                                                                لم يتم العثور على مستخدمين مطابقين.
                                                            </div>
                                                        )}

                                                        {!isSearching && searchResults.length > 0 && (
                                                            <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                                                                {searchResults.map(user => (
                                                                    <div
                                                                        key={user.id}
                                                                        onClick={() => {
                                                                            setFormData({
                                                                                ...formData,
                                                                                userId: user.id,
                                                                                email: formData.email || user.email || '',
                                                                                name: formData.name || user.full_name || '',
                                                                                phone: formData.phone || user.phone || '',
                                                                                isLinkedAccount: true
                                                                            });
                                                                            setSearchResults([]);
                                                                            setSearchQuery('');
                                                                        }}
                                                                        className="flex items-center gap-3 p-3 rounded-lg border hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                                                                    >
                                                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                                                                            {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" /> : (user.full_name?.[0] || '?')}
                                                                        </div>
                                                                        <div className="overflow-hidden">
                                                                            <div className="font-semibold text-sm text-gray-900 truncate">{user.full_name}</div>
                                                                            <div className="text-xs text-gray-500 truncate">{user.email || user.phone}</div>
                                                                        </div>
                                                                        <Check className={`w-4 h-4 text-blue-600 mr-auto ${formData.userId === user.id ? 'opacity-100' : 'opacity-0'}`} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Option 2: Create New (Direct) */}
                                            <div className="border rounded-xl p-5 hover:border-blue-300 transition-colors relative group bg-white">
                                                <div className="absolute top-4 left-4 text-gray-400 group-hover:text-blue-500">
                                                    2
                                                </div>
                                                <h4 className="font-bold text-gray-900 mb-3">إنشاء بيانات دخول جديدة</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني (للدخول)</label>
                                                        <input
                                                            type="email"
                                                            value={formData.email}
                                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="name@clinic.com"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 mb-1">كلمة المرور</label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={formData.password}
                                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                                                placeholder="تعيين كلمة مرور..."
                                                            />
                                                            <button
                                                                type="button"
                                                                className="whitespace-nowrap px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-colors"
                                                                onClick={() => {
                                                                    const randomPass = Math.random().toString(36).slice(-8) + "#2"; // Improved complexity slightly
                                                                    setFormData({ ...formData, password: randomPass });
                                                                }}
                                                            >
                                                                توليد
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'permissions' && formData.permissions && (
                            <div className="space-y-6">
                                {isOwnerAccount ? (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                                        <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Shield className="w-8 h-8 text-amber-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">حساب مالك العيادة</h3>
                                        <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                                            هذا الحساب هو المالك للعيادة ويمتلك كافة الصلاحيات بشكل تلقائي. لا يمكن تعديل أو تقييد صلاحيات المالك.
                                        </p>
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-amber-100 shadow-sm text-amber-700 font-bold text-sm">
                                            <Check className="w-4 h-4" />
                                            لديه جميع الصلاحيات
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-4">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.permissions.assistantManager}
                                                    onChange={() => togglePermission('assistantManager')}
                                                    className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500 ml-3"
                                                />
                                                <div>
                                                    <div className="font-bold text-gray-900">تعيين كـ "معاون مدير"</div>
                                                    <div className="text-sm text-gray-600">منح كامل الصلاحيات لإدارة العيادة (باستثناء حذف العيادة)</div>
                                                </div>
                                            </label>
                                        </div>

                                        {/* Group 1: Clinic Dashboard */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">لوحة التحكم والعيادة</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {[
                                                    { key: 'appointments', label: 'المواعيد', desc: 'إدارة المواعيد والحجوزات' },
                                                    { key: 'patients', label: 'المرضى', desc: 'عرض وتعديل بيانات المرضى' },
                                                    { key: 'financials', label: 'المالية', desc: 'الإيرادات والمصروفات' },
                                                    { key: 'reports', label: 'التقارير', desc: 'عرض تقارير الأداء' },
                                                    { key: 'assets', label: 'الأصول', desc: 'إدارة المخزون والأجهزة' },
                                                    { key: 'lab', label: 'المختبر', desc: 'طلبات المعامل' },
                                                ].map(perm => (
                                                    <label key={perm.key} className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.permissions![perm.key as keyof typeof formData.permissions]}
                                                            onChange={() => togglePermission(perm.key as any)}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 ml-3 mt-1"
                                                            disabled={formData.permissions?.assistantManager}
                                                        />
                                                        <div>
                                                            <div className="font-medium text-gray-900">{perm.label}</div>
                                                            <div className="text-xs text-gray-500">{perm.desc}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Group 2: Administration */}
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3 border-b pb-2">الإدارة والإعدادات</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {[
                                                    { key: 'staff', label: 'عرض الكادر', desc: 'مشاهدة قائمة الموظفين فقط' },
                                                    { key: 'manageStaff', label: 'إدارة الكادر', desc: 'إضافة وتعديل وحذف الموظفين' },
                                                    { key: 'settings', label: 'الإعدادات', desc: 'إعدادات العيادة العامة' },
                                                    { key: 'activityLog', label: 'سجل النشاطات', desc: 'مراقبة سجل حركات النظام' },
                                                ].map(perm => (
                                                    <label key={perm.key} className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.permissions![perm.key as keyof typeof formData.permissions]}
                                                            onChange={() => togglePermission(perm.key as any)}
                                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 ml-3 mt-1"
                                                            disabled={formData.permissions?.assistantManager}
                                                        />
                                                        <div>
                                                            <div className="font-medium text-gray-900">{perm.label}</div>
                                                            <div className="text-xs text-gray-500">{perm.desc}</div>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                                            ملاحظة: ميزات "المهام" و "الرسائل" متاحة افتراضياً لجميع الموظفين لتسهيل التواصل.
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === 'schedule' && formData.workSchedule && (
                            <div className="space-y-6">
                                {/* Days Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">أيام العمل</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
                                            const isSelected = formData.workSchedule?.days.includes(day);
                                            const dayNames: any = {
                                                'Saturday': 'السبت', 'Sunday': 'الأحد', 'Monday': 'الاثنين',
                                                'Tuesday': 'الثلاثاء', 'Wednesday': 'الأربعاء', 'Thursday': 'الخميس', 'Friday': 'الجمعة'
                                            };
                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => {
                                                        const currentDays = formData.workSchedule?.days || [];
                                                        const newDays = isSelected
                                                            ? currentDays.filter(d => d !== day)
                                                            : [...currentDays, day];
                                                        setFormData({
                                                            ...formData,
                                                            workSchedule: { ...formData.workSchedule!, days: newDays }
                                                        });
                                                    }}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isSelected
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {dayNames[day]}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Time Selection */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">وقت البدء</label>
                                        <input
                                            type="time"
                                            value={formData.workSchedule.startTime}
                                            onChange={e => setFormData({
                                                ...formData,
                                                workSchedule: { ...formData.workSchedule!, startTime: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">وقت الانتهاء</label>
                                        <input
                                            type="time"
                                            value={formData.workSchedule.endTime}
                                            onChange={e => setFormData({
                                                ...formData,
                                                workSchedule: { ...formData.workSchedule!, endTime: e.target.value }
                                            })}
                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Status Override */}
                                <div className="pt-4 border-t">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة الحالية</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="active">نشط (على رأس العمل)</option>
                                        <option value="on_leave">في إجازة</option>
                                        <option value="suspended">موقوف مؤقتاً</option>
                                        <option value="terminated">منتهي الخدمة (مستقيل/مفصول)</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">تغيير الحالة سيؤثر على إمكانية حجز المواعيد لهذا الموظف.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-4 shrink-0">
                        <Button type="button" variant="secondary" onClick={onClose}>إلغاء</Button>
                        <Button type="submit" variant="primary" disabled={loading}>
                            {loading ? 'جاري الحفظ...' : 'حفظ'}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};
