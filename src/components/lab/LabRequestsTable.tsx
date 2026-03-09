import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Stethoscope,
  User,
  Calendar,
  FileText,
  FlipVertical,
  Truck,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LabRequest {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  testType: string;
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'emergency';
  status: 'pending' | 'waiting_for_representative' | 'representative_dispatched' | 'in_progress' | 'in-progress' | 'completed' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled' | 'rejected' | 'modification_requested';
  createdAt: string;
  expectedDelivery: string;
  sampleCollected: boolean;
  price?: number;
  paymentStatus?: 'paid' | 'unpaid' | 'partial';
  labName?: string;
  delegateName?: string;
}

interface LabRequestsTableProps {
  requests: LabRequest[];
  onViewDetails?: (id: string) => void;
  onUpdateStatus?: (id: string, status: LabRequest['status'], updates?: any) => void;
  onDelete?: (id: string) => void;
  onPaymentStatusChange?: (id: string, status: 'paid' | 'unpaid' | 'partial') => void;
  onRating?: (id: string, rating: number) => void;
  onAddExpense?: (request: LabRequest) => void;
  className?: string;
}

// Status Configuration
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return {
        icon: Clock,
        label: 'في انتظار الموافقة',
        className: 'bg-amber-100 text-amber-800 border-amber-200'
      };
    case 'waiting_for_representative':
      return {
        icon: User,
        label: 'بانتظار المندوب',
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      };
    case 'representative_dispatched':
      return {
        icon: Truck,
        label: 'تم إرسال المندوب',
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      };
    case 'in_progress':
    case 'in-progress': // Backward compatibility
      return {
        icon: Stethoscope,
        label: 'قيد العمل',
        className: 'bg-blue-100 text-blue-800 border-blue-200'
      };
    case 'completed':
      return {
        icon: CheckCircle,
        label: 'مكتمل',
        className: 'bg-green-100 text-green-800 border-green-200'
      };
    case 'out_for_delivery':
    case 'ready_for_delivery':
      return {
        icon: Truck,
        label: 'جاهز للتوصيل',
        className: 'bg-indigo-100 text-indigo-800 border-indigo-200'
      };
    case 'delivered':
      return {
        icon: CheckCircle,
        label: 'تم التوصيل',
        className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      };
    case 'ready_for_pickup':
      return {
        icon: Truck,
        label: 'جاهز للاستلام',
        className: 'bg-purple-100 text-purple-800 border-purple-200'
      };
    case 'collected':
      return {
        icon: CheckCircle,
        label: 'تم الاستلام',
        className: 'bg-teal-100 text-teal-800 border-teal-200'
      };
    case 'in_lab':
      return {
        icon: Stethoscope,
        label: 'في المختبر',
        className: 'bg-pink-100 text-pink-800 border-pink-200'
      };
    case 'returned':
      return {
        icon: FlipVertical,
        label: 'طلب اعادة',
        className: 'bg-rose-100 text-rose-800 border-rose-200'
      };
    case 'modification_requested':
      return {
        icon: AlertTriangle, // Assuming AlertTriangle is imported or will be
        label: 'طلب تعديل',
        className: 'bg-orange-100 text-orange-800 border-orange-200'
      };
    case 'cancelled':
    case 'rejected':
      return {
        icon: XCircle,
        label: 'ملغي / مرفوض',
        className: 'bg-red-100 text-red-800 border-red-200'
      };
    default:
      return {
        icon: Clock,
        label: 'غير معروف',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      };
  }
};

const getPriorityColor = (priority: LabRequest['priority']) => {
  switch (priority) {
    case 'emergency':
      return 'text-red-600 bg-red-100';
    case 'urgent':
      return 'text-orange-600 bg-orange-100';
    case 'normal':
      return 'text-gray-600 bg-gray-100';
  }
};

export const LabRequestsTable: React.FC<LabRequestsTableProps> = ({
  requests,
  onViewDetails,
  onUpdateStatus,
  onDelete,
  onPaymentStatusChange,
  onRating,
  onAddExpense,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<LabRequest['status'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<LabRequest['priority'] | 'all'>('all');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdownId && !(event.target as Element).closest('.action-menu-container')) {
        setActiveDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdownId]);

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.testType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(filteredRequests.map(r => r.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (id: string) => {
    setSelectedRequests(prev =>
      prev.includes(id)
        ? prev.filter(r => r !== id)
        : [...prev, id]
    );
  };

  const getActionMenuItems = (request: LabRequest) => {
    const items = [
      {
        icon: Eye,
        label: 'عرض التفاصيل',
        onClick: () => onViewDetails?.(request.id)
      }
    ];

    if (request.status === 'pending') {
      items.push({
        icon: Edit,
        label: 'بدء العمل',
        onClick: () => onUpdateStatus?.(request.id, 'in-progress')
      });
    }

    if (request.status === 'in-progress') {
      items.push({
        icon: CheckCircle,
        label: 'إكمال',
        onClick: () => onUpdateStatus?.(request.id, 'completed')
      });
    }

    if (request.status === 'returned' || request.status === 'modification_requested') {
      items.push({
        icon: FlipVertical,
        label: 'إعادة إرسال',
        onClick: () => onUpdateStatus?.(request.id, 'pending')
      });
    }

    if (request.status !== 'completed') {
      items.push({
        icon: Trash2,
        label: 'حذف',
        onClick: () => onDelete?.(request.id)
      });
    }

    return items;
  };

  return (
    <div className={cn('bg-white rounded-xl shadow-md', className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">إدارة حالات المختبر (Case Management)</h2>
            <p className="text-sm text-gray-600 mt-1">
              إجمالي {filteredRequests.length} طلب
              {selectedRequests.length > 0 && ` (تم تحديد ${selectedRequests.length} طلب)`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 sm:space-x-reverse">
            <button className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
              <Download className="w-4 h-4" />
              <span>تصدير</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4 lg:space-x-reverse">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="البحث عن طلب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as LabRequest['status'] | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">في الانتظار</option>
            <option value="in-progress">قيد التنفيذ</option>
            <option value="completed">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as LabRequest['priority'] | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">جميع الأولويات</option>
            <option value="emergency">طارئ</option>
            <option value="urgent">عاجل</option>
            <option value="normal">عادي</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-visible overflow-x-auto min-h-[400px]">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px]">
                {/* Actions Header */}
                الإجراءات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المريض
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نوع الفحص
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الأولوية
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التاريخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المختبر
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التكلفة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الدفع
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((req) => {
              const statusConfig = getStatusConfig(req.status);
              const StatusIcon = statusConfig.icon;

              const isLate =
                req.status !== 'completed' &&
                req.status !== 'delivered' &&
                req.status !== 'returned' &&
                req.status !== 'cancelled' &&
                req.expectedDelivery &&
                req.expectedDelivery < new Date().toISOString().split('T')[0];

              return (
                <tr
                  key={req.id}
                  className={cn(
                    "group border-b border-gray-100 last:border-0 hover:bg-gray-50/80 transition-all",
                    isLate ? "bg-red-50/30 hover:bg-red-50/60" : ""
                  )}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {/* Direct View Action */}
                      <button
                        onClick={() => onViewDetails?.(req.id)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 p-1.5 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <div className="relative action-menu-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdownId(activeDropdownId === req.id ? null : req.id);
                          }}
                          className={cn(
                            "text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors",
                            activeDropdownId === req.id ? "bg-gray-100 text-gray-900" : ""
                          )}
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeDropdownId === req.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                            <div className="py-1" role="menu">
                              <button
                                onClick={() => onViewDetails?.(req.id)}
                                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                عرض التفاصيل
                              </button>



                              {req.status === 'in-progress' && (
                                <button
                                  onClick={() => onUpdateStatus?.(req.id, 'completed')}
                                  className="w-full text-right px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  إكمال
                                </button>
                              )}

                              {req.status === 'out_for_delivery' && (
                                <button
                                  onClick={() => {
                                    if (confirm('هل استلمت الطلب؟')) {
                                      onUpdateStatus?.(req.id, 'delivered');
                                    }
                                  }}
                                  className="w-full text-right px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  تأكيد الاستلام
                                </button>
                              )}

                              {/* Request Modification */}
                              {(req.status === 'completed' || req.status === 'delivered') && (
                                <button
                                  onClick={() => {
                                    const reason = prompt('يرجى ذكر سبب التعديل:');
                                    if (reason) {
                                      onUpdateStatus?.(req.id, 'modification_requested');
                                    }
                                  }}
                                  className="w-full text-right px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                  طلب تعديل
                                </button>
                              )}

                              {/* Request Return - Only after delivery */}
                              {req.status === 'delivered' && (
                                <button
                                  onClick={() => {
                                    const reason = prompt('سبب الإرجاع:');
                                    if (reason) {
                                      onUpdateStatus?.(req.id, 'returned');
                                    }
                                  }}
                                  className="w-full text-right px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                >
                                  <FlipVertical className="w-4 h-4" />
                                  إرجاع للمختبر
                                </button>
                              )}

                              {/* Rating Button - Finalize and rate for delivered orders */}
                              {req.status === 'delivered' && onRating && (
                                <button
                                  onClick={() => {
                                    const ratingStr = prompt('قيّم الخدمة من 1 إلى 5:');
                                    if (ratingStr) {
                                      const rating = parseInt(ratingStr);
                                      if (rating >= 1 && rating <= 5) {
                                        onRating(req.id, rating);
                                        onUpdateStatus?.(req.id, 'completed');
                                      } else {
                                        alert('يرجى إدخال رقم من 1 إلى 5');
                                      }
                                    }
                                  }}
                                  className="w-full text-right px-4 py-2 text-sm text-yellow-600 hover:bg-yellow-50 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  إنهاء وتقييم الخدمة
                                </button>
                              )}

                              {req.status === 'pending' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.(req.id);
                                  }}
                                  className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  حذف
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* Patient Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs ring-2 ring-white shadow-sm">
                        {req.patientName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm">{req.patientName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {req.doctorName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Test Type */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{req.testType}</span>
                      {req.labName && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 truncate max-w-[100px]">
                          {req.labName}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Priority */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getPriorityColor(req.priority)
                    )}>
                      {req.priority === 'emergency' && 'طارئ'}
                      {req.priority === 'urgent' && 'عاجل'}
                      {req.priority === 'high' && 'عالي'}
                      {req.priority === 'normal' && 'عادي'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      'inline-flex items-center space-x-1 space-x-reverse px-2 py-1 rounded-full text-xs font-medium border',
                      statusConfig.className
                    )}>
                      <StatusIcon className="w-3 h-3" />
                      <span>{statusConfig.label}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 ml-1" />
                      <div>
                        <div>{req.createdAt}</div>
                        <div className="text-xs text-gray-500">متوقع: {req.expectedDelivery}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {req.labName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {req.price ? `${req.price.toLocaleString()} د.ع` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {/* Payment Status with Action Button */}
                      {req.paymentStatus === 'paid' ? (
                        <>
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            ✓ تم التسديد
                          </span>
                          {onAddExpense && (
                            <button
                              onClick={() => onAddExpense(req)}
                              className="px-2 py-1 text-xs font-medium rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                            >
                              + إضافة للمصروفات
                            </button>
                          )}
                        </>
                      ) : req.status === 'delivered' ? (
                        <button
                          onClick={() => onPaymentStatusChange?.(req.id, 'paid')}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                        >
                          تسديد
                        </button>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600">
                          غير مسدد
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
            }
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد طلبات</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
              ? 'لم يتم العثور على طلبات تطابق معايير البحث المحددة.'
              : 'لا توجد طلبات مختبر حالياً.'}
          </p>
        </div>
      )}

      {/* Footer */}
      {filteredRequests.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              عرض {filteredRequests.length} من أصل {requests.length} طلب
            </div>
            <div className="flex space-x-2 space-x-reverse">
              {selectedRequests.length > 0 && (
                <button
                  onClick={() => setSelectedRequests([])}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  إلغاء التحديد
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};