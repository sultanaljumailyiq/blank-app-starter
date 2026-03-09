import React, { useEffect, useState } from 'react';
import { AdminModal } from '../../../components/admin/AdminModal';
import { Button } from '../../../components/common/Button';
import { Building2, Globe, Users, TestTube, QrCode, Mail, Phone, MapPin, Stethoscope, Star } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

interface ClinicDetailsModalProps {
    clinic: any;
    isOpen: boolean;
    onClose: () => void;
    onToggleFeatured?: (id: string, currentStatus: boolean) => void;
}

export const ClinicDetailsModal: React.FC<ClinicDetailsModalProps> = ({
    clinic: initialClinic,
    isOpen,
    onClose,
    onToggleFeatured
}) => {
    const [clinic, setClinic] = useState<any>(initialClinic);
    const [counts, setCounts] = useState({ patients: 0, staff: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && initialClinic?.id) {
            setClinic(initialClinic); // Reset to prop
            fetchDetails(initialClinic.id);
        }
    }, [isOpen, initialClinic]);

    const fetchDetails = async (clinicId: string) => {
        setLoading(true);
        try {
            // Fetch Counts
            const patientsPromise = supabase
                .from('patients')
                .select('*', { count: 'exact', head: true })
                .eq('clinic_id', clinicId);

            // Assuming profiles have clinic_id or we query a link table. 
            // If profiles doesn't have clinic_id, this might return 0. 
            // We'll try 'profiles' with 'clinic_id'.
            const staffPromise = supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('clinic_id', clinicId)
                .in('role', ['doctor', 'staff', 'nurse']);

            // Fetch fresh clinic data for contact info
            const clinicPromise = supabase
                .from('clinics')
                .select('*, owner:profiles!owner_id(full_name, phone_number, email)')
                .eq('id', clinicId)
                .single();

            const [patientsRes, staffRes, clinicRes] = await Promise.all([
                patientsPromise,
                staffPromise,
                clinicPromise
            ]);

            setCounts({
                patients: patientsRes.count || 0,
                staff: staffRes.count || 0
            });

            if (clinicRes.data) {
                setClinic((prev: any) => ({ ...prev, ...clinicRes.data }));
            }

        } catch (error) {
            console.error('Error fetching clinic details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!clinic) return null;

    return (
        <AdminModal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            size="lg"
            showCloseButton={false}
        >
            <div className="relative -m-6 mb-6">
                {/* Close Button Overlay */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all"
                >
                    <QrCode className="w-5 h-5 rotate-45" />
                </button>

                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
                    {clinic.cover_url ? (
                        <img
                            src={clinic.cover_url}
                            alt="Cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-pattern opacity-10" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                </div>

                {/* Profile Info Section */}
                <div className="px-8 pb-4">
                    <div className="relative flex justify-between items-end -mt-16 mb-6">
                        <div className="flex items-end gap-6">
                            {/* Logo / Avatar */}
                            <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-lg ring-1 ring-black/5">
                                {clinic.image_url ? (
                                    <img
                                        src={clinic.image_url}
                                        alt={clinic.name}
                                        className="w-full h-full object-cover rounded-xl bg-gray-50"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                        <Building2 className="w-12 h-12" />
                                    </div>
                                )}
                            </div>

                            <div className="mb-2">
                                <h2 className="text-3xl font-bold text-gray-900 mb-1">{clinic.name}</h2>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <span className="flex items-center gap-1.5 text-sm">
                                        <Building2 className="w-4 h-4" />
                                        {clinic.type === 'dental' ? 'عيادة أسنان' : 'مركز طبي'}
                                    </span>
                                    <span className="text-gray-300">|</span>
                                    <span className="flex items-center gap-1.5 text-sm">
                                        <Globe className="w-4 h-4" />
                                        {clinic.governorate && clinic.address ? `${clinic.governorate}، ${clinic.address}` : clinic.governorate || clinic.address || 'بغداد'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 flex gap-3">
                            {onToggleFeatured && (
                                <button
                                    onClick={() => {
                                        onToggleFeatured(clinic.id, clinic.is_featured);
                                        setClinic({ ...clinic, is_featured: !clinic.is_featured });
                                    }}
                                    className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${clinic.is_featured
                                        ? 'bg-yellow-50 text-yellow-600 border border-yellow-100 hover:bg-yellow-100'
                                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <Star className={`w-4 h-4 ${clinic.is_featured ? 'fill-current' : ''}`} />
                                    {clinic.is_featured ? 'عيادة مميزة' : 'تمييز العيادة'}
                                </button>
                            )}

                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Right Column: Owner & Contact */}
                        <div className="md:col-span-2 space-y-6">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-600" />
                                    معلومات المالك والإدارة
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">اسم المالك</label>
                                        <p className="font-semibold text-gray-900 text-lg">{clinic.owner?.full_name || clinic.owner_name || 'غير متوفر'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">رقم الهاتف</label>
                                        <div className="flex items-center gap-2 text-gray-900 text-lg">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span dir="ltr">{clinic.owner?.phone_number || clinic.phone || 'غير متوفر'}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">البريد الإلكتروني للإدارة</label>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span>{clinic.email || clinic.owner?.email || 'غير متوفر'}</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">الخدمات والتخصصات</label>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {clinic.specialties && clinic.specialties.length > 0 ? (
                                                clinic.specialties.map((spec: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                                                        {spec}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-sm flex items-center gap-2">
                                                    <Stethoscope className="w-4 h-4" />
                                                    طب الأسنان العام
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-3 text-sm">نبذة عن العيادة</h3>
                                <p className="text-gray-600 leading-relaxed bg-white border border-gray-100 p-4 rounded-xl text-sm">
                                    {clinic.description || 'لا يوجد وصف متاح لهذه العيادة حالياً.'}
                                </p>
                            </div>
                        </div>

                        {/* Left Column: Stats & Address */}
                        <div className="space-y-4">
                            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 text-center">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-blue-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-bold text-blue-700 mb-1">
                                    {loading ? '...' : counts.patients}
                                </div>
                                <div className="text-sm font-medium text-blue-600/80">إجمالي المرضى</div>
                            </div>

                            <div className="bg-purple-50 rounded-2xl p-5 border border-purple-100 text-center">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-purple-600">
                                    <TestTube className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-bold text-purple-700 mb-1">
                                    {loading ? '...' : counts.staff}
                                </div>
                                <div className="text-sm font-medium text-purple-600/80">الكادر الطبي</div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-purple-600" />
                                    العنوان
                                </h4>
                                <p className="text-sm text-gray-600 mb-1 font-medium">
                                    {clinic.governorate && clinic.address ? `${clinic.governorate}، ${clinic.address}` : clinic.governorate || clinic.address || ''}
                                </p>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 p-6 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>إغلاق</Button>
                </div>
            </div>
        </AdminModal>
    );
};
