import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Filter,
  SortDesc,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
  Eye,
  CalendarX,
  CalendarCheck,
  AlertTriangle,
  Star,
  MessageSquare
} from 'lucide-react';
import { AppointmentCard } from './AppointmentCard';
import type { Appointment, AppointmentStatus } from '../../types/appointments';
import { formatNumericDate } from '../../lib/date';

interface AppointmentListProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointmentId: string) => void;
  onStatusChange: (appointmentId: string, status: AppointmentStatus) => void;
  showPagination?: boolean;
  itemsPerPage?: number;
  viewMode?: 'cards' | 'table';
}

type SortField = 'date' | 'time' | 'patientName' | 'doctorName' | 'status' | 'type';
type SortDirection = 'asc' | 'desc';

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onEdit,
  onCancel,
  onStatusChange,
  showPagination = true,
  itemsPerPage = 20,
  viewMode = 'cards'
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [currentViewMode, setCurrentViewMode] = useState<'cards' | 'table'>(viewMode);

  // ترتيب المواعيد
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortField) {
        case 'date':
          aValue = new Date(a.date + ' ' + a.startTime);
          bValue = new Date(b.date + ' ' + b.startTime);
          break;
        case 'time':
          aValue = a.startTime;
          bValue = b.startTime;
          break;
        case 'patientName':
          aValue = a.patientName.toLowerCase();
          bValue = b.patientName.toLowerCase();
          break;
        case 'doctorName':
          aValue = a.doctorName.toLowerCase();
          bValue = b.doctorName.toLowerCase();
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [appointments, sortField, sortDirection]);

  // تقسيم الصفحات
  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = showPagination
    ? sortedAppointments.slice(startIndex, endIndex)
    : sortedAppointments;

  // دالة تغيير الترتيب
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // دالة اختيار المواعيد
  const toggleSelectAppointment = (appointmentId: string) => {
    setSelectedAppointments(prev =>
      prev.includes(appointmentId)
        ? prev.filter(id => id !== appointmentId)
        : [...prev, appointmentId]
    );
  };

  // اختيار جميع المواعيد
  const toggleSelectAll = () => {
    if (selectedAppointments.length === currentAppointments.length) {
      setSelectedAppointments([]);
    } else {
      setSelectedAppointments(currentAppointments.map(apt => apt.id));
    }
  };

  // ألوان حالات المواعيد
  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'inprogress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'noshow': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // أيقونات حالات المواعيد
  const getStatusIcon = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'inprogress': return <PlayCircle className="w-4 h-4" />;
      case 'completed': return <CalendarCheck className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'noshow': return <CalendarX className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // ترجمة حالات المواعيد
  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'scheduled': return 'مجدول';
      case 'confirmed': return 'مؤكد';
      case 'inprogress': return 'جاري التنفيذ';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      case 'noshow': return 'لم يحضر';
      default: return 'غير محدد';
    }
  };

  // ترجمة أنواع المواعيد
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'consultation': return 'استشارة';
      case 'treatment': return 'علاج';
      case 'followup': return 'متابعة';
      case 'emergency': return 'طوارئ';
      case 'cleaning': return 'تنظيف';
      case 'examination': return 'فحص';
      default: return type;
    }
  };

  // عرض البطاقات
  const renderCardsView = () => (
    <div className="space-y-4">
      {/* أدوات التحكم */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            عرض {currentAppointments.length} من {sortedAppointments.length} موعد
          </span>
          {selectedAppointments.length > 0 && (
            <span className="text-sm text-purple-600 font-medium">
              تم اختيار {selectedAppointments.length} موعد
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortField(field as SortField);
              setSortDirection(direction as SortDirection);
            }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="date-asc">ترتيب حسب التاريخ (أقدم أولاً)</option>
            <option value="date-desc">ترتيب حسب التاريخ (أحدث أولاً)</option>
            <option value="time-asc">ترتيب حسب الوقت (مبكر أولاً)</option>
            <option value="time-desc">ترتيب حسب الوقت (متأخر أولاً)</option>
            <option value="patientName-asc">ترتيب حسب اسم المريض (أ-ي)</option>
            <option value="patientName-desc">ترتيب حسب اسم المريض (ي-أ)</option>
            <option value="status-asc">ترتيب حسب الحالة</option>
          </select>

          <button
            onClick={() => setCurrentViewMode(currentViewMode === 'cards' ? 'table' : 'cards')}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title={currentViewMode === 'cards' ? 'عرض جدولي' : 'عرض بطاقات'}
          >
            {currentViewMode === 'cards' ? <Filter className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* البطاقات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentAppointments.map(appointment => (
          <div key={appointment.id} className="relative">
            {/* خانة الاختيار */}
            <div className="absolute top-4 left-4 z-10">
              <input
                type="checkbox"
                checked={selectedAppointments.includes(appointment.id)}
                onChange={() => toggleSelectAppointment(appointment.id)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
            </div>

            <AppointmentCard
              appointment={appointment}
              onEdit={() => onEdit(appointment)}
              onCancel={() => onCancel(appointment.id)}
              compact={false}
            />
          </div>
        ))}
      </div>
    </div>
  );

  // عرض جدولي
  const renderTableView = () => (
    <div className="space-y-4">
      {/* أدوات التحكم */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            عرض {currentAppointments.length} من {sortedAppointments.length} موعد
          </span>
          {selectedAppointments.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-purple-600 font-medium">
                تم اختيار {selectedAppointments.length} موعد
              </span>
              <button
                onClick={() => setSelectedAppointments([])}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                إلغاء التحديد
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => setCurrentViewMode('cards')}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="عرض بطاقات"
        >
          <Calendar className="w-5 h-5" />
        </button>
      </div>

      {/* الجدول */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-right">
                <input
                  type="checkbox"
                  checked={selectedAppointments.length === currentAppointments.length && currentAppointments.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center gap-1">
                  التاريخ والوقت
                  {sortField === 'date' && (
                    <SortDesc className={`w-4 h-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('patientName')}
              >
                <div className="flex items-center gap-1">
                  المريض
                  {sortField === 'patientName' && (
                    <SortDesc className={`w-4 h-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('doctorName')}
              >
                <div className="flex items-center gap-1">
                  الطبيب
                  {sortField === 'doctorName' && (
                    <SortDesc className={`w-4 h-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-1">
                  النوع
                  {sortField === 'type' && (
                    <SortDesc className={`w-4 h-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  الحالة
                  {sortField === 'status' && (
                    <SortDesc className={`w-4 h-4 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentAppointments.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedAppointments.includes(appointment.id)}
                    onChange={() => toggleSelectAppointment(appointment.id)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatNumericDate(appointment.date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.startTime}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.patientName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {appointment.patientPhone}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{appointment.doctorName}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    {getTypeLabel(appointment.type)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    {getStatusLabel(appointment.status)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowActions(showActions === appointment.id ? null : appointment.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {showActions === appointment.id && (
                      <div className="absolute left-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => {
                            onEdit(appointment);
                            setShowActions(null);
                          }}
                          className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          تعديل
                        </button>
                        <button
                          onClick={() => {
                            onStatusChange(appointment.id, 'confirmed');
                            setShowActions(null);
                          }}
                          className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          تأكيد
                        </button>
                        <button
                          onClick={() => {
                            onStatusChange(appointment.id, 'completed');
                            setShowActions(null);
                          }}
                          className="w-full px-4 py-2 text-right text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <CalendarCheck className="w-4 h-4" />
                          إكمال
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => {
                            onCancel(appointment.id);
                            setShowActions(null);
                          }}
                          className="w-full px-4 py-2 text-right text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          إلغاء
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{appointments.length}</div>
          <div className="text-sm text-gray-600">إجمالي المواعيد</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {appointments.filter(apt => apt.status === 'completed').length}
          </div>
          <div className="text-sm text-gray-600">مكتملة</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {appointments.filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed').length}
          </div>
          <div className="text-sm text-gray-600">قادمة</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">
            {appointments.filter(apt => apt.status === 'cancelled').length}
          </div>
          <div className="text-sm text-gray-600">ملغية</div>
        </div>
      </div>

      {/* المحتوى */}
      {currentViewMode === 'cards' ? renderCardsView() : renderTableView()}

      {/* التنقل بين الصفحات */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              الصفحة {currentPage} من {totalPages}
            </span>
            <span className="text-sm text-gray-500">
              ({sortedAppointments.length} موعد إجمالي)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 text-sm rounded-lg transition-colors ${currentPage === pageNum
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* رسالة فارغة */}
      {appointments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مواعيد</h3>
          <p className="text-gray-500">لا توجد مواعيد متاحة حالياً</p>
        </div>
      )}
    </div>
  );
};