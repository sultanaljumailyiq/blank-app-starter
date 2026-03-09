import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Heart,
  Trash2,
  X
} from 'lucide-react';
import { formatDate } from '../../../lib/utils';
import { Card } from '../../../components/common/Card';
import { BentoStatCard } from '../../../components/dashboard/BentoStatCard';
import { useSubscriptionLimits } from '../../../hooks/useSubscriptionLimits';
import { usePatients } from '../../../hooks/usePatients';

interface ClinicPatientsPageProps {
  clinicId: string;
}

export const ClinicPatientsPage: React.FC<ClinicPatientsPageProps> = ({ clinicId }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { checkLimit } = useSubscriptionLimits();

  // Supabase Integration
  const { patients, loading, createPatient, deletePatient } = usePatients(clinicId);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    phone: '',
    age: '',
    gender: 'male',
    email: '',
    address: '',
    notes: ''
  });

  const handleCreatePatient = async () => {
    if (!newPatient.name || !newPatient.phone) {
      alert('يرجى إدخال الاسم ورقم الهاتف');
      return;
    }

    const limitCheck = checkLimit('patients');
    if (!limitCheck.allowed) {
      alert(limitCheck.message);
      return;
    }
    try {
      await createPatient({
        name: newPatient.name,
        phone: newPatient.phone,
        age: parseInt(newPatient.age) || 0,
        gender: newPatient.gender as any,
        email: newPatient.email,
        address: newPatient.address,
        notes: newPatient.notes,
        status: 'active',
        paymentStatus: 'pending'
      });
      setShowModal(false);
      setNewPatient({ name: '', phone: '', age: '', gender: 'male', email: '', address: '', notes: '' });
      alert('تم إضافة المريض بنجاح');
    } catch (e) {
      alert('حدث خطأ');
    }
  };

  const handleDeletePatient = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف ملف المريض "${name}"؟\nهذا الإجراء لا يمكن التراجع عنه.`)) {
      try {
        await deletePatient(id);
        // alert('تم حذف المريض بنجاح'); // Optional: Feedback is usually immediate via UI update
      } catch (e) {
        alert('حدث خطأ أثناء الحذف');
      }
    }
  };

  // Stats
  const stats = {
    total: patients.length,
    active: patients.filter(p => p.status === 'active').length,
    emergency: patients.filter(p => p.status === 'emergency').length,
    pendingPayments: 0, // Placeholder
    avgVisits: 0 // Placeholder
  };

  // Filter
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = searchTerm === '' ||
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm);

    const matchesStatus = selectedStatus === 'all' || patient.status === selectedStatus;
    // Payment status is mocked/placeholder for now
    // const matchesPayment = selectedPayment === 'all' || patient.paymentStatus === selectedPayment;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'emergency': return 'طوارئ';
      default: return 'غير محدد';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'مدفوع';
      case 'pending': return 'معلق';
      case 'overdue': return 'متأخر';
      default: return 'غير محدد';
    }
  };

  return (
    <div className="space-y-6">

      {/* Bento Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoStatCard
          title="إجمالي المرضى"
          value={stats.total}
          icon={Users}
          color="blue"
          trend="up"
          trendValue={`${stats.active} نشط`}
          delay={100}
        />
        <BentoStatCard
          title="حالات الطوارئ"
          value={stats.emergency}
          icon={AlertCircle}
          color="red"
          trend={stats.emergency > 0 ? "down" : "neutral"}
          trendValue="تتطلب انتباه"
          delay={200}
        />
        <BentoStatCard
          title="المدفوعات المعلقة"
          value={stats.pendingPayments}
          icon={Clock}
          color="orange"
          trend="neutral"
          trendValue="فواتير غير مسددة"
          delay={300}
        />
        <BentoStatCard
          title="متوسط الزيارات"
          value={stats.avgVisits}
          icon={Calendar}
          color="purple"
          trend="neutral"
          trendValue="لكل مريض"
          delay={400}
        />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">

            {/* Search */}
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
              <input
                type="text"
                placeholder="البحث بالاسم أو رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none w-full sm:w-40 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="emergency">طوارئ</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div className="relative">
              <select
                value={selectedPayment}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="appearance-none w-full sm:w-40 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
              >
                <option value="all">جميع المدفوعات</option>
                <option value="paid">مدفوع</option>
                <option value="pending">معلق</option>
                <option value="overdue">متأخر</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            {/* View Toggle */}
            <div className="flex bg-gray-50 rounded-xl p-1.5 border border-gray-100">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                شبكة
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                قائمة
              </button>
            </div>

            {/* Add Button */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm">مريض جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patients Display */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">المرضى ({filteredPatients.length})</h2>
            <div className="text-sm text-gray-600">
              يظهر {filteredPatients.length} من {patients.length} مريض
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">لم يتم العثور على مرضى مطابقين للبحث</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 cursor-pointer relative overflow-hidden"
                  onClick={() => navigate(`/doctor/clinic/${clinicId}/patient/${patient.id}`)}
                >
                  {/* Hover Accent */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Patient Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white flex items-center justify-center shadow-blue-100 shadow-lg text-lg font-bold">
                      {patient.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-blue-600 transition-colors">{patient.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                        <span>{patient.age} سنة</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span>{patient.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3 mb-5 bg-gray-50/50 p-3 rounded-xl border border-gray-50">
                    <div className="flex items-center gap-2.5 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span dir="ltr" className="font-mono">{patient.phone}</span>
                    </div>
                    {patient.address && (
                      <div className="flex items-center gap-2.5 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="truncate">{patient.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getStatusColor(patient.status)}`}>
                      {getStatusLabel(patient.status)}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${getPaymentStatusColor(patient.paymentStatus)}`}>
                      {getPaymentStatusLabel(patient.paymentStatus)}
                    </span>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{patient.lastVisit ? formatDate(patient.lastVisit) : 'لم يزر العيادة'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{patient.totalVisits} زيارة</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/doctor/clinic/${clinicId}/patient/${patient.id}`);
                      }}
                      className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm hover:shadow-blue-200"
                    >
                      عرض الملف
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePatient(patient.id, patient.name);
                      }}
                      className="w-10 flex items-center justify-center bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                      title="حذف الملف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/doctor/clinic/${clinicId}/patient/${patient.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">
                        {patient.age} سنة • {patient.gender === 'male' ? 'ذكر' : 'أنثى'} • {patient.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left">
                      <div className="text-sm text-gray-600">
                        آخر زيارة: {formatDate(patient.lastVisit || '')}
                      </div>
                      <div className="text-sm text-gray-600">
                        {patient.totalVisits} زيارة
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(patient.status)}`}>
                      {getStatusLabel(patient.status)}
                    </div>

                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(patient.paymentStatus)}`}>
                      {getPaymentStatusLabel(patient.paymentStatus)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
            <p className="text-sm text-gray-600">مرضى نشطين</p>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.emergency}</div>
            <p className="text-sm text-gray-600">حالات طوارئ</p>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.total - stats.pendingPayments}</div>
            <p className="text-sm text-gray-600">مدفوعات مكتملة</p>
          </div>
        </Card>
      </div>

      {/* Add Patient Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-blue-50">
              <h3 className="font-bold text-lg text-blue-800">إضافة مريض جديد</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={newPatient.name}
                  onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                  className="w-full border rounded-lg p-2.5"
                  placeholder="اسم المريض"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input
                  type="text"
                  value={newPatient.phone}
                  onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full border rounded-lg p-2.5"
                  placeholder="077..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العمر</label>
                <input
                  type="number"
                  value={newPatient.age}
                  onChange={e => setNewPatient({ ...newPatient, age: e.target.value })}
                  className="w-full border rounded-lg p-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
                <select
                  value={newPatient.gender}
                  onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}
                  className="w-full border rounded-lg p-2.5"
                >
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <input
                  type="text"
                  value={newPatient.address}
                  onChange={e => setNewPatient({ ...newPatient, address: e.target.value })}
                  className="w-full border rounded-lg p-2.5"
                  placeholder="بغداد..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                <textarea
                  value={newPatient.notes}
                  onChange={e => setNewPatient({ ...newPatient, notes: e.target.value })}
                  className="w-full border rounded-lg p-2.5"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">إلغاء</button>
              <button onClick={handleCreatePatient} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};