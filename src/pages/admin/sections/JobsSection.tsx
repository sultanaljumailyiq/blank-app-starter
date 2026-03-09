import React, { useState } from 'react';
import { AdminTable, Column } from '../../../components/admin/AdminTable';
import { AdminModal, FormModal, ConfirmDeleteModal } from '../../../components/admin/AdminModal';
import { BentoStatCard } from '../../../components/dashboard/BentoStatCard';
import {
  Briefcase,
  Star,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Eye,
  MapPin,
  DollarSign,
  Building,
  Award,
  Target
} from 'lucide-react';
import { useAdminJobs } from '../../../hooks/useAdminJobs';

export const JobsSection: React.FC = () => {
  const { jobs, stats, loading, addJob, deleteJob } = useAdminJobs();

  const [showJobModal, setShowJobModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('featured');

  // Filtered Jobs
  const featuredJobsList = jobs.filter(j => j.isFeatured || j.sponsorshipLevel === 'premium');
  const regularJobsList = jobs.filter(j => !j.isFeatured && j.sponsorshipLevel !== 'premium');

  // أعمدة جدول الوظائف المميزة
  // Column definitions removed as we are moving to Grid View
  /* const jobColumns: Column[] = ... */

  // نموذج بيانات الوظيفة
  const jobFormFields = [
    {
      name: 'title',
      label: 'عنوان الوظيفة',
      type: 'text' as const,
      required: true,
      placeholder: 'مثال: طبيب أسنان عام'
    },
    {
      name: 'companyName',
      label: 'اسم الشركة/العيادة',
      type: 'text' as const,
      required: true,
      placeholder: 'مثال: عيادة النور الطبية'
    },
    {
      name: 'governorate',
      label: 'المحافظة',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'بغداد', label: 'بغداد' },
        { value: 'أربيل', label: 'أربيل' },
        { value: 'البصرة', label: 'البصرة' },
        { value: 'النجف', label: 'النجف' },
        { value: 'كربلاء', label: 'كربلاء' },
        { value: 'الموصل', label: 'الموصل' }
      ]
    },
    {
      name: 'district',
      label: 'المنطقة',
      type: 'text' as const,
      required: true,
      placeholder: 'مثال: الكرادة'
    },
    {
      name: 'category',
      label: 'التخصص',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'طبيب أسنان عام', label: 'طبيب أسنان عام' },
        { value: 'أخصائي تقويم', label: 'أخصائي تقويم' },
        { value: 'أخصائي جراحة الفم', label: 'أخصائي جراحة الفم' },
        { value: 'مساعد طبيب أسنان', label: 'مساعد طبيب أسنان' },
        { value: 'فني مختبر', label: 'فني مختبر' }
      ]
    },
    {
      name: 'type',
      label: 'نوع الدوام',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'دوام كامل', label: 'دوام كامل' },
        { value: 'دوام جزئي', label: 'دوام جزئي' },
        { value: 'مؤقت', label: 'مؤقت' },
        { value: 'تدريب', label: 'تدريب' }
      ]
    },
    {
      name: 'salary',
      label: 'الراتب',
      type: 'text' as const,
      required: true,
      placeholder: 'مثال: 2500000-3500000'
    },
    {
      name: 'experience',
      label: 'الخبرة المطلوبة',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'حديث التخرج', label: 'حديث التخرج' },
        { value: '1-2 سنة', label: '1-2 سنة' },
        { value: '3-5 سنوات', label: '3-5 سنوات' },
        { value: '5+ سنوات', label: '5+ سنوات' }
      ]
    },
    {
      name: 'description',
      label: 'وصف الوظيفة',
      type: 'textarea' as const,
      required: true,
      placeholder: 'وصف مختصر للوظيفة والمهام المطلوبة'
    },
    {
      name: 'contactEmail',
      label: 'البريد الإلكتروني للتواصل',
      type: 'email' as const,
      required: true,
      placeholder: 'hr@example.com'
    },
    {
      name: 'contactPhone',
      label: 'رقم الهاتف',
      type: 'text' as const,
      required: true,
      placeholder: '07901234567'
    },
    {
      name: 'sponsorshipLevel',
      label: 'مستوى الرعاية',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'premium', label: 'بريميوم (500,000 د.ع)' },
        { value: 'gold', label: 'ذهبي (350,000 د.ع)' },
        { value: 'silver', label: 'فضي (200,000 د.ع)' }
      ]
    }
  ];

  const handleSubmit = (formData: any) => {
    addJob(formData);
    setShowJobModal(false);
    setSelectedJob(null);
  };

  const handleDelete = () => {
    if (selectedJob) deleteJob(selectedJob.id);
    setShowDeleteModal(false);
    setSelectedJob(null);
  };

  if (loading || !stats) return <div className="p-8 text-center text-gray-500">جاري تحميل بيانات الوظائف...</div>;

  // رندر الإحصائيات التفاعلية
  const renderStatistics = () => (
    <div className="space-y-8">
      {/* إحصائيات التوزيع */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* توزيع الفئات */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            توزيع الوظائف حسب التخصص
          </h3>
          <div className="space-y-4">
            {stats.topCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-purple-500' : index === 1 ? 'bg-blue-500' : index === 2 ? 'bg-green-500' : 'bg-orange-500'}`} />
                  <span className="text-sm font-medium text-gray-700">{category.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{category.count}</span>
                  <span className="text-xs text-gray-500">({category.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* توزيع المحافظات */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            توزيع الوظائف حسب المحافظة
          </h3>
          <div className="space-y-4">
            {stats.topGovernorates.map((gov, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : index === 2 ? 'bg-orange-500' : 'bg-purple-500'}`} />
                  <span className="text-sm font-medium text-gray-700">{gov.governorate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{gov.count}</span>
                  <span className="text-xs text-gray-500">({gov.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* الاتجاهات الشهرية */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          الاتجاهات الشهرية للوظائف والتقديمات
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.monthlyTrends.map((month, index) => (
            <div key={index} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="text-xs text-gray-500 mb-2">
                {new Date(month.month).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long' })}
              </div>
              <div className="space-y-2">
                <div className="text-lg font-bold text-purple-600">{month.jobs}</div>
                <div className="text-xs text-gray-600">وظيفة جديدة</div>
                <div className="text-lg font-bold text-blue-600">{month.applications}</div>
                <div className="text-xs text-gray-600">تقديم</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* الإحصائيات السريعة */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        <BentoStatCard
          title="إجمالي الوظائف"
          value={stats.totalJobs}
          icon={Briefcase}
          color="purple"
          trend="neutral"
          trendValue="نشطة"
          delay={0}
        />
        <BentoStatCard
          title="الوظائف المميزة"
          value={stats.featuredJobs}
          icon={Star}
          color="blue"
          trend="neutral"
          trendValue="مدفوعة"
          delay={100}
        />
        <BentoStatCard
          title="إجمالي المتقدمين"
          value={stats.totalApplications}
          icon={Users}
          color="green"
          trend="neutral"
          trendValue="طلب"
          delay={200}
        />
        <BentoStatCard
          title="معدل التوظيف"
          value={`${stats.avgApplicationsPerJob}%`}
          icon={TrendingUp}
          color="orange"
          trend="neutral"
          trendValue="لكل وظيفة"
          delay={300}
        />
      </div>

      {/* التبويبات */}
      <div className="bg-white p-1 rounded-2xl border border-gray-200 inline-flex">
        {[
          { key: 'featured', label: 'الوظائف المميزة', icon: <Star className="h-4 w-4" /> },
          { key: 'regular', label: 'الوظائف العادية', icon: <Briefcase className="h-4 w-4" /> },
          { key: 'statistics', label: 'الإحصائيات', icon: <TrendingUp className="h-4 w-4" /> }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex items-center gap-2 py-2.5 px-6 rounded-xl font-medium text-sm transition-all duration-200
              ${activeTab === tab.key
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {['featured', 'regular'].includes(activeTab) && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {activeTab === 'featured' ? <Star className="h-5 w-5 text-amber-500" /> : <Briefcase className="h-5 w-5 text-blue-500" />}
                {activeTab === 'featured' ? 'الوظائف المميزة' : 'الوظائف العادية'}
              </h3>
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setShowJobModal(true);
                }}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4" />
                إضافة وظيفة
              </button>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {(activeTab === 'featured' ? featuredJobsList : regularJobsList).map(job => (
                <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all relative group overflow-hidden">
                  {/* Sponsorship Badge */}
                  {job.sponsorshipLevel === 'premium' && (
                    <div className="absolute top-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl">
                      PREMIUM
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold bg-gradient-to-br ${activeTab === 'featured' ? 'from-amber-100 to-orange-100 text-amber-600' : 'from-blue-50 to-indigo-50 text-blue-600'}`}>
                        {job.companyName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 line-clamp-1">{job.title}</h4>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {job.companyName}
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu (Hover) */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setSelectedJob(job); setShowJobModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setSelectedJob(job); setShowDeleteModal(true); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Details Pills */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-medium flex items-center gap-1 border border-gray-100">
                      <MapPin className="w-3 h-3" />
                      {job.governorate}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium flex items-center gap-1 border border-blue-100">
                      <DollarSign className="w-3 h-3" />
                      {job.salary}
                    </span>
                  </div>

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1" title="المشاهدات">
                        <Eye className="w-4 h-4" /> {job.viewsCount}
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 font-medium" title="المتقدمين">
                        <Users className="w-4 h-4" /> {job.applicationsCount}
                      </span>
                    </div>

                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${job.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {job.status === 'active' ? 'نشطة' : 'منتهية'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(activeTab === 'featured' ? featuredJobsList : regularJobsList).length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد وظائف {activeTab === 'featured' ? 'مميزة' : 'عادية'} حالياً</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'statistics' && renderStatistics()}
      </div>


      {/* نافذة إضافة/تعديل الوظيفة */}
      <FormModal
        isOpen={showJobModal}
        onClose={() => {
          setShowJobModal(false);
          setSelectedJob(null);
        }}
        title={selectedJob ? 'تعديل الوظيفة' : 'إضافة وظيفة جديدة'}
        fields={jobFormFields}
        onSubmit={handleSubmit}
      />

      {/* نافذة تأكيد الحذف */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedJob(null);
        }}
        onConfirm={handleDelete}
        title="تأكيد الحذف"
        message="هل أنت متأكد من أنك تريد حذف هذه الوظيفة؟"
        itemName={selectedJob?.title}
      />
    </div >
  );
};