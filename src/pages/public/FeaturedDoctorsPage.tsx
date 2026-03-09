import React, { useState } from 'react';
import {
  Star,
  MapPin,
  Calendar,
  MessageCircle,
  Award,
  Heart,
  Eye,
  ChevronDown,
  Filter,
  Search,
  Users,
  Clock
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';

import { usePublicClinics } from '../../hooks/usePublicClinics';

export const FeaturedDoctorsPage: React.FC = () => {
  const { clinics, loading } = usePublicClinics();
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const specialties = [
    { id: 'all', name: 'جميع التخصصات' },
    { id: 'orthodontics', name: 'تقويم الأسنان' },
    { id: 'implant', name: 'زراعة الأسنان' },
    { id: 'cosmetic', name: 'طب الأسنان التجميلي' },
    { id: 'pediatric', name: 'أسنان الأطفال' },
    { id: 'oral-surgery', name: 'جراحة الفم' },
    { id: 'endodontics', name: 'علاج الجذور' },
    { id: 'periodontics', name: 'أمراض اللثة' },
    { id: 'general', name: 'طب أسنان عام' }
  ];

  const cities = [
    { id: 'all', name: 'جميع المدن' },
    { id: 'baghdad', name: 'بغداد' },
    { id: 'basra', name: 'البصرة' },
    { id: 'erbil', name: 'أربيل' },
    { id: 'mosul', name: 'الموصل' },
    { id: 'najaf', name: 'النجف' },
    { id: 'karbala', name: 'كربلاء' },
    { id: 'kufa', name: 'الكوفة' }
  ];

  // Filter only featured clinics from real data
  const featuredClinics = clinics.filter(c => c.isFeatured);

  const filteredDoctors = featuredClinics.filter(clinic => {
    // Mocking Doctor fields from Clinic data for display compatibility
    const specialty = clinic.specialties?.[0] || 'طب أسنان عام';
    const city = clinic.governorate || 'بغداد'; // Simple heuristic

    const matchesSpecialty = selectedSpecialty === 'all' ||
      specialty === specialties.find(s => s.id === selectedSpecialty)?.name; // This might be loose, better to check includes

    const matchesCity = selectedCity === 'all' || city.includes(cities.find(c => c.id === selectedCity)?.name || '');

    const matchesSearch = searchQuery === '' ||
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (clinic.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSpecialty && matchesCity && matchesSearch;
  }).map(clinic => ({
    id: clinic.id,
    name: clinic.name,
    specialty: clinic.specialties?.[0] || 'طبيب أسنان',
    city: clinic.governorate || 'بغداد',
    clinic: clinic.governorate || 'بغداد', // Using governorate as location
    rating: clinic.rating || 5.0,
    reviews: 0,
    experience: 'غير محدد',
    price: 'جيد',
    avatar: clinic.image,
    available: true,
    specializations: clinic.specialties || [],
    languages: ['العربية'],
    isFeatured: clinic.isFeatured,
    nextAvailable: 'متاح الآن',
    distance: '0 كم'
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">أطباء مميزون</h1>
            <p className="text-xl text-gray-600">
              اعثر على أفضل أطباء الأسنان في منطقتك مع تقييمات عالية
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن طبيب..."
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-right"
                />
              </div>

              {/* Specialty Filter */}
              <div className="relative">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-right appearance-none"
                >
                  {specialties.map(specialty => (
                    <option key={specialty.id} value={specialty.id}>
                      {specialty.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* City Filter */}
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-right appearance-none"
                >
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-center bg-gray-50 px-4 py-2.5 rounded-lg">
                <Users className="w-5 h-5 text-gray-400 ml-2" />
                <span className="text-gray-600">
                  {filteredDoctors.length} طبيب متاح
                </span>
              </div>
            </div>
          </Card>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} hover className="p-6">
                <div className="text-center mb-4">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-2xl">
                        {doctor.name.split(' ')[1]?.[0] || doctor.name[0]}
                      </span>
                    </div>
                    {doctor.isFeatured && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <Star className="w-3 h-3 text-white fill-current" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-1">{doctor.name}</h3>
                  <p className="text-yellow-600 font-medium mb-2">{doctor.specialty}</p>

                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-semibold text-gray-900">{doctor.rating}</span>
                    <span className="text-gray-500 text-sm">({doctor.reviews} تقييم)</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-2">{doctor.clinic}</p>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{doctor.distance}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">الخبرة:</span>
                    <span className="font-medium">{doctor.experience}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">المدينة:</span>
                    <span className="font-medium">{doctor.city}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">التقييم:</span>
                    <span className={`font-medium ${doctor.price === 'ممتاز' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                      {doctor.price}
                    </span>
                  </div>
                </div>

                {/* Specializations */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">التخصصات:</p>
                  <div className="flex flex-wrap gap-1">
                    {doctor.specializations.slice(0, 2).map((spec, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                    {doctor.specializations.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{doctor.specializations.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">اللغات:</p>
                  <div className="flex flex-wrap gap-1">
                    {doctor.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className={`flex items-center gap-2 mb-4 ${doctor.available ? 'text-green-600' : 'text-red-600'
                  }`}>
                  <div className={`w-2 h-2 rounded-full ${doctor.available ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  <span className="text-sm font-medium">
                    {doctor.available ? 'متاح الآن' : 'غير متاح'}
                  </span>
                </div>

                {!doctor.available && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>التوفر التالي: {doctor.nextAvailable}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link to="/booking" className="w-full">
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!doctor.available}
                    >
                      <Calendar className="w-4 h-4 ml-2" />
                      {doctor.available ? 'احجز موعد' : 'احجز موعد'}
                    </Button>
                  </Link>

                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 ml-1" />
                      عرض الملف
                    </Button>
                    <Button variant="secondary" size="sm" className="flex-1">
                      <MessageCircle className="w-4 h-4 ml-1" />
                      استشارة
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredDoctors.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-600">
                جرب تغيير معايير البحث أو الفلتر للعثور على أطباء آخرين
              </p>
            </div>
          )}

          {/* CTA Section */}
          <Card className="mt-12 p-8 text-center bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              لم تجد الطبيب المناسب؟
            </h2>
            <p className="text-gray-600 mb-6">
              تواصل معنا وسنساعدك في العثور على أفضل طبيب يناسب احتياجاتك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                طلب مساعدة
              </Button>
              <Button variant="secondary">
                عرض جميع الأطباء
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};