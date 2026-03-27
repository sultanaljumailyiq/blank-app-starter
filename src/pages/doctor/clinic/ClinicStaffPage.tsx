import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Clock,
  Award,
  TrendingUp,
  Filter,
  User,
  UserCheck,
  UserX,
  Edit,
  FileText,
  X,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { formatDate } from '../../../lib/utils';
import { BentoStatCard } from '../../../components/dashboard/BentoStatCard';
import { useStaff, StaffMember } from '../../../hooks/useStaff';
import { StaffFormModal } from '../components/StaffFormModal';
import { useAuth } from '../../../contexts/AuthContext';
import { StaffProfileContent } from './components/StaffProfileContent';
import { ActivityLogModal } from '../components/ActivityLogModal';

interface ClinicStaffPageProps {
  clinicId: string;
}

export const ClinicStaffPage: React.FC<ClinicStaffPageProps> = ({ clinicId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [viewingStaffProfile, setViewingStaffProfile] = useState<StaffMember | null>(null);
  // Unified modal state
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showActivityLogModal, setShowActivityLogModal] = useState(false);

  // Supabase Hook
  const { staff, loading, addStaff, updateStaff, deleteStaff, sendInvitation, cancelInvitation, unlinkStaff } = useStaff(clinicId);
  const { user } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [clinicOwnerId, setClinicOwnerId] = useState<string | null>(null);

  useEffect(() => {
    const checkOwner = async () => {
      if (!clinicId || !user?.id) return;
      try {
        const { data, error } = await supabase
          .from('clinics')
          .select('owner_id')
          .eq('id', clinicId)
          .single();
        if (error) throw error;
        const ownerId = data?.owner_id;
        setClinicOwnerId(ownerId);
        setIsOwner(ownerId === user.id);
      } catch (err) {
        console.error("Error checking clinic owner:", err);
        setIsOwner(false);
      }
    };
    checkOwner();
  }, [clinicId, user?.id]);
  const currentStaffPermissions = staff.find(s => s.email === user?.email)?.permissions;


  // Mock stats calculation (Client-side for now)
  const stats = {
    total: staff.length,
    active: staff.filter(s => s.status === 'active').length,
    doctors: staff.filter(s => s.position === 'doctor').length,
    assistants: staff.filter(s => s.position === 'assistant').length,
    nurses: staff.filter(s => s.position === 'nurse').length,
    admin: staff.filter(s => s.position === 'admin').length,
    avgRating: staff.reduce((acc, curr) => acc + curr.performance.rating, 0) / (staff.length || 1),
    avgAttendance: 95, // Mock or calculate if data exists
    totalSalary: staff.reduce((acc, curr) => acc + curr.salary, 0)
  };

  // Filter Logic
  const filteredStaff = staff.filter(member => {
    const matchesSearch = searchTerm === '' ||
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPosition = selectedPosition === 'all' || member.position === selectedPosition;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;

    return matchesSearch && matchesPosition && matchesStatus;
  });

  // Helpers
  const getPositionLabel = (position: string) => {
    switch (position) {
      case 'doctor': return 'طبيب';
      case 'assistant': return 'مساعد';
      case 'nurse': return 'ممرض';
      case 'receptionist': return 'مستقبل';
      case 'admin': return 'إداري';
      case 'technician': return 'فني';
      default: return position;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'on_leave': return 'text-yellow-600 bg-yellow-100';
      case 'suspended': return 'text-red-600 bg-red-100';
      case 'terminated': return 'text-gray-600 bg-gray-100';
      case 'pending': return 'text-amber-700 bg-amber-100 border border-amber-300 border-dashed';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'on_leave': return 'إجازة';
      case 'suspended': return 'موقوف';
      case 'terminated': return 'منتهي الخدمة';
      case 'pending': return '⏳ في الانتظار';
      default: return 'غير محدد';
    }
  };

  const getPositionIcon = (position: string) => {
    switch (position) {
      case 'doctor': return <User className="w-5 h-5 text-blue-600" />;
      case 'assistant': return <UserCheck className="w-5 h-5 text-green-600" />;
      case 'nurse': return <User className="w-5 h-5 text-pink-600" />;
      case 'receptionist': return <UserX className="w-5 h-5 text-purple-600" />;
      case 'admin': return <Users className="w-5 h-5 text-indigo-600" />;
      case 'technician': return <UserCheck className="w-5 h-5 text-orange-600" />;
      default: return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  // Handlers
  const handleEditStaff = (staffMember: StaffMember) => {
    setEditingStaff(staffMember);
    setShowModal(true);
  };

  const handleSave = async (data: Partial<StaffMember>) => {
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, data);
      } else {
        // Add default values for new staff
        await addStaff({
          ...data,
          // @ts-ignore
          clinicId,
          hireDate: new Date().toISOString().split('T')[0],
          address: 'العنوان غير محدد',
          qualifications: [],
          certifications: [],
          workSchedule: data.workSchedule || {
            days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
            startTime: '09:00',
            endTime: '17:00',
            breaks: []
          },
          attendance: { present: 0, absent: 0, late: 0, overtime: 0 },
          performance: {
            rating: 5,
            lastReview: new Date().toISOString().split('T')[0],
            achievements: [],
            goals: []
          },
          skills: [],
          languages: ['العربية'],
          notes: '',
        } as any);
      }
      setShowModal(false);
      setEditingStaff(null);
    } catch (error) {
      console.error("Error saving staff:", error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    }
  };

  const handleViewProfile = (staffMember: any) => {
    setViewingStaffProfile(staffMember);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setViewingStaffProfile(null);
  };

  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoStatCard
          title="إجمالي الموظفين"
          value={stats.total}
          icon={Users}
          color="blue"
          trend="up"
          trendValue="نشط"
          delay={100}
        />
        <BentoStatCard
          title="الأطباء"
          value={stats.doctors}
          icon={User}
          color="green"
          delay={200}
        />
        <BentoStatCard
          title="متوسط التقييم"
          value={`${stats.avgRating.toFixed(1)}/5`}
          icon={Star}
          color="purple"
          trend="up"
          trendValue="2.1%"
          delay={300}
        />
        <BentoStatCard
          title="معدل الحضور"
          value={`${stats.avgAttendance}%`}
          icon={Clock}
          color="orange"
          delay={400}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoStatCard
          title="المساعدين"
          value={stats.assistants}
          icon={UserCheck}
          color="emerald"
          delay={500}
        />
        <BentoStatCard
          title="الممرضين"
          value={stats.nurses}
          icon={User}
          color="red"
          delay={600}
        />
        <BentoStatCard
          title="الإداريين"
          value={stats.admin}
          icon={Users}
          color="indigo"
          delay={700}
        />
        <BentoStatCard
          title="الراتب الإجمالي"
          value={`${(stats.totalSalary / 1000000).toFixed(1)}م`}
          icon={TrendingUp}
          color="amber"
          delay={800}
        />
      </div>

      {/* Controls */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 flex-1">

              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="البحث في الموظفين..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Position Filter */}
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع المناصب</option>
                <option value="doctor">أطباء</option>
                <option value="assistant">مساعدين</option>
                <option value="nurse">ممرضين</option>
                <option value="receptionist">مستقبل</option>
                <option value="admin">إداريين</option>
                <option value="technician">فنيين</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="on_leave">إجازة</option>
                <option value="suspended">موقوف</option>
                <option value="terminated">منتهي الخدمة</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Activity Log Button */}
              {(isOwner || currentStaffPermissions?.activityLog) && (
                <button
                  onClick={() => setShowActivityLogModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <History className="w-4 h-4" />
                  <span className="text-sm font-medium">سجل النشاطات</span>
                </button>
              )}

              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  شبكة
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  قائمة
                </button>
              </div>

              {/* Add Button */}
              {(isOwner || currentStaffPermissions?.manageStaff) && (
                <button
                  onClick={() => {
                    setEditingStaff(null);
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">موظف جديد</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Staff Display */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">الموظفين ({filteredStaff.length})</h2>
            <div className="text-sm text-gray-600">
              يظهر {filteredStaff.length} من {staff.length} موظف
            </div>
          </div>

          {filteredStaff.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">لم يتم العثور على موظفين مطابقين للبحث</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all"
                >
                  {/* Staff Header */}
                  {/* Staff Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          {getPositionIcon(member.position)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.department}</p>
                        <p className="text-xs text-blue-600 font-medium">{getPositionLabel(member.position)}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                      {getStatusLabel(member.status)}
                    </div>
                    {/* Linked account badge below status */}
                    {member.isLinkedAccount && (
                      <span className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-1">
                        🔗 مربوط
                      </span>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{member.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>

                  {/* Work Info */}
                  <div className="space-y-2 mb-4">
                    <div className="text-sm text-gray-600">
                      <Calendar className="w-4 h-4 inline ml-1" />
                      تاريخ التوظيف: {formatDate(member.hireDate)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <Clock className="w-4 h-4 inline ml-1" />
                      المناوبة: {member.workSchedule.startTime} - {member.workSchedule.endTime}
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-900">
                        {member.performance.rating}/5
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      • {member.attendance.present} يوم عمل
                    </div>
                  </div>



                  {/* Skills Preview */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {member.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {member.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                          +{member.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons — context-aware for pending invitations */}
                  {member.status === 'pending' ? (
                    <div className="flex gap-2 mb-4">
                      {(isOwner || currentStaffPermissions?.manageStaff || member.authUserId === user?.id || member.userId === user?.id) && (
                        <button
                          onClick={() => handleEditStaff(member)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          تعديل
                        </button>
                      )}
                      {isOwner && member.authUserId !== clinicOwnerId && member.userId !== clinicOwnerId && (
                        <button
                          onClick={async () => {
                            if (confirm('هل أنت متأكد من إلغاء الدعوة؟')) {
                              await cancelInvitation(member.invitationId || member.id);
                            }
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                        >
                          <X className="w-4 h-4" />
                          إلغاء الدعوة
                        </button>
                      )}
                    </div>

                  ) : (
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => handleViewProfile(member)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      عرض الملف
                    </button>
                    {(isOwner || currentStaffPermissions?.manageStaff || member.authUserId === user?.id || member.userId === user?.id) && (
                      <button
                        onClick={() => handleEditStaff(member)}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        تعديل
                      </button>
                    )}
                    {(isOwner || currentStaffPermissions?.manageStaff) && member.authUserId !== clinicOwnerId && member.userId !== clinicOwnerId && (
                      <button
                        onClick={async () => {
                          if (confirm('هل أنت متأكد من حذف هذا الموظف نهائياً من طاقم العيادة؟')) {
                            await deleteStaff(member.id);
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStaff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      {getPositionIcon(member.position)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">
                        {member.department} • {getPositionLabel(member.position)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-left">
                      <div className="text-sm text-gray-600">
                        تقييم: {member.performance.rating}/5
                      </div>
                      <div className="text-sm text-gray-600">
                        أيام العمل: {member.attendance.present}
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(member.status)}`}>
                      {getStatusLabel(member.status)}
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {(member.salary || 0).toLocaleString()} د.ع
                      </div>
                      <div className="text-xs text-gray-600">
                        شهرياً
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4 text-center">
            <Award className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
            <p className="text-sm text-gray-600">موظفين نشطين</p>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}/5</div>
            <p className="text-sm text-gray-600">متوسط التقييم</p>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stats.avgAttendance}%</div>
            <p className="text-sm text-gray-600">معدل الحضور</p>
          </div>
        </Card>
      </div>

      {/* Modal عرض الملف الشخصي */}
      {showProfileModal && viewingStaffProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <StaffProfileContent
              staff={viewingStaffProfile}
              onClose={closeProfileModal}
              clinicId={clinicId}
            />
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      <ActivityLogModal
        isOpen={showActivityLogModal}
        onClose={() => setShowActivityLogModal(false)}
        clinicId={clinicId}
      />

      {/* Unified Staff Form Modal */}
      <StaffFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingStaff(null);
        }}
        initialData={editingStaff}
        onSave={handleSave}
        onInvite={sendInvitation}
        onCancelInvitation={cancelInvitation}
        onUnlink={unlinkStaff}
        clinicId={clinicId}
      />

    </div>
  );
};