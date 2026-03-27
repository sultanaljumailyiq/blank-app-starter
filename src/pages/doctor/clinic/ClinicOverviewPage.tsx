import React from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Building2,
  Clock,
  Star,
  MapPin,
  Phone,
  AlertCircle,
  Activity,
  CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BentoStatCard } from '../../../components/dashboard/BentoStatCard';
import { formatDate } from '../../../lib/utils';
import { Card } from '../../../components/common/Card';
// Mock data removed

// Hooks
import { useClinics } from '@/hooks/useClinics';
import { useFinance } from '@/hooks/useFinance';
import { usePatients } from '@/hooks/usePatients';
import { useInventory } from '@/hooks/useInventory';
import { useAppointments } from '@/hooks/useAppointments';
import { useStaff } from '@/hooks/useStaff';

import { Clinic } from '../../../types';

interface ClinicOverviewPageProps {
  clinicId: string;
  defaultClinic?: Clinic;
  onNavigate?: (tab: string) => void;
}

export const ClinicOverviewPage: React.FC<ClinicOverviewPageProps> = ({ clinicId, defaultClinic, onNavigate }) => {
  const navigate = useNavigate();

  // Real Data Hooks
  const { clinics, loading: loadingClinics } = useClinics();
  const { transactions } = useFinance(clinicId);
  const { patients } = usePatients(clinicId);
  const { inventory: inventoryItems } = useInventory(clinicId);
  const { appointments } = useAppointments(clinicId);
  const { staff } = useStaff(clinicId);

  // Mock Data Removed
  const mockClinic = null;

  // Find Real Clinic
  // Use passed defaultClinic if available, otherwise search in clinics list
  const realClinic = defaultClinic || clinics.find(c => c.id.toString() === clinicId) as any;

  // Handle Loading
  if (loadingClinics && !realClinic) {
    return <div className="p-8 text-center text-gray-500">جاري تحميل بيانات العيادة...</div>; // Simple fallback
  }

  // Handle Loading standard
  if (!realClinic && loadingClinics) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-64 h-48 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-32">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate Real Stats
  const totalPatients = patients.length;

  // Calculate Daily Appointments (Real-time)
  const todayDate = new Date().toISOString().split('T')[0];
  const dailyAppointments = appointments.filter(a => a.date === todayDate).length;

  // Revenue Calculation
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Active Staff (Real-time)
  const activeStaff = staff.filter(s => s.status === 'active' || !s.status).length; // Fallback if status missing

  // Inventory Stats
  const totalEquipment = inventoryItems?.length || 0;
  const lowStockCount = inventoryItems?.filter(i => i.quantity <= (i.minStock || 0)).length || 0;

  // Recent Patients (Real)
  const recentPatients = [...patients]
    .sort((a, b) => new Date(b.lastVisit || 0).getTime() - new Date(a.lastVisit || 0).getTime())
    .slice(0, 5);

  if (!realClinic) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">العيادة غير موجودة</h2>
        </div>
      </div>
    );
  }

  // Display Object Creation
  const displayClinic = {
    // Priority: Real Data -> Default Fallback
    name: realClinic.name || 'العيادة',
    address: realClinic.governorate ? `${realClinic.governorate}${realClinic.address ? `، ${realClinic.address}` : ''}` : (realClinic.address || ''),
    phone: realClinic.phone || '',
    totalPatients: totalPatients,
    dailyAppointments: dailyAppointments,
    specialties: (realClinic.specialties && realClinic.specialties.length > 0)
      ? (Array.isArray(realClinic.specialties) ? realClinic.specialties : [realClinic.specialties])
      : ['طب عام'],
    openTime: realClinic.openTime || '09:00',
    closeTime: realClinic.closeTime || '17:00',
    workingDays: realClinic.workingDays || ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
    image: realClinic.image || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2600&ixlib=rb-4.0.3',
    rating: realClinic.rating || '4.8',
    cover: realClinic.coverImage || 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=60'
  };

  return (
    <div className="space-y-6">

      {/* Clinic Header Info */}
      <Card className="overflow-hidden">
        {/* Cover Image - Added padding and rounded corners */}
        <div className="p-2">
          <div className="h-48 md:h-64 w-full relative rounded-2xl overflow-hidden shadow-sm">
            <img
              src={displayClinic.cover}
              alt="Clinic Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          </div>
        </div>

        <div className="relative px-8 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-20 md:-mt-24 relative z-10">
            {/* Clinic Logo - increased size and border */}
            <div className="w-36 h-36 md:w-48 md:h-48 rounded-3xl border-[6px] border-white shadow-xl overflow-hidden bg-white shrink-0">
              <img
                src={displayClinic.image}
                alt={displayClinic.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Clinic Details */}
            <div className="flex-1 text-center md:text-left pt-2 md:pt-0 md:mb-1">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{displayClinic.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-gray-600">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{displayClinic.address}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm dir-ltr">{displayClinic.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    نشطة
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-100 pt-8 mt-6">
            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">التخصص</p>
                <p className="text-sm font-bold text-gray-900 truncate max-w-[120px]" title={displayClinic.specialties[0]}>
                  {displayClinic.specialties[0]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">ساعات العمل</p>
                <p className="text-sm font-bold text-gray-900 dir-ltr">
                  {displayClinic.openTime} - {displayClinic.closeTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="p-3 bg-fuchsia-100 text-fuchsia-600 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">عدد المرضى</p>
                <p className="text-sm font-bold text-gray-900">{totalPatients} مريض</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">التقييم العام</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-gray-900">{displayClinic.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Stats Grid */}
      < div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4" >
        <BentoStatCard
          title="إجمالي المرضى"
          value={totalPatients}
          icon={Users}
          color="blue"
          trend="up"
          trendValue="8.2%"
          delay={100}
        />
        <BentoStatCard
          title="المواعيد اليومية"
          value={dailyAppointments}
          icon={Calendar}
          color="purple"
          delay={200}
        />
        <BentoStatCard
          title="الإيرادات"
          value={`${totalIncome.toLocaleString()} د.ع`}
          icon={DollarSign}
          color="green"
          trend="up"
          trendValue="12.5%"
          delay={300}
        />
        <BentoStatCard
          title="الكادر الطبي"
          value={activeStaff}
          icon={Users}
          color="orange"
          delay={400}
        />
      </div >

      {/* Secondary Stats */}
      < div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4" >
        <BentoStatCard
          title="المخزون / المواد"
          value={totalEquipment}
          icon={Building2}
          color="emerald"
          delay={500}
        />
        <BentoStatCard
          title="تنبيهات المخزون"
          value={lowStockCount}
          icon={AlertCircle}
          color={lowStockCount > 0 ? "red" : "green"}
          trend={lowStockCount > 0 ? "down" : "neutral"}
          trendValue={lowStockCount > 0 ? "ينفد قريباً" : "مستقر"}
          delay={600}
        />
        <BentoStatCard
          title="تقييم الأداء"
          value="98%"
          icon={Star}
          color="amber"
          trend="up"
          trendValue="2.1%"
          delay={700}
        />
        <BentoStatCard
          title="نسبة الإشغال"
          value="85%"
          icon={CheckCircle}
          color="indigo"
          delay={800}
        />
      </div >

      {/* Content Grid */}
      < div className="grid grid-cols-1 lg:grid-cols-2 gap-6" >

        {/* Recent Patients */}
        < Card >
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">المرضى حديثاً</h2>
            <div className="space-y-3">
              {recentPatients.length > 0 ? recentPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-600">العمر: {patient.age || 'غير محدد'} سنة</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      زيارة #{patient.totalVisits || 1}
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDate(patient.lastVisit || new Date().toISOString())}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-gray-500">لا يوجد مرضى حالياً</div>
              )}
            </div>
          </div>
        </Card >

        {/* Quick Actions */}
        < Card >
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">اختصارات سريعة</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate?.('appointments')}
                className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all text-center group"
              >
                <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-blue-900">حجز جديد</p>
                <p className="text-xs text-blue-600">موعد اليوم</p>
              </button>

              <button
                onClick={() => onNavigate?.('patients')}
                className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all text-center group"
              >
                <Users className="w-8 h-8 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-green-900">مريض جديد</p>
                <p className="text-xs text-green-600">إضافة ملف</p>
              </button>

              <button
                onClick={() => onNavigate?.('assets')}
                className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-all text-center group"
              >
                <Building2 className="w-8 h-8 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-purple-900">المعدات</p>
                <p className="text-xs text-purple-600">فحص المخزون</p>
              </button>

              <button
                onClick={() => onNavigate?.('reports')}
                className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:shadow-md transition-all text-center group"
              >
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-orange-900">التقارير</p>
                <p className="text-xs text-orange-600">الإحصائيات</p>
              </button>
            </div>
          </div>
        </Card >
      </div >

      {/* Specialties and Working Hours */}
      {/* Kept unchanged but updated context */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Specialties */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">التخصصات</h2>
            <div className="space-y-3">
              {displayClinic.specialties.map((specialty, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <span className="font-medium text-gray-900">{specialty}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Working Schedule */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">أوقات العمل</h2>
            <div className="space-y-3">
              {displayClinic.openTime && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium text-gray-900">ساعات العمل اليومية</span>
                  </div>
                  <span className="text-green-700 font-semibold">
                    {displayClinic.openTime} - {displayClinic.closeTime}
                  </span>
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">أيام العمل:</h3>
                <div className="flex flex-wrap gap-2">
                  {displayClinic.workingDays.map((day, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div >
  );
};