import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  User,
  Building,
  Clock,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Star,
  MapPin,
  Phone,
  Save,
  ArrowLeft,
  Stethoscope,
  ShieldCheck // Added
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Modal } from '../../../components/common/Modal';
import { useStaff } from '../../../hooks/useStaff';
import { useLabs, Laboratory } from '../../../hooks/useLabs';

interface Patient {
  id: number;
  name: string;
  age?: number;
  phone?: string;
  notes?: string;
}

interface NewLabOrderProps {
  isModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  preSelectedLabId?: string | null;
  clinicId?: string; // Optional if passed as prop, otherwise from URL
}

export const NewLabOrder: React.FC<NewLabOrderProps> = ({
  isModal = false,
  isOpen = false,
  onClose,
  preSelectedLabId,
  clinicId: propClinicId
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const params = useParams<{ clinicId: string }>();
  const clinicId = propClinicId || params.clinicId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Patient Data
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientNotes, setPatientNotes] = useState('');

  // Doctor Selection
  const { staff } = useStaff(clinicId);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');

  // Filter doctors
  const doctors = React.useMemo(() => {
    return staff.filter(s =>
      s.position.toLowerCase().includes('doctor') ||
      s.position.toLowerCase().includes('dentist') ||
      s.position.toLowerCase().includes('طبيب')
    );
  }, [staff]);

  // Order Data
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [priority, setPriority] = useState<'عادية' | 'عالية' | 'عاجلة'>('عادية');
  const [workType, setWorkType] = useState<string>('');
  const [teethInfo, setTeethInfo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  // Search
  const { labs: platformLabs, savedLabs, loading: searchLoading, fetchLabs } = useLabs();
  const searchResults = [...platformLabs, ...savedLabs];

  // Initialize with all labs and pre-select if needed
  useEffect(() => {
    fetchLabs();
  }, []);

  useEffect(() => {
    const initSelection = async () => {
      if (preSelectedLabId) {
        // 1. Try to find in loaded results
        const found = searchResults.find(l => l.id === preSelectedLabId);
        if (found) {
          handleLabSelect(found as unknown as Laboratory);
        } else {
          // 2. If not found (e.g. not in first page/query), fetch directly
          try {
            const { data, error } = await supabase
              .from('dental_laboratories')
              .select('*')
              .eq('id', preSelectedLabId)
              .single();

            if (data && !error) {
              // Need to map data to Laboratory interface if needed, or cast
              // Assuming the shape matches roughly or handling missing fields
              handleLabSelect(data as unknown as Laboratory);
            }
          } catch (err) {
            console.error('Failed to fetch pre-selected lab:', err);
          }
        }
      }
    };

    initSelection();
  }, [preSelectedLabId, searchResults]);

  const specialties = ['تركيبات', 'زرعات', 'تقويم', 'إصلاح أعطال'];

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setSelectedLab(null);
    setSelectedService('');
    fetchLabs('', specialty);
  };

  const handleLabSelect = (lab: Laboratory) => {
    setSelectedLab(lab);
    const labSpecialty = lab.specialties?.[0] || '';
    if (!selectedSpecialty) setSelectedSpecialty(labSpecialty);
  };

  const handleServiceChange = (serviceName: string) => {
    setSelectedService(serviceName);
    if (selectedLab) {
      const service = selectedLab.services?.find(s => s.name === serviceName);
      if (service) {
        setWorkType(serviceName);
        setEstimatedCost(service.price);
      }
    }
  };

  const handleSubmitOrder = async () => {
    if (!patientName.trim()) { setError('يرجى إدخال اسم المريض'); return; }
    if (!selectedLab) { setError('يرجى اختيار معمل'); return; }
    if (!selectedDoctorId) { setError('يرجى اختيار الطبيب المعالج'); return; }
    if (!selectedService) { setError('يرجى اختيار الخدمة'); return; }
    if (!workType.trim()) { setError('يرجى إدخال نوع العمل'); return; }
    if (!teethInfo.trim()) { setError('يرجى إدخال معلومات الأسنان'); return; }
    if (!clinicId) { setError('لم يتم العثور على ملف العيادة. يرجى إعداد العيادة أولاً.'); return; }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // 1. Find or Create Patient
      let patientId: number;

      // Check for existing patient in THIS clinic
      const { data: existingPatient } = await supabase
        .from('patients')
        .select('id')
        .eq('name', patientName)
        // .eq('clinic_id', clinicId) // Ideally we filter by clinic
        .single();

      if (existingPatient) {
        patientId = existingPatient.id;
      } else {
        const { data: newPatient, error: createError } = await supabase
          .from('patients')
          .insert({
            name: patientName,
            age: patientAge ? parseInt(patientAge) : null,
            phone: patientPhone || '',
            notes: patientNotes || '',
            clinic_id: clinicId // Use real clinic ID
          })
          .select('id')
          .single();

        if (createError || !newPatient) throw new Error('فشل في إنشاء ملف المريض');
        patientId = newPatient.id;
      }

      // 2. Create Order
      const rpcParams = {
        p_lab_id: selectedLab.is_custom ? null : selectedLab.id,
        p_patient_id: patientId,
        p_clinic_id: clinicId,
        p_doctor_id: selectedDoctorId, // Pass selected doctor ID
        p_work_type: workType,
        p_teeth_info: {
          info: teethInfo,
          patient_name: patientName,
          service_name: selectedService,
          estimated_time: selectedLab.services?.find(s => s.name === selectedService)?.time_estimate || 24
        },
        p_priority: priority,
        p_notes: notes,
        p_estimated_time: selectedLab.services?.find(s => s.name === selectedService)?.time_estimate || 24,
        p_total_cost: estimatedCost,
        custom_lab_name: selectedLab.is_custom ? selectedLab.lab_name : null
      };

      const { data: orderResult, error: orderError } = await supabase
        .rpc('create_dental_lab_order', rpcParams);

      if (orderError) throw orderError;

      // Handle RPC response (array or single object depending on implementation)
      if (orderResult && orderResult.length > 0) {
        const order = orderResult[0];
        // Logic check if the RPC returns an error object inside
        if (order.status === 'error') throw new Error(order.message);

        setSuccess(`تم إنشاء الطلب بنجاح! رقم الطلب: ${order.order_number}`);
        resetForm();
        if (isModal && onClose) {
          setTimeout(onClose, 1500);
        }
      } else {
        throw new Error('لم يتم إنشاء الطلب، يرجى المحاولة مرة أخرى');
      }

    } catch (err: any) {
      console.error('Order creation failed:', err);
      setError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPatientName('');
    setPatientAge('');
    setPatientPhone('');
    setPatientNotes('');
    setSelectedLab(null);
    setSelectedService('');
    setSelectedSpecialty('');
    setPriority('عادية');
    setWorkType('');
    setTeethInfo('');
    setNotes('');
    setEstimatedCost(0);
  };

  const content = (
    <div className="space-y-6" dir="rtl">
      {/* Header - Show only if NOT modal */}
      {!isModal && (
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Package className="w-8 h-8" />
                إنشاء طلب عمل جديد
              </h1>
              <p className="text-green-100 opacity-90">
                إرسال يتطلب عمل إلى معمل الأسنان مع تفاصيل الحالة
              </p>
            </div>
            <button
              onClick={() => isModal && onClose ? onClose() : navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              عودة
            </button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Info */}
        <Card className="p-6 border-t-4 border-t-blue-500">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
            <User className="w-5 h-5 text-blue-600" />
            معلومات المريض
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المريض الكامل *</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="مثال: أحمد محمد علي"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العمر</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="07xxxxxxxxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات طبية</label>
              <textarea
                value={patientNotes}
                onChange={(e) => setPatientNotes(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                rows={3}
                placeholder="أي ملاحظات صحية مهمة..."
              />
            </div>
          </div>
        </Card>

        {/* Doctor Selection */}
        <Card className="p-6 border-t-4 border-t-indigo-500">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
            <Stethoscope className="w-5 h-5 text-indigo-600" />
            الطبيب المعالج
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">اختر الطبيب المسؤول عن الحالة</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctors.length > 0 ? (
                doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-3 border rounded-xl cursor-pointer transition-all flex items-center gap-3 ${selectedDoctorId === doc.id
                      ? 'border-indigo-600 bg-indigo-50 shadow-md ring-1 ring-indigo-600'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${selectedDoctorId === doc.id ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                      {doc.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`font-bold ${selectedDoctorId === doc.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500">{doc.position}</p>
                    </div>
                    {selectedDoctorId === doc.id && <CheckCircle className="w-5 h-5 text-indigo-600 mr-auto" />}
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">لا يوجد أطباء مسجلين في العيادة. سيتم استخدام حساب المدير.</p>
                  <button
                    type="button"
                    onClick={() => setSelectedDoctorId(user?.id || 'current')}
                    className={`mt-2 text-sm font-medium ${selectedDoctorId === (user?.id || 'current') ? 'text-indigo-600 underline' : 'text-gray-600'}`}
                  >
                    استخدام حسابي الحالي
                  </button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Labs Selection */}
        <Card className="p-6 border-t-4 border-t-purple-500 lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
            <Building className="w-5 h-5 text-purple-600" />
            اختيار المختبر
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">تخصص العمل المطلوب</label>
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty) => (
                  <button
                    key={specialty}
                    onClick={() => handleSpecialtyChange(specialty)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedSpecialty === specialty
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {specialty}
                  </button>
                ))}
              </div>
            </div>

            {searchLoading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    {selectedSpecialty ? 'لا توجد معامل متوفرة لهذا التخصص' : 'يرجى اختيار تخصص لعرض المعامل'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {searchResults.map((lab) => (
                      <div
                        key={lab.id}
                        onClick={() => handleLabSelect(lab)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all relative ${selectedLab?.id === lab.id
                          ? 'border-purple-600 bg-purple-50 shadow-md ring-1 ring-purple-600'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1">
                              <h3 className="font-bold text-gray-900">{lab.lab_name}</h3>
                              {lab.is_verified && <span title="موثق"><ShieldCheck className="w-4 h-4 text-blue-500 fill-blue-50" /></span>}
                              {lab.is_accredited && <span title="معتمد"><CheckCircle className="w-4 h-4 text-purple-600" /></span>}
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {lab.governorate}</span>
                              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {lab.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          {selectedLab?.id === lab.id && <CheckCircle className="w-6 h-6 text-purple-600" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Order Details (Only if Lab Selected) */}
      {selectedLab && (
        <Card className="p-6 border-t-4 border-t-green-500 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-3">
            <FileText className="w-5 h-5 text-green-600" />
            تفاصيل الطلب
          </h2>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {(selectedLab.services || [])
              .filter(service => !selectedSpecialty || service.name.includes(selectedSpecialty) || true) // Relaxed filter
              .map(service => (
                <div
                  key={service.name}
                  onClick={() => handleServiceChange(service.name)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all flex flex-col justify-between h-full ${selectedService === service.name
                    ? 'border-green-600 bg-green-50 shadow-md ring-1 ring-green-600'
                    : 'border-gray-200 hover:border-green-300'
                    }`}
                >
                  <div className="flex justify-between mb-2">
                    <h4 className="font-bold text-gray-900">{service.name}</h4>
                    {selectedService === service.name && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200/50">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {service.time_estimate} ساعة</span>
                    <span className="font-bold text-green-700">{service.price.toLocaleString()} د.ع</span>
                  </div>
                </div>
              ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وصف العمل *</label>
              <input
                type="text"
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="مثال: طقم أسنان كامل"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
              <div className="flex bg-gray-100 rounded-xl p-1">
                {['عادية', 'عالية', 'عاجلة'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p as any)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${priority === p
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">تفاصيل الأسنان (Teeth Info) *</label>
              <textarea
                value={teethInfo}
                onChange={(e) => setTeethInfo(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-mono text-sm"
                rows={4}
                placeholder="أدخل أرقام الأسنان، الألوان، والتعليمات الخاصة هنا..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات للمختبر</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                rows={2}
                placeholder="أي تعليمات إضافية بخصوص التوصيل أو المواد..."
              />
            </div>
          </div>
        </Card>
      )}

      {/* Footer Actions */}
      <div className="flex gap-4 pt-4 sticky bottom-4 z-10 bg-gray-50/90 backdrop-blur-sm p-4 rounded-t-xl border-t border-gray-200">
        <button
          onClick={handleSubmitOrder}
          disabled={loading || !selectedLab}
          className={`flex-1 py-3 px-6 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.99] ${loading || !selectedLab
            ? 'bg-gray-400 cursor-not-allowed shadow-none'
            : 'bg-green-600 hover:bg-green-700 hover:shadow-green-200'
            }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
              جاري المعالجة...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              إرسال الطلب ({estimatedCost > 0 ? estimatedCost.toLocaleString() + ' د.ع' : 'تحديد السعر'})
            </>
          )}
        </button>

        <button
          onClick={() => isModal && onClose ? onClose() : navigate(-1)}
          className="px-6 py-3 border border-gray-200 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          إلغاء
        </button>
      </div>

    </div>
  );

  if (isModal) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose || (() => { })}
        title="إنشاء طلب معمل"
        size="full" // Use full size for complex forms
      >
        <div className="max-h-[85vh] overflow-y-auto px-1">
          {content}
        </div>
      </Modal>
    );
  }

  return content;
};
