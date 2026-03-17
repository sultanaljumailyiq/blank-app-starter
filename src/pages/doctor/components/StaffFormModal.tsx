import React, { useState, useEffect, useRef } from 'react';
import { User, Key, Shield, Clock, Search, Loader2, Check, X, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { Modal } from '../../../components/common/Modal';
import { StaffMember } from '../../../hooks/useStaff';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';

// ─── Professional Invite Tab Component ───────────────────────────────────────
interface InviteTabProps {
    onInvite?: (email: string, role: string) => Promise<boolean>;
    onCancelInvite?: (email: string) => Promise<void>;
    onClose: () => void;
}

const InviteTab: React.FC<InviteTabProps> = ({ onInvite, onCancelInvite, onClose }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<string>('doctor');
    const [lookupState, setLookupState] = useState<'idle' | 'searching' | 'found' | 'not_found'>('idle');
    const [foundUser, setFoundUser] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const [sentInvites, setSentInvites] = useState<{ email: string; role: string }[]>([]);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Real-time email lookup with debounce
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const trimmed = email.trim();
        if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
            setLookupState('idle');
            setFoundUser(null);
            return;
        }
        setLookupState('searching');
        debounceRef.current = setTimeout(async () => {
            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, avatar_url')
                    .eq('email', trimmed)
                    .maybeSingle();
                if (data) {
                    setFoundUser(data);
                    setLookupState('found');
                } else {
                    setFoundUser(null);
                    setLookupState('not_found');
                }
            } catch {
                setLookupState('not_found');
            }
        }, 600);
    }, [email]);

    const alreadyInvited = sentInvites.some(i => i.email === email.trim().toLowerCase());

    const handleSendInvite = async () => {
        if (!email || !onInvite || alreadyInvited) return;
        setSubmitting(true);
        try {
            const success = await onInvite(email.trim(), role);
            if (success) {
                setSentInvites(prev => [...prev, { email: email.trim().toLowerCase(), role }]);
                setEmail('');
                setLookupState('idle');
                setFoundUser(null);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 text-blue-800 text-sm border border-blue-100">
                <div className="bg-blue-100 p-2 rounded-lg shrink-0"><Mail className="w-4 h-4 text-blue-600" /></div>
                <div>
                    <p className="font-bold">دعوة عبر البريد الإلكتروني</p>
                    <p className="mt-0.5 text-blue-700 text-xs">لن يتم تفعيل وصول الموظف حتى يوافق على الدعوة.</p>
                </div>
            </div>

            {/* Sent Invites Pending Badges */}
            {sentInvites.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">الدعوات المرسلة</p>
                    {sentInvites.map((inv, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-amber-50 border border-amber-300 border-dashed rounded-xl px-3 py-2.5">
                            <span className="text-lg">⏳</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-amber-800 truncate">{inv.email}</p>
                                <p className="text-xs text-amber-600">في انتظار الموافقة • {inv.role}</p>
                            </div>
                            {onCancelInvite && (
                                <button type="button"
                                    onClick={async () => { await onCancelInvite(inv.email); setSentInvites(prev => prev.filter((_, i) => i !== idx)); }}
                                    className="text-red-500 hover:text-red-700 text-xs border border-red-200 rounded-lg px-2 py-1 bg-white hover:bg-red-50 transition-colors shrink-0 flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" /> إلغاء
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Email Field with Live Lookup */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                        className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:outline-none transition-all text-sm ${
                            lookupState === 'found' ? 'border-green-400 bg-green-50 focus:border-green-500' :
                            lookupState === 'not_found' ? 'border-amber-400 bg-amber-50 focus:border-amber-500' :
                            'border-gray-200 focus:border-blue-500 bg-white'
                        }`}
                        placeholder="name@example.com"
                        required
                        dir="ltr"
                    />
                    <div className="absolute left-3 top-3">
                        {lookupState === 'searching' && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                        {lookupState === 'found' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        {lookupState === 'not_found' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                        {lookupState === 'idle' && <Mail className="w-4 h-4 text-gray-400" />}
                    </div>
                </div>

                {/* Lookup result badge */}
                {lookupState === 'found' && foundUser && (
                    <div className="mt-2 flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-sm shrink-0 overflow-hidden">
                            {foundUser.avatar_url
                                ? <img src={foundUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                : (foundUser.full_name?.[0] || '?')}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-green-800 truncate">{foundUser.full_name}</p>
                            <p className="text-xs text-green-600">مسجل في المنصة ✓</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    </div>
                )}
                {lookupState === 'not_found' && (
                    <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-700">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>لا يوجد مستخدم بهذا البريد. سيتم إرسال دعوة تسجيل.</span>
                    </div>
                )}
            </div>

            {/* Role Selector */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">الدور الوظيفي المقترح</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { value: 'doctor', label: 'طبيب', icon: '🩺' },
                        { value: 'nurse', label: 'ممرض', icon: '💉' },
                        { value: 'receptionist', label: 'استقبال', icon: '📋' },
                        { value: 'assistant', label: 'مساعد', icon: '🤝' },
                        { value: 'technician', label: 'فني', icon: '🔧' },
                    ].map(r => (
                        <button
                            key={r.value}
                            type="button"
                            onClick={() => setRole(r.value)}
                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                                role === r.value
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <span className="text-xl">{r.icon}</span>
                            <span className="text-xs">{r.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={onClose}>{sentInvites.length > 0 ? 'إغلاق' : 'إلغاء'}</Button>
                <Button type="button" variant="primary" disabled={submitting || !email || alreadyInvited} onClick={handleSendInvite} className="gap-2">
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري الإرسال...</> : <><Mail className="w-4 h-4" /> إرسال الدعوة</>}
                </Button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────


interface StaffFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: StaffMember | null;
    onSave: (data: Partial<StaffMember>) => Promise<void>;
    onInvite?: (email: string, role: string, staffId?: string) => Promise<boolean>;
    onCancelInvitation?: (invitationId: string) => Promise<void>;
    onUnlink?: (staffId: string) => Promise<void>;
    loading?: boolean;
    clinicId?: string;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
    isOpen,
    onClose,
    initialData,
    onSave,
    onInvite,
    onCancelInvitation,
    onUnlink,
    loading = false,
    clinicId
}) => {
    const [mode, setMode] = useState<'create' | 'invite'>('create');
    const [activeTab, setActiveTab] = useState<'details' | 'account' | 'permissions' | 'schedule'>('details');
    const [cancellingInvitation, setCancellingInvitation] = useState(false);
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

    const { user: currentUser } = useAuth();
    const [isOwnerAccount, setIsOwnerAccount] = useState(false);
    const [isLoggedInUserOwner, setIsLoggedInUserOwner] = useState(false);
    
    const isSelfEditing = initialData && (currentUser && (initialData.authUserId === currentUser.id || initialData.userId === currentUser.id));

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
            setMode('create'); // always reset to create/details mode on open
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
                        clinic.owner_id === initialData?.authUserId ||
                        clinic.owner_id === initialData?.userId
                    );

                    setIsOwnerAccount(!!isOwner);
                    setIsLoggedInUserOwner(!!(clinic && currentUser && clinic.owner_id === currentUser.id));
                } else {
                    setIsOwnerAccount(false);
                    if (clinicId && currentUser?.id) {
                        const { data: clinic } = await supabase
                            .from('clinics')
                            .select('owner_id')
                            .eq('id', clinicId)
                            .single();
                        setIsLoggedInUserOwner(!!(clinic && clinic.owner_id === currentUser.id));
                    }
                }
            };
            checkOwner();
        }
    }, [isOpen, initialData, clinicId, currentUser?.id]);

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
                <InviteTab
                    onInvite={onInvite}
                    onCancelInvite={async (email) => {
                        // Cancel invitation by email — find it in clinic_invitations
                        if (!clinicId) return;
                        await supabase
                            .from('clinic_invitations')
                            .update({ status: 'cancelled' })
                            .eq('clinic_id', clinicId)
                            .eq('email', email)
                            .eq('status', 'pending');
                    }}
                    onClose={onClose}
                />
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
                        {/* Account tab only shown when editing existing staff */}
                        {initialData && (
                        <button
                            type="button"
                            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'account' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('account')}
                        >
                            <Key className="w-4 h-4 inline-block ml-2" />
                            الحساب والدخول
                        </button>
                        )}
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
                            <div className="space-y-5">

                                {/* ── State 1: PENDING INVITATION ── */}
                                {initialData?.hasPendingInvitation ? (
                                    <div className="space-y-4">
                                        {/* Status banner */}
                                        <div className="bg-amber-50 border border-amber-300 border-dashed rounded-xl p-5 flex items-start gap-4">
                                            <div className="bg-amber-100 p-2.5 rounded-full shrink-0">
                                                <span className="text-2xl">⏳</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-amber-900 text-sm">دعوة مُرسلة — في انتظار الموافقة</p>
                                                <p className="text-xs text-amber-700 mt-1">
                                                    تم إرسال دعوة إلى <span className="font-mono font-bold">{initialData?.email}</span>. لا يمكن إنشاء بيانات دخول جديدة حتى يتم إلغاء الدعوة أو قبولها.
                                                </p>
                                            </div>
                                        </div>
                                        {/* Cancel invitation */}
                                        {!isOwnerAccount && (
                                            <div className="border border-red-100 rounded-xl p-4 bg-white">
                                                <h4 className="font-bold text-gray-900 text-sm mb-1">إلغاء الدعوة</h4>
                                                <p className="text-xs text-gray-500 mb-3">سيبقى الموظف في طاقم العيادة لكن بدون دعوة أو ربط.</p>
                                                <button
                                                    type="button"
                                                    disabled={cancellingInvitation}
                                                    onClick={async () => {
                                                        if (confirm('هل أنت متأكد من إلغاء الدعوة؟')) {
                                                            setCancellingInvitation(true);
                                                            try {
                                                                const invId = initialData?.invitationId || initialData?.id;
                                                                if (invId && onCancelInvitation) {
                                                                    await onCancelInvitation(invId);
                                                                }
                                                                onClose();
                                                            } finally {
                                                                setCancellingInvitation(false);
                                                            }
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                                                >
                                                    <X className="w-4 h-4" />
                                                    {cancellingInvitation ? 'جاري الإلغاء...' : 'إلغاء الدعوة'}
                                                </button>
                                            </div>
                                        )}

                                    </div>

                                ) : formData.isLinkedAccount || formData.userId ? (
                                    /* ── State 2: LINKED ACCOUNT ── */
                                    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-gray-50 border-b p-4 flex justify-between items-center">
                                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                                <div className="bg-green-100 p-1.5 rounded-full">
                                                    <Shield className="w-4 h-4 text-green-600" />
                                                </div>
                                                حساب مرتبط
                                            </h3>
                                            {!isOwnerAccount && (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        if (confirm('هل أنت متأكد من إلغاء ربط هذا الحساب؟ سيفقد الموظف صلاحية الدخول لكنه يبقى في طاقم العيادة.')) {
                                                            if (initialData?.id && onUnlink) {
                                                                await onUnlink(initialData.id);
                                                                onClose();
                                                            } else {
                                                                setFormData({ ...formData, userId: undefined, isLinkedAccount: false, authUserId: undefined });
                                                            }
                                                        }
                                                    }}
                                                    className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-red-200"
                                                >
                                                    إلغاء الربط
                                                </button>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center gap-4 mb-4">
                                                {formData.avatar ? (
                                                    <img src={formData.avatar} alt={formData.name} className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-sm" />
                                                ) : (
                                                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 border-4 border-white shadow-sm">
                                                        {(formData.name || '?').charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900 flex items-center gap-2">
                                                        {formData.name}
                                                        {isOwnerAccount && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full border border-amber-200">المالك</span>}
                                                    </p>
                                                    <p className="text-gray-500 font-mono text-sm">{formData.email}</p>
                                                    <div className="flex gap-2 mt-1.5">
                                                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-bold border border-blue-100">
                                                            ID: {(formData.userId || formData.authUserId)?.slice(0, 8)}...
                                                        </span>
                                                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-md text-xs font-bold border border-green-100">🔗 مرتبط</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Password reset — only for clinic-created accounts */}
                                            {!isOwnerAccount && formData.linkedAccountType === 'created' && (
                                                <div className="border-t pt-4 mt-2">
                                                    <h4 className="font-bold text-gray-900 mb-2 text-sm">استعادة كلمة المرور</h4>
                                                    <p className="text-xs text-gray-500 mb-3">أنشأت هذه البيانات بنفسك — يمكنك إعادة تعيين كلمة المرور.</p>
                                                    <div className="flex gap-2">
                                                        <button type="button"
                                                            onClick={() => toast.info('سيتم إرسال رابط استعادة إلى بريد الموظف')}
                                                            className="flex-1 text-xs px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                                                            📧 إرسال رابط للموظف
                                                        </button>
                                                        <button type="button"
                                                            onClick={() => {
                                                                const tmp = Math.random().toString(36).slice(-8) + '!1';
                                                                setFormData({ ...formData, password: tmp });
                                                                toast.success(`كلمة المرور المؤقتة: ${tmp}`);
                                                            }}
                                                            className="flex-1 text-xs px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors text-gray-700">
                                                            🔑 كلمة مرور مؤقتة
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {!isOwnerAccount && formData.linkedAccountType !== 'created' && (
                                                <p className="text-xs text-gray-400 border-t pt-3 mt-2">
                                                    ⚠️ هذا الحساب مرتبط بمستخدم موجود في المنصة. لا يمكنك تعديل بيانات دخوله.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                ) : (
                                    /* ── State 3: UNLINKED — show Link or Create ── */
                                    <div className="space-y-6">
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 text-sm text-blue-800">
                                            <div className="bg-white p-2 rounded-lg h-fit text-blue-600 shadow-sm">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold">الموظف غير مرتبط بحساب دخول</p>
                                                <p className="opacity-90 mt-1 text-xs">يمكنك ربطه بمستخدم موجود في المنصة عبر الدعوة، أو إنشاء بيانات دخول جديدة له.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-5">
                                            {/* Option 1: Link Existing via invitation */}
                                            <div className="border rounded-xl p-5 hover:border-blue-300 transition-colors bg-white">
                                                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                                    <span className="text-blue-500">🔗</span> ربط بمستخدم موجود
                                                </h4>
                                                <p className="text-xs text-gray-500 mb-3">سيتم إرسال دعوة للمستخدم ويُربط بهذا الطاقم بعد موافقته.</p>
                                                <div className="space-y-3">
                                                    <div className="space-y-2">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                                                                placeholder="الاسم، البريد الإلكتروني، أو رقم الهاتف..."
                                                                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                                            />
                                                            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5 cursor-pointer hover:text-blue-600 transition-colors" onClick={handleSearch} />
                                                        </div>
                                                        {isSearching && (
                                                            <div className="text-center py-4 text-gray-500">
                                                                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                                                                جاري البحث...
                                                            </div>
                                                        )}
                                                        {!isSearching && searched && searchResults.length === 0 && (
                                                            <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-lg">لم يتم العثور على مستخدمين مطابقين.</div>
                                                        )}
                                                        {!isSearching && searchResults.length > 0 && (
                                                            <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                                                                {searchResults.map(user => (
                                                                    <div key={user.id}
                                                                        onClick={() => {
                                                                            if (initialData) {
                                                                                // Edit mode: just store selected user for invite sending
                                                                                setFormData({ ...formData, _selectedLinkUser: user } as any);
                                                                            } else {
                                                                                // Add mode: set userId directly
                                                                                setFormData({ ...formData, userId: user.id, email: formData.email || user.email || '', name: formData.name || user.full_name || '', phone: formData.phone || user.phone || '', isLinkedAccount: true });
                                                                                setSearchResults([]);
                                                                                setSearchQuery('');
                                                                            }
                                                                        }}
                                                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                                                            (formData as any)._selectedLinkUser?.id === user.id
                                                                                ? 'border-blue-500 bg-blue-50'
                                                                                : 'hover:border-blue-300 hover:bg-gray-50'
                                                                        }`}
                                                                    >
                                                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden shrink-0">
                                                                            {user.avatar_url ? <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" /> : (user.full_name?.[0] || '?')}
                                                                        </div>
                                                                        <div className="overflow-hidden">
                                                                            <div className="font-semibold text-sm text-gray-900 truncate">{user.full_name}</div>
                                                                            <div className="text-xs text-gray-500 truncate">{user.email || user.phone}</div>
                                                                        </div>
                                                                        <Check className={`w-4 h-4 text-blue-600 mr-auto ${
                                                                            (formData as any)._selectedLinkUser?.id === user.id ? 'opacity-100' : 'opacity-0'
                                                                        }`} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {/* Send invite to link — only in Edit mode when a user is selected */}
                                                        {initialData && (formData as any)._selectedLinkUser && (
                                                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                                <p className="text-xs text-blue-800 mb-2">
                                                                    سيتم إرسال دعوة إلى <span className="font-bold">{(formData as any)._selectedLinkUser.email}</span>. عند قبولها، سيتم تحديث بيانات الاتصال (الاسم والبريد والهاتف) تلقائياً مع الحفاظ على بقية تفاصيل الموظف.
                                                                </p>
                                                                <button
                                                                    type="button"
                                                                    disabled={cancellingInvitation}
                                                                    onClick={async () => {
                                                                        const selectedUser = (formData as any)._selectedLinkUser;
                                                                        if (!selectedUser || !onInvite || !initialData?.id) return;
                                                                        setCancellingInvitation(true);
                                                                        try {
                                                                            // Send invite referencing the current staff record ID
                                                                            await onInvite(selectedUser.email, initialData.position || 'staff', initialData.id);
                                                                            setFormData({ ...formData, _selectedLinkUser: undefined } as any);
                                                                            setSearchResults([]);
                                                                            setSearchQuery('');
                                                                            onClose();
                                                                        } finally {
                                                                            setCancellingInvitation(false);
                                                                        }
                                                                    }}
                                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                                >
                                                                    <Mail className="w-4 h-4" />
                                                                    {cancellingInvitation ? 'جاري الإرسال...' : 'إرسال دعوة الربط'}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Option 2: Create New Credentials */}
                                            <div className="border rounded-xl p-5 hover:border-green-300 transition-colors bg-white">
                                                <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                                                    <span className="text-green-500">🆕</span> إنشاء بيانات دخول جديدة
                                                </h4>
                                                <p className="text-xs text-gray-500 mb-3">أنشئ حساباً خاصاً بهذه العيادة. ستتمكن لاحقاً من استعادة كلمة المرور.</p>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 mb-1">البريد الإلكتروني (للدخول)</label>
                                                        <input type="email" value={formData.email}
                                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                            placeholder="name@clinic.com" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-700 mb-1">كلمة المرور</label>
                                                        <div className="flex gap-2">
                                                            <input type="text" value={formData.password}
                                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 font-mono"
                                                                placeholder="تعيين كلمة مرور..." />
                                                            <button type="button"
                                                                className="whitespace-nowrap px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-colors"
                                                                onClick={() => { const p = Math.random().toString(36).slice(-8) + '#2'; setFormData({ ...formData, password: p }); }}>
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
                                ) : (isSelfEditing && !isLoggedInUserOwner) ? (
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                                        <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Shield className="w-8 h-8 text-amber-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">الدخول والصلاحيات</h3>
                                        <p className="text-gray-600 mb-4 max-w-sm mx-auto">
                                            الصلاحيات يتم إدارتها بواسطة مالك العيادة.
                                        </p>
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
