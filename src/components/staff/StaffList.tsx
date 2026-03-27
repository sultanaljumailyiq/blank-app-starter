import React, { useState, useMemo } from 'react';
import {
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Users,
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Coffee,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  UserCheck,
  CreditCard,
  Star,
  Archive
} from 'lucide-react';
import type { Employee } from '../../types/staff';
import { formatNumericDate } from '../../lib/date';

interface StaffListProps {
  employees: Employee[];
  onViewProfile?: (employee: Employee) => void;
  onEditEmployee?: (employee: Employee) => void;
}

type SortField = 'name' | 'department' | 'position' | 'hireDate' | 'salary' | 'status';
type SortDirection = 'asc' | 'desc';

export const StaffList: React.FC<StaffListProps> = ({ employees, onViewProfile, onEditEmployee }) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

  // ترتيب الموظفين
  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.personalInfo.fullName;
          bValue = b.personalInfo.fullName;
          break;
        case 'department':
          aValue = a.workInfo.department.name;
          bValue = b.workInfo.department.name;
          break;
        case 'position':
          aValue = a.workInfo.position;
          bValue = b.workInfo.position;
          break;
        case 'hireDate':
          aValue = new Date(a.workInfo.hireDate);
          bValue = new Date(b.workInfo.hireDate);
          break;
        case 'salary':
          aValue = a.payroll.netSalary;
          bValue = b.payroll.netSalary;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.personalInfo.fullName;
          bValue = b.personalInfo.fullName;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [employees, sortField, sortDirection]);

  // تغيير الترتيب
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // رمز الحالة
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'on_leave':
        return <Coffee className="w-4 h-4 text-orange-500" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'terminated':
        return <Archive className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  // نص الحالة
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'inactive':
        return 'غير نشط';
      case 'on_leave':
        return 'في إجازة';
      case 'suspended':
        return 'موقوف';
      case 'terminated':
        return 'منتهي الخدمة';
      default:
        return 'غير محدد';
    }
  };

  // لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'on_leave':
        return 'bg-orange-100 text-orange-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'terminated':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // تحديد/إلغاء تحديد موظف
  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // تحديد/إلغاء تحديد جميع الموظفين
  const toggleAllSelection = () => {
    setSelectedEmployees(
      selectedEmployees.length === employees.length
        ? []
        : employees.map(emp => emp.id)
    );
  };

  // عرض البطاقات
  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedEmployees.map((employee) => (
        <div
          key={employee.id}
          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-indigo-300"
        >
          {/* رأس البطاقة */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{employee.personalInfo.fullName}</h3>
                <p className="text-sm text-gray-600">{employee.employeeNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-reverse space-x-2">
              {getStatusIcon(employee.status)}
              <div className="relative">
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>

          {/* تفاصيل الوظيفة */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Building2 className="w-4 h-4 ml-2" />
              {employee.workInfo.department.name}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 ml-2" />
              {employee.workInfo.position}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 ml-2" />
              بدء العمل: {formatNumericDate(employee.workInfo.hireDate)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 ml-2" />
              {employee.payroll.netSalary.toLocaleString()} د.ع
            </div>
          </div>

          {/* معلومات الاتصال */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 ml-2" />
              {employee.personalInfo.phone}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 ml-2" />
              {employee.personalInfo.email}
            </div>
          </div>

          {/* الحالة */}
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
              {getStatusText(employee.status)}
            </span>
            {employee.evaluations.length > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Star className="w-4 h-4 ml-1 text-yellow-400" />
                {employee.evaluations[employee.evaluations.length - 1].overallScore}/5
              </div>
            )}
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex space-x-reverse space-x-2">
            <button
              onClick={() => onViewProfile?.(employee)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Eye className="w-4 h-4" />
              عرض
            </button>
            <button
              onClick={() => onEditEmployee?.(employee)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Edit className="w-4 h-4" />
              تعديل
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // عرض الجدول
  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input
                type="checkbox"
                checked={selectedEmployees.length === employees.length}
                onChange={toggleAllSelection}
                className="rounded border-gray-300 focus:ring-indigo-500"
              />
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                الموظف
                {sortField === 'name' && (
                  sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </div>
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('department')}
            >
              <div className="flex items-center">
                القسم
                {sortField === 'department' && (
                  sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </div>
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('position')}
            >
              <div className="flex items-center">
                المنصب
                {sortField === 'position' && (
                  sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الاتصال
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('hireDate')}
            >
              <div className="flex items-center">
                تاريخ التوظيف
                {sortField === 'hireDate' && (
                  sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </div>
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('salary')}
            >
              <div className="flex items-center">
                الراتب
                {sortField === 'salary' && (
                  sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </div>
            </th>
            <th
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center">
                الحالة
                {sortField === 'status' && (
                  sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                )}
              </div>
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              الإجراءات
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedEmployees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(employee.id)}
                  onChange={() => toggleEmployeeSelection(employee.id)}
                  className="rounded border-gray-300 focus:ring-indigo-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="mr-4">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.personalInfo.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {employee.employeeNumber}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.workInfo.department.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.workInfo.position}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="space-y-1">
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 ml-1 text-gray-400" />
                    {employee.personalInfo.phone}
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 ml-1 text-gray-400" />
                    {employee.personalInfo.email}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatNumericDate(employee.workInfo.hireDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {employee.payroll.netSalary.toLocaleString()} د.ع
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                  {getStatusIcon(employee.status)}
                  <span className="mr-1">{getStatusText(employee.status)}</span>
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-reverse space-x-2">
                  <button
                    onClick={() => onViewProfile?.(employee)}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                    title="عرض الملف الشخصي"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditEmployee?.(employee)}
                    className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                    title="تعديل البيانات"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (employees.length === 0) {
    return (
      <div className="text-center py-20">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد نتائج</h3>
        <p className="text-gray-600">لم يتم العثور على موظفين يطابقون معايير البحث.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* شريط الإجراءات */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-reverse space-x-4">
          {/* أزرار عرض */}
          <div className="flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'cards'
                ? 'bg-indigo-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              بطاقات
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'table'
                ? 'bg-indigo-500 text-white'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              جدول
            </button>
          </div>

          {/* ترتيب سريع */}
          <div className="flex items-center space-x-reverse space-x-2">
            <span className="text-sm text-gray-600">ترتيب حسب:</span>
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-');
                setSortField(field as SortField);
                setSortDirection(direction as SortDirection);
              }}
              className="text-sm border border-gray-200 rounded-md px-3 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="name-asc">الاسم (أ-ي)</option>
              <option value="name-desc">الاسم (ي-أ)</option>
              <option value="department-asc">القسم (أ-ي)</option>
              <option value="department-desc">القسم (ي-أ)</option>
              <option value="position-asc">المنصب (أ-ي)</option>
              <option value="position-desc">المنصب (ي-أ)</option>
              <option value="hireDate-asc">تاريخ التوظيف (الأقدم)</option>
              <option value="hireDate-desc">تاريخ التوظيف (الأحدث)</option>
              <option value="salary-asc">الراتب (الأقل)</option>
              <option value="salary-desc">الراتب (الأعلى)</option>
            </select>
          </div>
        </div>

        {/* إجراءات محددة */}
        {selectedEmployees.length > 0 && (
          <div className="flex items-center space-x-reverse space-x-2">
            <span className="text-sm text-gray-600">
              تم تحديد {selectedEmployees.length} موظف
            </span>
            <button className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100">
              إجراءات متعددة
            </button>
          </div>
        )}
      </div>

      {/* المحتوى */}
      {viewMode === 'cards' ? renderCardView() : renderTableView()}
    </div>
  );
};