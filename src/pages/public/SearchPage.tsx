import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Star,
  Clock,
  ChevronRight,
  X,
  SlidersHorizontal,
  BookOpen,
  Zap,
  Eye
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const [filters, setFilters] = useState({
    type: 'all', // all, doctors, clinics, articles, services
    specialty: 'all',
    city: 'all',
    rating: 'all',
    priceRange: 'all',
    availability: 'all'
  });

  const searchTypes = [
    { id: 'all', name: 'جميع النتائج', count: 0 },
    { id: 'doctors', name: 'الأطباء', count: 0 },
    { id: 'clinics', name: 'العيادات', count: 0 },
    { id: 'articles', name: 'المقالات', count: 0 },
    { id: 'services', name: 'الخدمات', count: 0 }
  ];

  const specialties = [
    'تقويم الأسنان', 'زراعة الأسنان', 'طب الأسنان التجميلي',
    'أسنان الأطفال', 'جراحة الفم', 'علاج الجذور', 'أمراض اللثة'
  ];

  const cities = [
    'بغداد', 'البصرة', 'أربيل', 'الموصل', 'النجف', 'كربلاء', 'الكوفة'
  ];

  const mockSearchResults = {
    doctors: [
      {
        id: 1,
        name: 'د. أحمد سالم',
        specialty: 'تقويم الأسنان',
        clinic: 'مستشفى بغداد للأسنان',
        rating: 4.9,
        reviews: 234,
        city: 'بغداد',
        available: true,
        avatar: '/api/placeholder/60/60'
      },
      {
        id: 2,
        name: 'د. فاطمة علي',
        specialty: 'زراعة الأسنان',
        clinic: 'مستشفى البصرة الدولي',
        rating: 4.8,
        reviews: 189,
        city: 'البصرة',
        available: false,
        avatar: '/api/placeholder/60/60'
      }
    ],
    clinics: [
      {
        id: 1,
        name: 'مستشفى بغداد للأسنان',
        address: 'شارع بابل، بغداد الجديدة',
        rating: 4.7,
        reviews: 156,
        services: ['تقويم', 'زراعة', 'تجميلي'],
        phone: '07701234567',
        isOpen: true
      },
      {
        id: 2,
        name: 'مستشفى البصرة الدولي',
        address: 'شارع إيران، البصرة',
        rating: 4.8,
        reviews: 203,
        services: ['زراعة', 'علاج جذور', 'جراحة'],
        phone: '07901234567',
        isOpen: true
      }
    ],
    articles: [
      {
        id: 1,
        title: 'دليل شامل للعناية بصحة الأسنان',
        excerpt: 'تعلم كيفية العناية بأسنانك بشكل صحيح وأفضل الممارسات...',
        author: 'د. سالم أحمد',
        date: '2025-01-10',
        readTime: '5 دقائق',
        category: 'العناية'
      },
      {
        id: 2,
        title: 'أحدث تقنيات زراعة الأسنان',
        excerpt: 'استكشف أحدث التقنيات في مجال زراعة الأسنان والابتكارات...',
        author: 'د. فاطمة علي',
        date: '2025-01-08',
        readTime: '7 دقائق',
        category: 'زراعة'
      }
    ],
    services: [
      {
        id: 1,
        name: 'حجز موعد سريع',
        description: 'احجز موعدك في خلال دقائق معدودة',
        icon: 'calendar',
        price: 'مجاني'
      },
      {
        id: 2,
        name: 'التشخيص الذكي',
        description: 'احصل على تشخيص مبدئي باستخدام الذكاء الاصطناعي',
        icon: 'brain',
        price: 'مجاني'
      }
    ]
  };

  useEffect(() => {
    performSearch();
  }, [searchQuery, filters]);

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    // محاكاة بحث
    await new Promise(resolve => setTimeout(resolve, 1000));

    let results: any[] = [];

    // بحث في الأطباء
    mockSearchResults.doctors.forEach(doctor => {
      if (doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.clinic.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({ ...doctor, type: 'doctor' });
      }
    });

    // بحث في العيادات
    mockSearchResults.clinics.forEach(clinic => {
      if (clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.address.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({ ...clinic, type: 'clinic' });
      }
    });

    // بحث في المقالات
    mockSearchResults.articles.forEach(article => {
      if (article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({ ...article, type: 'article' });
      }
    });

    // بحث في الخدمات
    mockSearchResults.services.forEach(service => {
      if (service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push({ ...service, type: 'service' });
      }
    });

    setSearchResults(results);
    setIsLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      performSearch();
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      doctor: 'bg-blue-100 text-blue-700',
      clinic: 'bg-green-100 text-green-700',
      article: 'bg-purple-100 text-purple-700',
      service: 'bg-orange-100 text-orange-700'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getTypeName = (type: string) => {
    const names = {
      doctor: 'طبيب',
      clinic: 'عيادة',
      article: 'مقال',
      service: 'خدمة'
    };
    return names[type as keyof typeof names] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Search Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">البحث</h1>
            <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن أطباء، عيادات، مقالات..."
                  className="w-full pr-14 pl-6 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                />
                <Button
                  type="submit"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2"
                  size="sm"
                >
                  بحث
                </Button>
              </div>
            </form>
          </div>

          {/* Search Filters */}
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-4 h-4 ml-2" />
                المرشحات
              </Button>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {searchResults.length} نتيجة
                </span>
                <div className="flex gap-2">
                  {searchTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setActiveFilter(type.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${activeFilter === type.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {type.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التخصص
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right">
                      <option value="all">جميع التخصصات</option>
                      {specialties.map(specialty => (
                        <option key={specialty} value={specialty}>
                          {specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المدينة
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right">
                      <option value="all">جميع المدن</option>
                      {cities.map(city => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التقييم
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-right">
                      <option value="all">جميع التقييمات</option>
                      <option value="5">5 نجوم</option>
                      <option value="4">4+ نجوم</option>
                      <option value="3">3+ نجوم</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Search Results */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">جاري البحث...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <Card key={index} hover className="p-6">
                  {result.type === 'doctor' && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">
                          {result.name.split(' ')[1]?.[0] || result.name[0]}
                        </span>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                              {getTypeName(result.type)}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{result.rating}</span>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{result.name}</h3>
                        </div>
                        <p className="text-gray-600 mb-2">{result.specialty} - {result.clinic}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>{result.governorate || result.address}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary">
                              <Eye className="w-4 h-4 ml-1" />
                              عرض الملف
                            </Button>
                            <Link to="/booking">
                              <Button size="sm" disabled={!result.available}>
                                <Calendar className="w-4 h-4 ml-1" />
                                حجز
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.type === 'clinic' && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                              {getTypeName(result.type)}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{result.rating}</span>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{result.name}</h3>
                        </div>
                        <p className="text-gray-600 mb-2">{result.address}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <span>{result.phone}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary">
                              الاتجاهات
                            </Button>
                            <Link to="/booking">
                              <Button size="sm">
                                <Calendar className="w-4 h-4 ml-1" />
                                حجز
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.type === 'article' && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                              {getTypeName(result.type)}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{result.readTime}</span>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{result.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-2">{result.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            {result.author} - {result.date}
                          </div>
                          <Link to={`/article/${result.id}`}>
                            <Button size="sm">
                              قراءة المقال
                              <ChevronRight className="w-4 h-4 mr-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.type === 'service' && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                              {getTypeName(result.type)}
                            </span>
                            <span className="text-sm font-medium text-green-600">
                              {result.price}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900">{result.name}</h3>
                        </div>
                        <p className="text-gray-600 mb-2">{result.description}</p>
                        <div className="text-left">
                          <Link to={result.id === 1 ? '/booking' : '/smart-diagnosis'}>
                            <Button size="sm">
                              استخدام الخدمة
                              <ChevronRight className="w-4 h-4 mr-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : searchQuery && !isLoading ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-600 mb-6">
                لم نجد أي نتائج للبحث عن "{searchQuery}". جرب كلمات مختلفة.
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>• تأكد من كتابة الكلمات بشكل صحيح</p>
                <p>• جرب كلمات مفتاحية أكثر عمومية</p>
                <p>• استخدم أرقام أقل في البحث</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">ابدأ البحث</h3>
              <p className="text-gray-600">
                ابحث عن أطباء، عيادات، مقالات، أو خدمات طبية
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};