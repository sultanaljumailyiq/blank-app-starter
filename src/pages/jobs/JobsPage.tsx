import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, Briefcase, Users, Plus, User, FileText,
  Eye, Bookmark, Menu, X, ChevronDown, Search, TrendingUp,
  MapPin, Star, Send, Inbox, Trash2
} from 'lucide-react';
import { useJobs, Job } from '../../hooks/useJobs';
import { JobFilterBar } from '../../components/Jobs/JobFilterBar';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../lib/utils';
import { BentoStatCard } from '../../components/dashboard/BentoStatCard';
import { PostJobModal } from '../../components/Jobs/PostJobModal';
import { JobSeekerProfileModal } from '../../components/Jobs/JobSeekerProfileModal';
import { JobDetailsModal } from '../../components/Jobs/JobDetailsModal';
import { OfferDetailsModal } from '../../components/Jobs/OfferDetailsModal';
import { JobApplicantsModal } from '../../components/Jobs/JobApplicantsModal';
import { useAuth } from '../../contexts/AuthContext';

interface JobFilters {
  searchTerm: string;
  governorate: string;
  district: string;
  category: string;
  type: string;
  experience: string;
}

export const JobsPage: React.FC<{ hideHeader?: boolean }> = ({ hideHeader }) => {
  const { jobs, stats, loading, fetchApplications, fetchJobSeekers } = useJobs();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedJobDetails, setSelectedJobDetails] = useState<any>(null);
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false);
  const navigate = useNavigate();

  const [filters, setFilters] = useState<JobFilters>({
    searchTerm: '',
    governorate: '',
    district: '',
    category: '',
    type: '',
    experience: ''
  });

  // Fetch applications when tab changes to requests
  useEffect(() => {
    if (activeTab === 'requests' && user) {
      // Need to expose fetchApplications from useJobs or call it here
      // Since useJobs abstraction is a bit simple, I'll assume fetchApplications returns promsie
      // But wait, I didn't export fetchApplications in standard RETURN of useJobs in previous step?
      // Ah, I did add it to return object.
      fetchApplications().then(apps => setApplications(apps || []));
    }
  }, [activeTab, user]);

  const menuItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'نظرة عامة', gradient: 'from-blue-500 to-blue-600' },
    { id: 'browse-jobs', icon: Briefcase, label: 'تصفح الوظائف', gradient: 'from-green-500 to-green-600' },
    { id: 'browse-doctors', icon: Users, label: 'تصفح الاختصاصات', gradient: 'from-teal-500 to-teal-600' },
    { id: 'my-career', icon: User, label: 'مركز مساري المهني', gradient: 'from-purple-500 to-purple-600' },
  ];

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = !filters.searchTerm ||
        job.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesGovernorate = !filters.governorate || job.governorate === filters.governorate;
      return matchesSearch && matchesGovernorate;
    });
  }, [jobs, filters]);

  const OverviewTab = () => {
    const [specialists, setSpecialists] = useState<any[]>([]);
    const [loadingSpecs, setLoadingSpecs] = useState(true);

    useEffect(() => {
      fetchJobSeekers().then(data => {
        setSpecialists(data || []);
        setLoadingSpecs(false);
      });
    }, []);

    const latestJobs = useMemo(() => {
      return [...jobs].sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()).slice(0, 6);
    }, [jobs]);

    return (
      <div className="space-y-10 animate-in fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BentoStatCard
            title="إجمالي الوظائف"
            value={stats.totalJobs}
            icon={Briefcase}
            color="blue"
            delay={100}
          />
          <BentoStatCard
            title="وظائف مفتوحة"
            value={stats.openJobs}
            icon={TrendingUp}
            color="green"
            trend="up"
            trendValue="نشط"
            delay={200}
          />
          <BentoStatCard
            title="وظائف مميزة"
            value={stats.featuredJobs}
            icon={Star}
            color="orange"
            delay={300}
          />
          <BentoStatCard
            title="المحافظات"
            value={stats.locationsCount}
            icon={MapPin}
            color="purple"
            delay={400}
          />
        </div>

        {/* Featured Jobs */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xl text-gray-900">الوظائف المميزة</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.filter(j => j.featured).slice(0, 4).map(job => (
              <JobCardItem key={job.id} job={job} />
            ))}
            {jobs.filter(j => j.featured).length === 0 && (
              <div className="col-span-full text-center py-8 bg-amber-50/50 rounded-xl border border-amber-100 border-dashed text-amber-700">
                لا توجد وظائف مميزة حالياً
              </div>
            )}
          </div>
        </div>

        {/* Latest Jobs (Horizontal Scroll) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xl text-gray-900">أحدث الوظائف المنشورة</h3>
            </div>
            <Button variant="ghost" onClick={() => setActiveTab('browse-jobs')} className="text-blue-600 hover:bg-blue-50">
              عرض جميع الوظائف
              <ChevronDown className="w-4 h-4 mr-1 rotate-90" />
            </Button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x scrollbar-hide -mx-2 px-6">
            {latestJobs.map(job => (
              <div key={job.id} className="min-w-[320px] max-w-[320px] snap-center">
                <JobCardItem job={job} />
              </div>
            ))}
            {latestJobs.length === 0 && (
              <div className="w-full text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                لا توجد وظائف منشورة مؤخراً
              </div>
            )}
          </div>
        </div>

        {/* Available Specialists (Horizontal Scroll) */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-xl text-gray-900">المتخصصين المتاحين</h3>
            </div>
            <Button variant="ghost" onClick={() => setActiveTab('browse-doctors')} className="text-teal-600 hover:bg-teal-50">
              تصفح جميع الاختصاصات
              <ChevronDown className="w-4 h-4 mr-1 rotate-90" />
            </Button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x scrollbar-hide -mx-2 px-6">
            {specialists.map(doc => (
              <Card key={doc.id} className="min-w-[280px] max-w-[280px] p-5 snap-center hover:shadow-lg transition-all border border-gray-100 group cursor-pointer bg-white" onClick={() => setActiveTab('browse-doctors')}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl flex items-center justify-center text-teal-600 font-bold text-xl shadow-sm border border-teal-100">
                    {doc.title?.charAt(0)}
                    {doc.is_looking_for_work && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 line-clamp-1">{doc.title}</h4>
                    <p className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                      {doc.role === 'doctor' ? 'طبيب' : doc.role === 'assistant' ? 'مساعد' : doc.role === 'technician' ? 'تقني' : 'مورد'}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10 leading-relaxed">
                  {doc.bio || 'لا يوجد نبذة تعريفية متاحة'}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <div className="flex items-center text-xs text-gray-400">
                    <MapPin className="w-3 h-3 ml-1" />
                    {doc.location || 'غير محدد'}
                  </div>
                  <span className="text-teal-600 text-xs font-bold group-hover:underline">عرض الملف</span>
                </div>
              </Card>
            ))}
            {specialists.length === 0 && (
              <div className="w-full text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                جاري تحميل المتخصصين...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const BrowseJobsTab = () => (
    <div className="space-y-6">
      <JobFilterBar filters={filters} onFiltersChange={setFilters} />
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">نتائج البحث ({filteredJobs.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map(job => (
            <JobCardItem key={job.id} job={job} />
          ))}
        </div>
        {filteredJobs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>لم يتم العثور على وظائف تطابق بحثك</p>
          </div>
        )}
      </div>
    </div>
  );

  const BrowseDoctorsTab = () => {
    const { fetchJobSeekers } = useJobs();
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loadingSeekers, setLoadingSeekers] = useState(true);
    const [doctorFilters, setDoctorFilters] = useState({ searchTerm: '', governorate: '', role: '' });
    const [selectedSeeker, setSelectedSeeker] = useState<any>(null);
    const [isSeekerModalOpen, setIsSeekerModalOpen] = useState(false);

    useEffect(() => {
      fetchJobSeekers(doctorFilters).then(data => {
        setDoctors(data || []);
        setLoadingSeekers(false);
      });
    }, [doctorFilters]);

    const roles = [
      { id: 'doctor', label: 'أطباء' },
      { id: 'assistant', label: 'مساعدين/طاقم' },
      { id: 'technician', label: 'تقنيين' },
      { id: 'supplier', label: 'موردين' }
    ];

    const getRoleStyles = (role: string) => {
      switch (role) {
        case 'doctor': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', iconBg: 'bg-blue-100', iconText: 'text-blue-600', label: 'طبيب' };
        case 'assistant': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100', iconBg: 'bg-green-100', iconText: 'text-green-600', label: 'مساعد/طاقم' };
        case 'technician': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', iconBg: 'bg-amber-100', iconText: 'text-amber-600', label: 'تقني مختبر' };
        case 'supplier': return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100', iconBg: 'bg-purple-100', iconText: 'text-purple-600', label: 'مورد' };
        default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100', iconBg: 'bg-gray-100', iconText: 'text-gray-600', label: 'عام' };
      }
    };

    return (
      <div className="space-y-6">
        <JobFilterBar filters={{ ...filters, ...doctorFilters } as any} onFiltersChange={(f) => setDoctorFilters({ searchTerm: f.searchTerm, governorate: f.governorate, role: doctorFilters.role })} />

        {/* Role Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setDoctorFilters(prev => ({ ...prev, role: '' }))}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!doctorFilters.role ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            الكل
          </button>
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => setDoctorFilters(prev => ({ ...prev, role: role.id }))}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${doctorFilters.role === role.id ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              {role.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">المتخصصين المتوفرين ({doctors.length})</h2>
          {loadingSeekers ? (
            <div className="text-center py-8">جاري التحميل...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map(doc => {
                const styles = getRoleStyles(doc.role);
                return (
                  <Card key={doc.id} className={`p-5 hover:shadow-lg transition-all border group relative overflow-hidden ${styles.border}`}>
                    {/* Decorative Top Bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${styles.iconBg.replace('bg-', 'bg-gradient-to-r from-white to-')}`}></div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 ${styles.iconBg} rounded-2xl flex items-center justify-center ${styles.iconText} font-bold text-xl relative shadow-inner`}>
                        {doc.title ? doc.title.charAt(0) : <User />}
                        {doc.is_looking_for_work && (
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full animate-pulse" title="متاح للعمل"></span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{doc.title || 'مستخدم غير معروف'}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" />
                          {doc.location || 'غير محدد'}
                        </div>
                        <span className={`text-[10px] ${styles.bg} ${styles.text} px-2 py-0.5 rounded-full mt-2 inline-block font-bold border ${styles.border}`}>
                          {styles.label}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10 leading-relaxed">{doc.bio || 'لا يوجد نبذة تعريفية'}</p>

                    <div className="flex flex-wrap gap-2 mb-4 h-6 overflow-hidden">
                      {doc.skills && doc.skills.slice(0, 3).map((skill: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-lg border border-gray-100">{skill}</span>
                      ))}
                    </div>

                    <Button
                      onClick={() => { setSelectedSeeker(doc); setIsSeekerModalOpen(true); }}
                      className={`w-full ${styles.iconBg} hover:${styles.iconBg.replace('100', '200')} ${styles.iconText} border-none shadow-none`}
                    >
                      عرض الملف الشخصي
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
          {!loadingSeekers && doctors.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>لم يتم العثور على نتائج تطابق بحثك</p>
            </div>
          )}
        </div>

        <JobSeekerProfileModal
          isOpen={isSeekerModalOpen}
          onClose={() => setIsSeekerModalOpen(false)}
          profile={selectedSeeker}
        />
      </div>
    );
  };

  const MyCareerCenterTab = () => {
    const { fetchMyPostedJobs, deleteJob, fetchMyOffers } = useJobs();
    const [subTab, setSubTab] = useState<'dashboard' | 'profile' | 'manage-jobs' | 'offers'>('dashboard');
    const [myJobs, setMyJobs] = useState<Job[]>([]);
    const [myOffers, setMyOffers] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    // Modal States
    const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<any>(null);
    const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<any>(null);
    const [isOfferDetailsModalOpen, setIsOfferDetailsModalOpen] = useState(false);

    useEffect(() => {
      if (subTab === 'manage-jobs') loadMyJobs();
      if (subTab === 'offers') loadMyOffers();
    }, [subTab]);

    const loadMyJobs = async () => {
      setLoadingData(true);
      const data = await fetchMyPostedJobs();
      setMyJobs(data as unknown as Job[]);
      setLoadingData(false);
    };

    const loadMyOffers = async () => {
      setLoadingData(true);
      const data = await fetchMyOffers();
      setMyOffers(data || []);
      setLoadingData(false);
    };

    const handleDeleteJob = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm('هل أنت متأكد من حذف هذه الوظيفة؟')) {
        await deleteJob(id);
        loadMyJobs();
      }
    };

    const renderDashboard = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
        <div onClick={() => navigate('/jobs/profile')} className="cursor-pointer">
          <Card className="p-6 h-full border-2 border-transparent hover:border-purple-100 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-purple-600 group-hover:scale-110 transition-transform">
              <User className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">الملف الشخصي</h3>
            <p className="text-sm text-gray-500">إدارة سيرتك الذاتية ومعلوماتك</p>
          </Card>
        </div>

        <div onClick={() => setSubTab('manage-jobs')} className="cursor-pointer">
          <Card className="p-6 h-full border-2 border-transparent hover:border-blue-100 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600 group-hover:scale-110 transition-transform">
              <Briefcase className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">إدارة وظائفي</h3>
            <p className="text-sm text-gray-500">لأصحاب العمل: متابعة الوظائف والمتقدمين</p>
          </Card>
        </div>

        <div onClick={() => setSubTab('offers')} className="cursor-pointer">
          <Card className="p-6 h-full border-2 border-transparent hover:border-green-100 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4 text-green-600 group-hover:scale-110 transition-transform">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">العروض المقدمة لي</h3>
            <p className="text-sm text-gray-500">فرص العمل التي وصلتني من أصحاب العمل</p>
          </Card>
        </div>
      </div>
    );

    const renderManageJobs = () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">إدارة وظائفي المنشورة</h3>
          <div className="flex gap-2">
            <Button onClick={() => setSubTab('dashboard')} variant="outline">
              العودة
            </Button>
            <Button onClick={() => setIsPostJobModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 ml-2" />
              نشر وظيفة جديدة
            </Button>
          </div>
        </div>

        {loadingData ? <div className="text-center py-8">جاري التحميل...</div> : myJobs.length > 0 ? (
          <div className="space-y-4">
            {myJobs.map(job => (
              <Card key={job.id} className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl">
                      {job.title.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {job.type}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        عدد المتقدمين: <span className="font-bold text-blue-600">{(job as any).applications_count || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => { setSelectedJobForApplicants(job); setIsApplicantsModalOpen(true); }} className="text-blue-600 hover:bg-blue-50 border-blue-200">
                      <Users className="w-4 h-4 ml-2" />
                      عرض المتقدمين
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setSelectedJobDetails(job); setIsJobDetailsModalOpen(true); }}>
                      <Eye className="w-4 h-4 ml-2" />
                      عرض التفاصيل
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-200" onClick={(e) => handleDeleteJob(job.id, e)}>
                      <Trash2 className="w-4 h-4 ml-2" />
                      حذف
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed text-gray-500">
            لا توجد وظائف منشورة حالياً
          </div>
        )}
      </div>
    );

    const renderOffers = () => (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">عروض العمل المستلمة</h3>
          <Button onClick={() => setSubTab('dashboard')} variant="outline">
            العودة
          </Button>
        </div>
        {loadingData ? <div className="text-center py-8">جاري التحميل...</div> : myOffers.length > 0 ? (
          <div className="space-y-4">
            {myOffers.map(offer => (
              <Card key={offer.id} className="p-6 border-l-4 border-l-green-500">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-1">{offer.job_title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{offer.message}</p>
                    <div className="text-xs text-gray-400">
                      من: {offer.sender?.title || 'جهة عمل'} • {new Date(offer.created_at).toLocaleDateString()}
                    </div>
                    <div className="mt-3">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedOffer(offer); setIsOfferDetailsModalOpen(true); }} className="text-sm">
                        <Eye className="w-3 h-3 ml-1" />
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${offer.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {offer.status === 'pending' ? 'جديد' : offer.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed text-gray-500">
            <Inbox className="w-12 h-12 mx-auto mb-3 opacity-20" />
            لم تصلك أي عروض عمل حتى الآن
          </div>
        )}
      </div>
    );



    return (
      <div className="space-y-8 max-w-6xl mx-auto py-8">
        {subTab === 'dashboard' && renderDashboard()}
        {subTab === 'manage-jobs' && renderManageJobs()}
        {subTab === 'offers' && renderOffers()}

        <JobDetailsModal
          isOpen={isJobDetailsModalOpen}
          onClose={() => setIsJobDetailsModalOpen(false)}
          job={selectedJobDetails}
        />

        <OfferDetailsModal
          isOpen={isOfferDetailsModalOpen}
          onClose={() => setIsOfferDetailsModalOpen(false)}
          offer={selectedOffer}
        />

        <JobApplicantsModal
          isOpen={isApplicantsModalOpen}
          onClose={() => setIsApplicantsModalOpen(false)}
          job={selectedJobForApplicants}
        />
      </div>
    );
  };



  // ManageJobsTab removed (consolidated in MyCareerCenterTab)

  // OthersTab removed (consolidated in MyCareerCenterTab)

  // RequestsView removed (consolidated in MyCareerCenterTab)

  if (loading) return <div className="p-12 text-center text-gray-500">جاري تحميل الوظائف...</div>;

  return (
    <div className="min-h-screen bg-gray-50 w-full pt-[130px]" dir="rtl">
      {/* Header */}
      <div className={`fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 z-50 shadow-sm supports-[backdrop-filter]:bg-white/60 transition-all duration-300 ${hideHeader ? 'top-[64px]' : 'top-0'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-2 py-2">
            {!hideHeader && (
              <div className="flex items-center justify-between h-14">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-xl text-gray-900 tracking-tight">مركز الوظائف</h1>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link to="/jobs/applications">
                    <Button variant="ghost" size="sm" className="hidden lg:flex">
                      <FileText className="w-4 h-4 ml-2" />
                      طلباتي
                    </Button>
                  </Link>
                  <Button
                    onClick={() => setActiveTab('my-career')}
                    className="hidden lg:flex bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95 transition-all size-sm"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    نشر وظيفة
                  </Button>
                  <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                    <Menu className="w-6 h-6" />
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 p-4 space-y-2 bg-white shadow-lg animate-in slide-in-from-top-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full text-right px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                  }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="container mx-auto px-4 py-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'browse-jobs' && <BrowseJobsTab />}
        {activeTab === 'browse-doctors' && <BrowseDoctorsTab />}
        {activeTab === 'my-career' && <MyCareerCenterTab />}
      </main>

      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
      />
    </div>
  );
};

const JobCardItem: React.FC<{ job: Job }> = ({ job }) => {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow group">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-8 h-8 text-gray-400" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              <Link to={`/jobs/${job.id}`}>{job.title}</Link>
            </h3>
            {job.featured && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                مميز
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-2">{job.companyName}</p>

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {job.salary}
            </span>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{job.postedDate}</span>
            <Link to={`/jobs/${job.id}`}>
              <Button size="sm" variant="outline">التفاصيل</Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};