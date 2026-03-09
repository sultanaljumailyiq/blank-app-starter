import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  XCircle,
  CalendarX,
  BarChart3,
  PieChart,
  Download,
  FileText,
  Printer,
  RefreshCw,
  Activity,
  DollarSign,
  AlertTriangle,
  Star,
  Timer,
  UserCheck,
  Stethoscope
} from 'lucide-react';
import { StatsCard } from '../admin/StatsCard';
import type { Appointment, Doctor } from '../../types/appointments';
import { formatNumericDate } from '../../lib/date';

interface AppointmentStatsProps {
  appointments: Appointment[];
  dateRange: { from: string; to: string };
  doctors: Doctor[];
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

export const AppointmentStats: React.FC<AppointmentStatsProps> = ({
  appointments,
  dateRange,
  doctors
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');

  // فلترة المواعيد حسب النطاق الزمني
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const appointmentDate = appointment.date;
      return appointmentDate >= dateRange.from && appointmentDate <= dateRange.to;
    });
  }, [appointments, dateRange]);

  // حساب الإحصائيات الأساسية
  const basicStats = useMemo(() => {
    const total = filteredAppointments.length;
    const completed = filteredAppointments.filter(apt => apt.status === 'completed').length;
    const cancelled = filteredAppointments.filter(apt => apt.status === 'cancelled').length;
    const noShow = filteredAppointments.filter(apt => apt.status === 'noshow').length;
    const scheduled = filteredAppointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').length;

    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const cancellationRate = total > 0 ? (cancelled / total) * 100 : 0;
    const noShowRate = total > 0 ? (noShow / total) * 100 : 0;
    const attendanceRate = total > 0 ? ((completed + scheduled) / total) * 100 : 0;

    // احتساب الإيرادات التقديرية
    const estimatedRevenue = completed * 200; // متوسط 200 د.ع لكل موعد مكتمل

    return {
      total,
      completed,
      cancelled,
      noShow,
      scheduled,
      completionRate,
      cancellationRate,
      noShowRate,
      attendanceRate,
      estimatedRevenue
    };
  }, [filteredAppointments]);

  // إحصائيات الأطباء
  const doctorStats = useMemo(() => {
    const statsMap = new Map();

    doctors.forEach(doctor => {
      const doctorAppointments = filteredAppointments.filter(apt => apt.doctorId === doctor.id);
      const total = doctorAppointments.length;
      const completed = doctorAppointments.filter(apt => apt.status === 'completed').length;
      const cancelled = doctorAppointments.filter(apt => apt.status === 'cancelled').length;
      const revenue = completed * 200;

      statsMap.set(doctor.id, {
        ...doctor,
        totalAppointments: total,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        estimatedRevenue: revenue
      });
    });

    return Array.from(statsMap.values()).sort((a, b) => b.totalAppointments - a.totalAppointments);
  }, [filteredAppointments, doctors]);

  // إحصائيات أنواع المواعيد
  const typeStats = useMemo(() => {
    const types = ['consultation', 'treatment', 'followup', 'emergency', 'cleaning', 'examination'];
    const typeLabels = {
      consultation: 'استشارة',
      treatment: 'علاج',
      followup: 'متابعة',
      emergency: 'طوارئ',
      cleaning: 'تنظيف',
      examination: 'فحص'
    };

    return types.map(type => {
      const count = filteredAppointments.filter(apt => apt.type === type).length;
      const percentage = basicStats.total > 0 ? (count / basicStats.total) * 100 : 0;

      return {
        type,
        label: typeLabels[type as keyof typeof typeLabels] || type,
        count,
        percentage
      };
    }).filter(item => item.count > 0);
  }, [filteredAppointments, basicStats.total]);

  // إحصائيات يومية (آخر 30 يوم)
  const dailyStats = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const dayAppointments = filteredAppointments.filter(apt => apt.date === dateString);
      const completed = dayAppointments.filter(apt => apt.status === 'completed').length;
      const cancelled = dayAppointments.filter(apt => apt.status === 'cancelled').length;

      days.push({
        date: dateString,
        dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        total: dayAppointments.length,
        completed,
        cancelled
      });
    }

    return days;
  }, [filteredAppointments]);

  // إحصائيات الأوقات المفضلة
  const timeSlotStats = useMemo(() => {
    const timeSlots = new Map();

    filteredAppointments.forEach(appointment => {
      const hour = parseInt(appointment.startTime.split(':')[0]);
      let timeSlot;

      if (hour >= 8 && hour < 12) timeSlot = 'صباحاً (8-12)';
      else if (hour >= 12 && hour < 16) timeSlot = 'ظهراً (12-16)';
      else if (hour >= 16 && hour < 20) timeSlot = 'مساءً (16-20)';
      else timeSlot = 'أخرى';

      timeSlots.set(timeSlot, (timeSlots.get(timeSlot) || 0) + 1);
    });

    return Array.from(timeSlots.entries()).map(([slot, count]) => ({
      timeSlot: slot,
      count,
      percentage: basicStats.total > 0 ? (count / basicStats.total) * 100 : 0
    }));
  }, [filteredAppointments, basicStats.total]);

  // دالة تصدير البيانات
  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {

    // هنا يمكن إضافة منطق التصدير الفعلي
  };

  // دالة طباعة التقرير
  const handlePrint = () => {

    window.print();
  };

  return (
    <div className="space-y-8">
      {/* العنوان والأدوات */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">إحصائيات وتقارير المواعيد</h2>
          <p className="text-gray-600">
            من {formatNumericDate(dateRange.from)} إلى {formatNumericDate(dateRange.to)}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="week">الأسبوع الماضي</option>
            <option value="month">الشهر الماضي</option>
            <option value="quarter">الربع الماضي</option>
            <option value="year">السنة الماضية</option>
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="تصدير PDF"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="طباعة"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* الإحصائيات الأساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="إجمالي المواعيد"
          value={basicStats.total}
          trend={{ value: 12.5, direction: 'up' }}
          icon={Calendar}
          color="purple"
        />
        <StatsCard
          title="مواعيد مكتملة"
          value={basicStats.completed}
          trend={{ value: 8.3, direction: 'up' }}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="معدل الإكمال"
          value={`${basicStats.completionRate.toFixed(1)}%`}
          trend={{ value: 5.7, direction: 'up' }}
          icon={Activity}
          color="blue"
        />
        <StatsCard
          title="الإيرادات التقديرية"
          value={`${basicStats.estimatedRevenue.toLocaleString()} د.ع`}
          trend={{ value: 15.2, direction: 'up' }}
          icon={DollarSign}
          color="orange"
        />
      </div>

      {/* إحصائيات تفصيلية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* معدلات الأداء */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            معدلات الأداء
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">معدل الإكمال</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${basicStats.completionRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{basicStats.completionRate.toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">معدل الإلغاء</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${basicStats.cancellationRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{basicStats.cancellationRate.toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">معدل عدم الحضور</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${basicStats.noShowRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{basicStats.noShowRate.toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">معدل الحضور</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${basicStats.attendanceRate}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{basicStats.attendanceRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* أنواع المواعيد */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-600" />
            أنواع المواعيد
          </h3>

          <div className="space-y-3">
            {typeStats.map((type, index) => {
              const colors = ['bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-indigo-500'];

              return (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                    <span className="text-sm font-medium text-gray-900">{type.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{type.count} موعد</span>
                    <span className="text-xs text-gray-400">({type.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* إحصائيات الأطباء */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-purple-600" />
          إحصائيات الأطباء
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الطبيب</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">إجمالي المواعيد</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">مكتملة</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">ملغية</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">معدل الإكمال</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإيرادات التقديرية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {doctorStats.map((doctor) => (
                <tr key={doctor.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {doctor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                        <div className="text-sm text-gray-500">{doctor.specialty}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {doctor.totalAppointments}
                  </td>
                  <td className="px-4 py-4 text-sm text-green-600 font-medium">
                    {doctor.completedAppointments}
                  </td>
                  <td className="px-4 py-4 text-sm text-red-600 font-medium">
                    {doctor.cancelledAppointments}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${doctor.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{doctor.completionRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {doctor.estimatedRevenue.toLocaleString()} د.ع
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* الأوقات المفضلة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            الأوقات المفضلة للحجز
          </h3>

          <div className="space-y-3">
            {timeSlotStats.map((slot) => (
              <div key={slot.timeSlot} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{slot.timeSlot}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${slot.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-left">{slot.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* اتجاهات يومية */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            اتجاهات آخر 30 يوم
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>التاريخ</span>
              <span>إجمالي</span>
              <span>مكتملة</span>
              <span>ملغية</span>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {dailyStats.slice(-10).map((day) => (
                <div key={day.date} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-gray-900 w-16">{day.dayName}</span>
                  <span className="w-12 text-center font-medium">{day.total}</span>
                  <span className="w-12 text-center text-green-600">{day.completed}</span>
                  <span className="w-12 text-center text-red-600">{day.cancelled}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ملخص الفترة */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">ملخص الفترة</h3>
            <p className="text-purple-100">
              من {formatNumericDate(dateRange.from)} إلى {formatNumericDate(dateRange.to)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{basicStats.total}</div>
            <div className="text-purple-100">موعد إجمالي</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
          <div className="text-center">
            <div className="text-2xl font-bold">{basicStats.completed}</div>
            <div className="text-purple-100 text-sm">مكتملة</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{basicStats.cancelled}</div>
            <div className="text-purple-100 text-sm">ملغية</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{basicStats.completionRate.toFixed(1)}%</div>
            <div className="text-purple-100 text-sm">معدل الإكمال</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{basicStats.estimatedRevenue.toLocaleString()}</div>
            <div className="text-purple-100 text-sm">ريال تقديري</div>
          </div>
        </div>
      </div>
    </div>
  );
};