import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, Clock, Star, Building2, Filter, Search, Heart, Stethoscope, Shield, Award } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { formatLocation } from '../../utils/location';
import { useClinics } from '../../hooks/useClinics';
import { supabase } from '../../lib/supabase';

interface EmergencyCenter {
  id: string;
  name: string;
  type: 'government' | 'private';
  phone: string;
  address: string;
  governorate: string;
  workingHours: string;
  rating: number;
  services: string[];
  is24Hours: boolean;
  specialties: string[];
  location: {
    lat: number;
    lng: number;
  };
}

const governorates = [
  'بغداد', 'البصرة', 'كربلاء', 'النجف', 'أربيل', 'السليمانية',
  'الموصل', 'كركوك', 'ديالي', 'بابل', 'ذي قار', 'القادسية',
  'الأنبار', 'ديالى', 'كربلاء', 'كوفة', 'ميسان', 'المثنى'
];

export const EmergencyCentersPage: React.FC = () => {
  const [emergencyCenters, setEmergencyCenters] = useState<EmergencyCenter[]>([]);
  const [hotline, setHotline] = useState('07700000000');
  const [loading, setLoading] = useState(true);

  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'government' | 'private'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { clinics, loading: clinicsLoading } = useClinics();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmergencyData = async () => {
      setLoading(true);
      try {
        // Fetch Centers
        const { data: centersData, error: centersError } = await supabase
          .from('emergency_centers')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (centersData) {
          const mappedCenters: EmergencyCenter[] = centersData.map(c => ({
            id: c.id,
            name: c.name,
            type: c.type as 'government' | 'private',
            phone: c.phone,
            address: c.address,
            governorate: c.governorate,
            workingHours: c.working_hours,
            rating: 5.0, // Default
            services: c.services || [],
            is24Hours: c.is_24h,
            specialties: [], // Default
            location: c.location
          }));
          setEmergencyCenters(mappedCenters);
        }

        // Fetch Settings
        const { data: settingsData } = await supabase
          .from('emergency_settings')
          .select('value')
          .eq('key', 'hotline')
          .single();

        if (settingsData && settingsData.value?.is_active) {
          setHotline(settingsData.value.number);
        }
      } catch (error) {
        console.error('Error fetching emergency data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyData();
  }, []);

  const filteredCenters = useMemo(() => {
    let filtered = emergencyCenters;

    // Filter by governorate
    if (selectedGovernorate) {
      filtered = filtered.filter(center => center.governorate === selectedGovernorate);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(center => center.type === selectedType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(center =>
        center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        center.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Only 24 hours centers for government, or show all for private
    if (selectedType === 'government') {
      filtered = filtered.filter(center => center.is24Hours);
    } else if (selectedType === 'private') {
      // For private, we'll show all private clinics with dental surgery specialty
      // We can integrate with the actual clinics data here
    }

    // If no specific governorate selected, show all emergency centers
    return filtered;
    // If no specific governorate selected, show all emergency centers
    return filtered;
  }, [emergencyCenters, selectedGovernorate, selectedType, searchTerm]);

  // Get surgical clinics for private filter
  const surgicalClinics = useMemo(() => {
    if (selectedType === 'private') {
      return clinics.filter(clinic =>
        clinic.specialties?.some(specialty =>
          specialty.includes('جراحة') ||
          specialty.includes('فك') ||
          specialty.includes('جراحة الفم')
        )
      );
    }
    return [];
  }, [selectedType, clinics]);

  const resetFilters = () => {
    setSelectedGovernorate('');
    setSelectedType('all');
    setSearchTerm('');
  };

  const getTypeIcon = (type: 'government' | 'private') => {
    return type === 'government'
      ? <Building2 className="w-5 h-5" />
      : <Heart className="w-5 h-5" />;
  };

  const getTypeColor = (type: 'government' | 'private') => {
    return type === 'government'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-green-100 text-green-800';
  };

  const getTypeLabel = (type: 'government' | 'private') => {
    return type === 'government' ? 'حكومي' : 'خاص';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-4 relative overflow-hidden">
        {/* Simple background pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute right-0 top-0 w-64 h-64 bg-green-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/services#tab-emergency')}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة
            </Button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              شبكة الطوارئ
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">مراكز الطوارئ</h1>
              <p className="text-xl text-gray-500 leading-relaxed">
                عثر على أقرب مراكز الطوارئ والمستشفيات في العراق مع معلومات التواصل المباشر.
              </p>
            </div>
            <div>
              <div className="flex -space-x-4 rtl:space-x-reverse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shadow-sm relative z-0 hover:z-10 transition-all hover:scale-110">
                    H+
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-white bg-green-100 flex items-center justify-center text-xs font-bold text-green-600 relative z-10">
                  +50
                </div>
              </div>
              <div className="text-center mt-2 text-sm text-gray-500 font-medium">مركز متاح</div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact Banner */}
      <div className="container mx-auto max-w-6xl px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100 shadow-inner">
              <Phone className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">خدمة طوارئ 24 ساعة</h3>
              <p className="text-gray-500">للحالات العاجلة المتخصصة - فريق جاهز</p>
            </div>
          </div>
          <a href={`tel:${hotline}`}>
            <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 rounded-xl px-8 py-4 h-auto text-lg" size="lg">
              <span className="ml-3 font-bold" dir="ltr">{hotline.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3')}</span>
              <Phone className="w-5 h-5" />
            </Button>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative group">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                <input
                  type="text"
                  placeholder="البحث عن مركز أو خدمة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-green-500 rounded-xl focus:ring-4 focus:ring-green-50/50 transition-all text-right outline-none font-medium"
                />
              </div>
            </div>

            {/* Governorate Filter */}
            <div className="min-w-[200px] flex-1 lg:flex-none lg:w-64">
              <select
                value={selectedGovernorate}
                onChange={(e) => setSelectedGovernorate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-green-500 rounded-xl focus:ring-4 focus:ring-green-50/50 transition-all text-right outline-none font-medium cursor-pointer"
              >
                <option value="">جميع المحافظات</option>
                {governorates.map(governorate => (
                  <option key={governorate} value={governorate}>{governorate}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="min-w-[180px] flex-1 lg:flex-none lg:w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'all' | 'government' | 'private')}
                className="w-full px-4 py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-green-500 rounded-xl focus:ring-4 focus:ring-green-50/50 transition-all text-right outline-none font-medium cursor-pointer"
              >
                <option value="all">جميع الأنواع</option>
                <option value="government">حكومي (24 ساعة)</option>
                <option value="private">خاص (عيادات)</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex gap-1 bg-gray-100/50 p-1.5 rounded-xl border border-gray-100">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'list' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
              >
                <Filter className="w-4 h-4" />
                قائمة
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                  }`}
              >
                <MapPin className="w-4 h-4" />
                خريطة
              </button>
            </div>
          </div>

          {/* Reset Filters */}
          {(searchTerm || selectedGovernorate || selectedType !== 'all') && (
            <div className="flex justify-start border-t border-gray-100 pt-4">
              <Button variant="ghost" onClick={resetFilters} size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg">
                <span className="ml-2">×</span>
                مسح جميع الفلاتر
              </Button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              نتائج البحث
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">{filteredCenters.length}</span>
            </h2>
            {selectedType !== 'all' && (
              <p className="text-sm text-gray-500 mt-1">
                {selectedType === 'government' ? 'مراكز حكومية (24 ساعة)' : 'عيادات خاصة'}
                {selectedGovernorate && ` • ${selectedGovernorate}`}
              </p>
            )}
          </div>
        </div>

        {/* Centers List */}
        {viewMode === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCenters.map((center) => (
              <div key={center.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-100 transition-all group flex flex-col">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getTypeColor(center.type)}`}>
                          {getTypeIcon(center.type)}
                          <span className="mr-1">{getTypeLabel(center.type)}</span>
                        </span>
                        {center.is24Hours && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 flex items-center gap-1 border border-red-100">
                            <Clock className="w-3 h-3" />
                            24 ساعة
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{center.name}</h3>
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{center.address}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 border border-yellow-100">
                      <span className="font-bold text-lg">{center.rating}</span>
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">الخدمات المتوفرة</p>
                      <div className="flex flex-wrap gap-2">
                        {center.services.slice(0, 3).map((service, index) => (
                          <span key={index} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-100">
                            {service}
                          </span>
                        ))}
                        {center.services.length > 3 && (
                          <span className="px-2.5 py-1 bg-gray-50 text-gray-400 text-xs font-medium rounded-lg border border-gray-100">
                            +{center.services.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto pt-6 border-t border-gray-50">
                  <a href={`tel:${center.phone}`} className="col-span-1">
                    <Button className="w-full bg-green-50 text-green-700 hover:bg-green-100 border-green-100 shadow-none font-bold" variant="secondary">
                      <Phone className="w-4 h-4 ml-2" />
                      اتصال
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    className="col-span-1 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-bold"
                    onClick={() => window.open(`https://maps.google.com/?q=${center.location.lat},${center.location.lng}`, '_blank')}
                  >
                    <MapPin className="w-4 h-4 ml-2" />
                    الخريطة
                  </Button>
                </div>
              </div>
            ))}

            {/* Show surgical clinics for private type */}
            {selectedType === 'private' && surgicalClinics.length > 0 && (
              <>
                {surgicalClinics.map((clinic) => (
                  <div key={clinic.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-green-100 transition-all group flex flex-col">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 flex items-center gap-1 border border-green-100">
                              <Heart className="w-3 h-3" />
                              عيادة خاصة
                            </span>
                          </div>
                          <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{clinic.name}</h4>
                          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>
                              {formatLocation(clinic.governorate, clinic.address)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase mb-2">الاختصاصات</p>
                          <div className="flex flex-wrap gap-2">
                            {clinic.specialties?.slice(0, 3).map((specialty, index) => (
                              <span key={index} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-100">
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-auto pt-6 border-t border-gray-50">
                      <Button variant="primary" className="col-span-1 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-100" onClick={() => navigate(`/booking?clinic=${clinic.id}`)}>
                        حجز
                      </Button>
                      <Button variant="outline" className="col-span-1 border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-bold rounded-xl">
                        <MapPin className="w-4 h-4 ml-2" />
                        موقع
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {filteredCenters.length === 0 && selectedType !== 'private' && (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد نتائج مطابقة</h3>
                <p className="text-gray-500">جرب تغيير الفلاتر أو البحث عن منطقة أخرى</p>
                <Button variant="outline" onClick={resetFilters} className="mt-6 border-gray-200">
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Map View */}
        {viewMode === 'map' && (
          <Card className="p-0 overflow-hidden">
            <div className="p-4 bg-green-50 border-b border-green-200">
              <h3 className="text-xl font-bold text-gray-900">خريطة المراكز</h3>
            </div>
            <div className="h-96 bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">خريطة تفاعلية</p>
                <p className="text-sm text-gray-500">تظهر مواقع المراكز على الخريطة</p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">اتصال طوارئ</h3>
            <p className="text-gray-600 text-sm mb-4">للحالات العاجلة</p>
            <a href={`tel:${hotline}`}>
              <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                {hotline}
              </Button>
            </a>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">طوارئ الأسنان</h3>
            <p className="text-gray-600 text-sm mb-4">إسعافات أولية وتوجيهات</p>
            <a href="/emergency/dental">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                استكشاف الخدمات
              </Button>
            </a>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">الإسعافات الأولية</h3>
            <p className="text-gray-600 text-sm mb-4">دليل تفاعلي شامل</p>
            <a href="/emergency/first-aid">
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                قراءة الدليل
              </Button>
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
};
