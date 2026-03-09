
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Brain, FileText, AlertCircle, MessageSquare, Upload, Phone, CheckCircle, Calendar as CalendarIcon, Navigation, User, Star, Stethoscope, Camera, Zap, ChevronRight, Clock, Heart, Shield, Filter, TrendingUp, Award, Users, Send, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ClinicCard } from '../../components/cards/ClinicCard';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { InteractiveMap } from '../../components/common/InteractiveMap';
import { usePublicClinics } from '../../hooks/usePublicClinics';
import { useArticles } from '../../hooks/useArticles';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Clinic } from '../../types';

// Internal component for settings
const NearbyClinicsSettings = ({
  clinics,
  onFilter
}: {
  clinics: Clinic[];
  onFilter: (filtered: Clinic[]) => void;
}) => {
  const [radius, setRadius] = useState(10);
  const [isEnabled, setIsEnabled] = useState(false);
  const { location, getLocation, calculateDistance, loading, error } = useGeolocation();

  useEffect(() => {
    if (isEnabled && location) {
      const filtered = clinics.filter(clinic => {
        // Ensure we only filter from already visible clinics (though the prop passed should be pre-filtered, double safety)
        if (!clinic.settings?.showOnMap) return false;

        const dist = calculateDistance(
          location,
          { lat: clinic.location.lat, lng: clinic.location.lng }
        );
        return dist <= radius;
      });
      onFilter(filtered);
    } else {
      // Reset to only visible clinics
      onFilter(clinics.filter(c => c.settings?.showOnMap === true));
    }
  }, [isEnabled, radius, location, clinics]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <Navigation className={`w-6 h-6 ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">إعدادات العيادات القريبة</h3>
            <p className="text-sm text-gray-500">تصفية النتائج حسب موقعك الحالي</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          {/* Radius Slider - Only show if enabled */}
          {isEnabled && (
            <div className="flex items-center gap-4 w-full md:w-64 bg-gray-50 p-3 rounded-xl">
              <span className="text-sm font-bold text-gray-500 whitespace-nowrap">المسافة: {radius} كم</span>
              <input
                type="range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            {error && <span className="text-xs text-red-500 font-medium">{error}</span>}

            <Button
              variant={isEnabled ? 'primary' : 'outline'}
              onClick={() => {
                if (!isEnabled && !location) {
                  getLocation();
                }
                setIsEnabled(!isEnabled);
              }}
              className={`min-w-[140px] rounded-xl transition-all ${isEnabled ? 'shadow-lg shadow-blue-200' : ''
                }`}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  جاري التحديد...
                </span>
              ) : isEnabled ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  مفعل
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  تحديد موقعي
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ServicesPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'clinics' | 'featured-doctors' | 'diagnosis' | 'articles' | 'emergency'>('clinics');
  const { clinics, loading: clinicsLoading } = usePublicClinics();
  const [filteredClinics, setFilteredClinics] = useState(clinics);
  const { articles, loading: articlesLoading } = useArticles();

  // Sync clinics when loaded, but strictly filter by visibility rules (showOnMap)
  useEffect(() => {
    // Only show clinics that have explicitly enabled "Show on Map"
    const visibleClinics = clinics.filter(c => c.settings?.showOnMap === true);
    setFilteredClinics(visibleClinics);
  }, [clinics]);

  // Handle hash navigation on page load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const tabId = hash.replace('#', '');
      const validTabs = ['tab-clinics', 'tab-featured-doctors', 'tab-diagnosis', 'tab-articles', 'tab-emergency'];
      if (validTabs.includes(tabId)) {
        const tabName = tabId.replace('tab-', '') as 'clinics' | 'featured-doctors' | 'diagnosis' | 'articles' | 'emergency';
        setActiveTab(tabName);
      }
    }
  }, []);

  // Featured Clinics Filters
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');

  // Filter options
  const governorates = [
    'بغداد', 'البصرة', 'كربلاء', 'النجف', 'أربيل', 'السليمانية',
    'الموصل', 'كركوك', 'ديالي', 'بابل', 'كربلاء', 'القادسية'
  ];

  const specialties = [
    'جراحة الأسنان', 'تقويم الأسنان', 'علاج الجذور', 'طب الأسنان العام',
    'أمراض اللثة', 'طب أسنان الأطفال', 'التركيبات', 'تجميل الأسنان'
  ];



  // Smart Diagnosis Data
  const diagnosticMethods = [
    {
      id: 'ai',
      title: 'التشخيص بالمحادثة مع الوكيل',
      icon: MessageSquare,
      description: 'محادثة تفاعلية مع الوكيل الذكي للحصول على تشخيص شامل',
      features: [
        'محادثة طبيعية مع الوكيل',
        'أسئلة ذكية ومتسلسلة',
        'تحليل فوري للمشكلة',
        'توصيات مخصصة'
      ],
      duration: '3-5 دقائق',
      accuracy: '90%'
    },
    {
      id: 'smart',
      title: 'التشخيص الذكي (أسئلة متتالية)',
      icon: Stethoscope,
      description: 'تشخيص منظم عبر أسئلة متسلسلة تبدأ بـ "ماذا تعاني"',
      features: [
        'أسئلة منظمة ومتتالية',
        'بداية بـ "ماذا تعاني"',
        'تحديد دقيق للمشكلة',
        'اقتراح علاج أو زيارة عيادة'
      ],
      duration: '5-8 دقائق',
      accuracy: '85%'
    }
  ];



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-white via-blue-50/50 to-white pt-12 pb-20 px-4 relative overflow-hidden border-b border-blue-100/50">
        {/* Abstract Background Pattern */}
        <div className="absolute inset-0 max-w-6xl mx-auto">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -mr-32 -mt-32 mix-blend-multiply"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-100/40 rounded-full blur-[100px] -ml-32 -mb-32 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 text-center md:text-right">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-bold border border-blue-100 shadow-sm">خدمات طبية</span>
                <span className="px-4 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm font-bold border border-purple-100 shadow-sm">شاملة</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                الخدمات <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">الطبية</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">منصة طبية متكاملة لخدمتك.. من التشخيص الذكي وحتى حجز الموعد.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service Tabs */}
      <div className="container mx-auto px-4 -mt-8 max-w-6xl mb-12 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-2 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { id: 'clinics', label: 'عيادات قريبة', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
              { id: 'featured-doctors', label: 'العيادات المميزة', icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
              { id: 'diagnosis', label: 'تشخيص ذكي', icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { id: 'articles', label: 'مقالات طبية', icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
              { id: 'emergency', label: 'طوارئ', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                }}
                id={`tab-${tab.id}`}
                className={`flex flex-col md:flex-row items-center justify-center gap-3 p-4 rounded-xl transition-all duration-300 ${activeTab === tab.id
                  ? `${tab.bg} ${tab.color} shadow-sm ring-1 ring-inset ring-black/5`
                  : 'hover:bg-gray-50 text-gray-500 hover:text-gray-900'
                  }`}
              >
                <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-white/80' : 'bg-gray-100 group-hover:bg-white'} transition-colors`}>
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? tab.color : 'text-gray-500'}`} />
                </div>
                <span className={`font-bold text-sm ${activeTab === tab.id ? 'text-gray-900' : ''}`}>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {activeTab === 'clinics' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Geolocation Logic */}
            <NearbyClinicsSettings
              clinics={clinics}
              onFilter={setFilteredClinics}
            />

            {/* Map */}
            <Card className="overflow-hidden p-0 border-0 shadow-lg rounded-3xl ring-1 ring-black/5">
              <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-gray-100 flex justify-between items-center absolute top-0 w-full z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <h3 className="text-sm font-bold text-gray-900">الخريطة التفاعلية</h3>
                </div>
                <Button
                  onClick={() => setActiveTab('featured-doctors')}
                  className="flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm rounded-xl"
                  size="sm"
                >
                  <User className="w-4 h-4 text-purple-600" />
                  عرض العيادات المميزة
                </Button>
              </div>
              <InteractiveMap
                clinics={filteredClinics}
                height="500px"
              />
            </Card>

            {/* Clinics List */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {filteredClinics.length === clinics.length
                  ? 'جميع العيادات'
                  : `العيادات القريبة (${filteredClinics.length})`
                }
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClinics.map(clinic => (
                  <ClinicCard key={clinic.id} clinic={clinic} expandable />
                ))}
                {filteredClinics.length === 0 && !clinicsLoading && (
                  <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-gray-100 p-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد عيادات قريبة</h3>
                    <p className="text-gray-500">حاول زيادة مسافة البحث أو تغيير موقعك</p>
                  </div>
                )}
                {clinics.length === 0 && clinicsLoading && (
                  <div className="col-span-full py-12 text-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">جاري تحميل العيادات...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'featured-doctors' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Featured Clinics Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8 md:p-12 shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
              <div className="relative text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-white/20">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">العيادات المميزة</h2>
                <p className="text-purple-100 text-lg leading-relaxed font-medium">نخبة من أفضل الأطباء والعيادات المعتمدة بتقييمات عالية وخبرات متميزة لخدمتك</p>
              </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">المحافظة</label>
                  <select
                    value={selectedGovernorate}
                    onChange={(e) => setSelectedGovernorate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all font-medium text-gray-700"
                  >
                    <option value="">جميع المحافظات</option>
                    {governorates.map(governorate => (
                      <option key={governorate} value={governorate}>{governorate}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">الاختصاص</label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 transition-all font-medium text-gray-700"
                  >
                    <option value="">جميع الاختصاصات</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedGovernorate('');
                      setSelectedSpecialty('');
                    }}
                    className="px-6 h-[46px] rounded-xl text-gray-500 hover:text-red-500 hover:bg-red-50"
                  >
                    مسح الفلاتر
                  </Button>
                </div>
              </div>
            </div>

            {/* Featured Clinics List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinics
                .filter(c => (c.isFeatured === true) && (parseFloat(c.rating?.toString() || '0') >= 4.5))
                .map(clinic => (
                  <ClinicCard
                    key={clinic.id}
                    clinic={clinic}
                    expandable={true}
                    featured={true}
                  />
                ))}
            </div>
          </div>
        )}

        {activeTab === 'diagnosis' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Diagnosis Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-2xl mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">التشخيص الذكي المتقدم</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                احصل على تشخيص مبدئي فوري لحالتك باستخدام تقنيات الذكاء الاصطناعي وبإشراف نخبة من الأطباء
              </p>
            </div>

            {/* Diagnosis Content - Now Simplified to Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {diagnosticMethods.map((method) => (
                <div
                  key={method.id}
                  className="relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-transparent bg-white hover:border-purple-200 shadow-xl shadow-gray-200/50 transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => navigate(method.id === 'ai' ? '/diagnosis/ai' : '/smart')}
                >
                  <div className="p-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                      <method.icon className="w-7 h-7" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{method.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{method.description}</p>

                    <div className="mt-6 pt-6 border-t border-purple-100/50">
                      <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">المميزات:</h4>
                      <ul className="space-y-2">
                        {method.features.map((feature, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            </div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Hover Indicator */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transform rotate-180" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">المقالات الطبية</h2>
                <p className="text-gray-500">ثقف نفسك بأحدث المعلومات الطبية الموثوقة</p>
              </div>
              <div className="hidden md:flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl">الأحدث</Button>
                <Button variant="ghost" size="sm" className="rounded-xl">الأكثر قراءة</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map(article => (
                <div key={article.id} className="transform transition-all duration-300 hover:-translate-y-1">
                  <ArticleCard article={article} />
                </div>
              ))}
              {articles.length === 0 && articlesLoading && (
                <div className="col-span-full py-20 text-center">
                  <div className="w-16 h-16 border-4 border-green-100 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400 font-medium">جاري جلب أحدث المقالات...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Emergency Services Header */}
            <div className="text-center relative">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-100 -z-10"></div>
              <span className="bg-gray-50 px-4 text-red-500 font-bold tracking-widest text-sm uppercase">منطقة الطوارئ</span>
              <h2 className="text-4xl font-black text-gray-900 mt-4 mb-2">خدمات الطوارئ العاجلة</h2>
              <p className="text-xl text-gray-600">استجابة سريعة للحالات الحرجة على مدار 24 ساعة</p>
            </div>

            {/* Emergency Service Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Dental Emergency Card */}
              <div
                className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-white transition-all duration-300 hover:shadow-2xl hover:shadow-red-200/50 border border-gray-100"
                onClick={() => window.location.href = '/emergency/dental'}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-8 text-center relative z-10">
                  <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-200">
                      <Zap className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">طوارئ الأسنان</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">إدارة فورية للألم والحوادث الطارئة للأسنان والوجه مع إرشادات طبية عاجلة</p>

                  <div className="flex flex-wrap gap-2 justify-center mb-8">
                    <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">ألم شديد</span>
                    <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">كسور</span>
                    <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">نزيف</span>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto group-hover:bg-red-500 group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* First Aid Guide Card */}
              <div
                className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-white transition-all duration-300 hover:shadow-2xl hover:shadow-blue-200/50 border border-gray-100"
                onClick={() => window.location.href = '/emergency/first-aid'}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-8 text-center relative z-10">
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
                      <Heart className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">دليل الإسعافات</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">دليل تفاعلي للتعامل مع الحالات الطارئة خطوة بخطوة لحين وصول الطبيب</p>

                  <div className="flex flex-wrap gap-2 justify-center mb-8">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100">خطوات عملية</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-100">إرشادات</span>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Emergency Centers Card */}
              <div
                className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-white transition-all duration-300 hover:shadow-2xl hover:shadow-green-200/50 border border-gray-100"
                onClick={() => window.location.href = '/emergency/centers'}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="p-8 text-center relative z-10">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-200">
                      <MapPin className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">مراكز الطوارئ</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">خريطة تفاعلية لأقرب العيادات والمستشفيات المناوبة مع أرقام التواصل المباشر</p>

                  <div className="flex flex-wrap gap-2 justify-center mb-8">
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-lg border border-green-100">24/7</span>
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-lg border border-green-100">توجيه GPS</span>
                  </div>

                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto group-hover:bg-green-500 group-hover:text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Emergency Actions */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <a href="tel:+9647700000000" className="block group">
                  <div className="h-full bg-red-600 hover:bg-red-700 p-6 rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-3 border border-red-500 shadow-lg shadow-red-900/20">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg font-bold">اتصال طوارئ</span>
                  </div>
                </a>

                <button
                  onClick={() => window.location.href = '/emergency/centers'}
                  className="group h-full bg-white/10 hover:bg-white/20 p-6 rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-3 backdrop-blur-sm border border-white/10"
                >
                  <MapPin className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-lg font-medium">أقرب مركز</span>
                </button>



                <button
                  onClick={() => window.location.href = '/emergency/first-aid'}
                  className="group h-full bg-white/10 hover:bg-white/20 p-6 rounded-2xl transition-all flex flex-col items-center justify-center text-center gap-3 backdrop-blur-sm border border-white/10"
                >
                  <CheckCircle className="w-8 h-8 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span className="text-lg font-medium">خطوات عاجلة</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
