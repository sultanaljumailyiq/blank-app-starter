import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, ChevronRight, AlertCircle, MapPin } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../lib/supabase';

export const BookingPage: React.FC = () => {
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    // Parse query params
    const searchParams = new URLSearchParams(location.search);
    const clinicId = searchParams.get('clinic');
    const doctorId = searchParams.get('doctor');

    // Form State
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [timePeriod, setTimePeriod] = useState<'morning' | 'evening'>('morning');
    const [patientData, setPatientData] = useState({
        name: '',
        phone: '',
        email: '',
        notes: '',
        age: '',
        gender: '',
        province: ''
    });

    // Clinic Data State
    const [clinicData, setClinicData] = useState<any>(null); // Using any for now to match strict type if not fully exported
    const [loadingClinic, setLoadingClinic] = useState(true);

    useEffect(() => {
        const fetchClinic = async () => {
            setLoadingClinic(true);
            try {
                // Try fetching from DB
                const { data, error } = await supabase
                    .from('clinics')
                    .select('*')
                    .eq('id', clinicId)
                    .single();

                if (data) {
                    setClinicData(data);
                }
            } catch (err) {
                console.error('Error fetching clinic:', err);
            } finally {
                setLoadingClinic(false);
            }
        };
        if (clinicId) fetchClinic();
    }, [clinicId]);

    // Dynamic available slots from working hours
    const availableSlots = React.useMemo(() => {
        let start = '09:00';
        let end = '18:00';

        if (clinicData?.working_hours && typeof clinicData.working_hours === 'string') {
            // Handle expected format "09:00 - 17:00" or similar
            const parts = clinicData.working_hours.split('-');
            if (parts.length === 2) {
                start = parts[0].trim();
                end = parts[1].trim();
            }
        }

        const slots = [];
        const parseTime = (timeStr: string) => {
            const [h, m] = timeStr.split(':').map(Number);
            return h * 60 + (m || 0);
        };

        const startTime = parseTime(start);
        const endTime = parseTime(end);

        for (let time = startTime; time < endTime; time += 30) {
            const hours = Math.floor(time / 60);
            const mins = time % 60;
            slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
        }
        return slots;
    }, [clinicData?.working_hours]);

    const formatTime12h = (time24: string): string => {
        if (!time24) return '';
        const [hoursStr, minutesStr] = time24.split(':');
        let hours = parseInt(hoursStr, 10);
        const suffix = hours >= 12 ? 'م' : 'ص';
        hours = hours % 12;
        hours = hours ? hours : 12;
        return `${hours}:${minutesStr} ${suffix}`;
    };

    const filteredSlots = availableSlots.filter(slot => {
        const hour = parseInt(slot.split(':')[0]);
        return timePeriod === 'morning' ? hour < 12 : hour >= 12;
    });

    const IRAQI_PROVINCES = [
        'بغداد', 'البصرة', 'نينوى', 'أربيل', 'النجف', 'كربلاء', 'بابل', 
        'الأنبار', 'ديالى', 'ذي قار', 'كركوك', 'صلاح الدين', 'المثنى', 
        'ميسان', 'القادسية', 'واسط', 'دهوك', 'السليمانية'
    ];

    // Mock next 7 days
    const getNextDays = () => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            dates.push(d);
        }
        return dates;
    };

    const dates = getNextDays();

    const [submitting, setSubmitting] = useState(false);

    const handleBook = async () => {
        if (!selectedDate || !selectedTime || !patientData.name || !patientData.phone) return;

        setSubmitting(true);
        try {
            // Convert date string to YYYY-MM-DD
            const dateObj = new Date(selectedDate);
            // Adjust for timezone offset to avoid previous day issue
            const offset = dateObj.getTimezoneOffset();
            const adjustedDate = new Date(dateObj.getTime() - (offset * 60 * 1000));
            const formattedDate = adjustedDate.toISOString().split('T')[0];

            const { error } = await supabase.from('appointments').insert({
                clinic_id: parseInt(clinicId || '1'),
                patient_name: patientData.name,
                staff_id: doctorId ? Number(doctorId) : null, // Optional
                doctor_name: 'غير محدد', // Default for online booking until assigned
                appointment_date: formattedDate,
                appointment_time: selectedTime,
                type: 'كشف عام (أونلاين)',
                treatment_type: 'كشف عام (أونلاين)', // Required by DB
                status: 'pending', // Online Request
                notes: `حجز إلكتروني - ${patientData.notes}\n\nبيانات إضافية:\nالعمر: ${patientData.age}\nالجنس: ${patientData.gender === 'male' ? 'ذكر' : 'أنثى'}\nالمحافظة: ${patientData.province}`,
                phone_number: patientData.phone,
                cost: 0
            });

            if (error) throw error;

            setStep(3); // Success step
        } catch (err) {
            console.error('Booking failed:', err);
            alert('حدث خطأ أثناء الحجز. يرجى المحاولة مرة أخرى.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingClinic && clinicId) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Clinic Banner & Header */}
            {clinicData && (
                <div className="bg-white border-b mb-8">
                    {/* Cover Image */}
                    <div className="h-48 md:h-64 bg-gray-200 relative overflow-hidden">
                        {clinicData.cover_url ? (
                            <img src={clinicData.cover_url} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center">
                                <Clock className="w-16 h-16 text-white/20" />
                            </div>
                        )}
                    </div>

                    {/* Clinic Info Bar */}
                    <div className="max-w-3xl mx-auto px-4 relative -mt-16 mb-6">
                        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Logo */}
                            <div className="w-24 h-24 bg-white rounded-xl shadow border-4 border-white overflow-hidden flex-shrink-0">
                                {clinicData.image_url ? (
                                    <img src={clinicData.image_url} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl">
                                        {clinicData.name?.charAt(0)}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">{clinicData.name}</h1>
                                {clinicData.description && (
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{clinicData.description}</p>
                                )}

                                <div className="flex flex-wrap gap-4 mb-3">
                                    {clinicData.phone && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone className="w-4 h-4" />
                                            <span dir="ltr">{clinicData.phone}</span>
                                        </div>
                                    )}
                                    {clinicData.working_hours && typeof clinicData.working_hours === 'string' && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span dir="ltr">{clinicData.working_hours}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Specialties Badges */}
                                {clinicData.specialties && clinicData.specialties.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {clinicData.specialties.slice(0, 3).map((spec: string, idx: number) => (
                                            <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100">
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Services Badges */}
                                {clinicData.services && clinicData.services.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {clinicData.services.slice(0, 4).map((srv: string, idx: number) => (
                                            <span key={idx} className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] rounded border border-green-100 flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" /> {srv}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-3xl mx-auto px-4">
                {!clinicData && (
                    <div className="mb-8 text-center pt-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">حجز موعد جديد</h1>
                        <p className="text-gray-600">
                            قم بتعبئة البيانات لتأكيد الحجز
                        </p>
                    </div>
                )}

                {step === 1 && (
                    <Card className="p-6 animate-in slide-in-from-bottom-4">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <Calendar className="w-5 h-5 text-primary" />
                                اختيار الموعد
                            </h2>

                            {/* Date Selection */}
                            <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                                {dates.map((date, idx) => {
                                    const isSelected = selectedDate === date.toDateString();
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedDate(date.toDateString())}
                                            className={`flex-shrink-0 w-24 p-3 rounded-xl border-2 transition-all ${isSelected
                                                ? 'border-primary bg-primary/5'
                                                : 'border-transparent bg-gray-100 hover:bg-gray-200'
                                                }`}
                                        >
                                            <div className={`text-xs font-bold mb-1 ${isSelected ? 'text-primary' : 'text-gray-500'}`}>
                                                {date.toLocaleDateString('ar-EG', { weekday: 'short' })}
                                            </div>
                                            <div className={`text-xl font-bold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                                                {date.getDate()}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Time Period Tabs */}
                            {selectedDate && (
                                <div className="flex border-b border-gray-200 bg-gray-50 rounded-lg mb-4">
                                    <button
                                        onClick={() => setTimePeriod('morning')}
                                        className={`flex-1 py-3 px-4 text-center font-medium transition-all ${timePeriod === 'morning'
                                            ? 'border-b-2 border-primary text-primary bg-primary/5 font-bold'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        الفترة الصباحية
                                    </button>
                                    <button
                                        onClick={() => setTimePeriod('evening')}
                                        className={`flex-1 py-3 px-4 text-center font-medium transition-all ${timePeriod === 'evening'
                                            ? 'border-b-2 border-primary text-primary bg-primary/5 font-bold'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        الفترة المسائية
                                    </button>
                                </div>
                            )}

                            {/* Time Selection */}
                            {selectedDate && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in">
                                    {filteredSlots.map((slot, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedTime(slot)}
                                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${selectedTime === slot
                                                ? 'border-primary bg-primary text-white shadow-md'
                                                : 'border-gray-200 hover:border-primary hover:text-primary'
                                                }`}
                                        >
                                            {formatTime12h(slot)}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {selectedDate && filteredSlots.length === 0 && (
                                <div className="text-center py-6 text-gray-500 text-sm">
                                    لا توجد أوقات متاحة في هذه الفترة.
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-6 border-t">
                            <Button
                                disabled={!selectedDate || !selectedTime}
                                onClick={() => setStep(2)}
                                size="lg"
                                className="px-8"
                            >
                                المتابعة
                            </Button>
                        </div>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="p-6 animate-in slide-in-from-bottom-4">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
                            <User className="w-5 h-5 text-primary" />
                            بيانات المريض
                        </h2>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                                <div className="relative">
                                    <User className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={patientData.name}
                                        onChange={e => setPatientData({ ...patientData, name: e.target.value })}
                                        className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="أدخل اسمك الكامل"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                                <div className="relative">
                                    <Phone className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={patientData.phone}
                                        onChange={e => setPatientData({ ...patientData, phone: e.target.value })}
                                        className="w-full pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                        placeholder="07XX XXXXXXX"
                                    />
                                </div>
                            </div>

                            {/* New Dropdowns Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">العمر</label>
                                    <select
                                        value={patientData.age}
                                        onChange={e => setPatientData({ ...patientData, age: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                                    >
                                        <option value="">اختر</option>
                                        {Array.from({ length: 90 }, (_, i) => i + 5).map(age => (
                                            <option key={age} value={age}>{age}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
                                    <select
                                        value={patientData.gender}
                                        onChange={e => setPatientData({ ...patientData, gender: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                                    >
                                        <option value="">اختر</option>
                                        <option value="male">ذكر</option>
                                        <option value="female">أنثى</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">المحافظة</label>
                                    <select
                                        value={patientData.province}
                                        onChange={e => setPatientData({ ...patientData, province: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white text-sm"
                                    >
                                        <option value="">اختر</option>
                                        {IRAQI_PROVINCES.map(prov => (
                                            <option key={prov} value={prov}>{prov}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية (اختياري)</label>
                                <textarea
                                    value={patientData.notes}
                                    onChange={e => setPatientData({ ...patientData, notes: e.target.value })}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all min-h-[100px]"
                                    placeholder="أي أعراض أو تفاصيل تريد إخبار الطبيب بها..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-6 border-t">
                            <Button
                                variant="ghost"
                                onClick={() => setStep(1)}
                            >
                                عودة
                            </Button>
                            <Button
                                disabled={!patientData.name || !patientData.phone || !patientData.age || !patientData.gender || !patientData.province || submitting}
                                onClick={handleBook}
                                size="lg"
                                className="px-8"
                            >
                                {submitting ? 'جاري الحجز...' : 'تأكيد الحجز'}
                            </Button>
                        </div>
                    </Card>
                )}

                {step === 3 && (
                    <Card className="p-12 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">تم الحجز بنجاح!</h2>
                        <p className="text-gray-600 mb-8">
                            شكراً لك {patientData.name}، تم تأكيد موعدك ليوم {selectedDate} الساعة {selectedTime}.
                            <br />
                            سيتم إرسال رسالة تأكيد إلى هاتفك.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Button onClick={() => navigate('/')} variant="outline">
                                العودة للرئيسية
                            </Button>
                            <Button onClick={() => navigate('/services')}>
                                تصفح الخدمات الطبية
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
};
