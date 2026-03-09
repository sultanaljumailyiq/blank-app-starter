import React from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Star, 
  Clock, 
  ArrowLeft,
  Calendar,
  Navigation,
  Award,
  Users,
  Activity,
  Wifi,
  Car,
  Coffee
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const ClinicDetailPage: React.FC = () => {
  const { clinicId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // بيانات وهمية للعيادة
  const clinic = {
    id: clinicId || '1',
    name: searchParams.get('name') || 'عيادة الدكتور أحمد للأسنان',
    description: 'عيادة متخصصة في طب الأسنان بأحدث التقنيات والمرافق الحديثة. نوفر أفضل الخدمات الطبية للمرضى مع فريق طبي متميز.',
    rating: 4.9,
    reviews: 312,
    location: 'شارع الكرادة، بناية النور الطبية، الطابق الثالث، بغداد',
    phone: '+964 770 123 4567',
    email: 'info@ahmeddental.com',
    website: 'www.ahmeddental.com',
    workingHours: {
      weekdays: '9:00 ص - 10:00 م',
      friday: '2:00 م - 8:00 م',
      saturday: '9:00 ص - 10:00 م'
    },
    specialties: [
      'تقويم الأسنان',
      'زراعة الأسنان',
      'طب الأسنان التجميلي',
      'علاج الجذور',
      'أسنان الأطفال',
      'جراحة الفم'
    ],
    doctors: [
      {
        name: 'د. أحمد سالم',
        specialty: 'تقويم الأسنان',
        experience: '15 سنة',
        rating: 4.9
      },
      {
        name: 'د. فاطمة علي',
        specialty: 'زراعة الأسنان',
        experience: '12 سنة',
        rating: 4.8
      }
    ],
    facilities: [
      { icon: Car, name: 'موقف مجاني', description: 'مواقف سيارات متاحة مجاناً' },
      { icon: Wifi, name: 'واي فاي عالي السرعة', description: 'إنترنت مجاني عالي السرعة' },
      { icon: Users, name: 'صالة انتظار VIP', description: 'صالة انتظار مريحة ومفروشة' },
      { icon: Activity, name: 'معدات حديثة', description: 'أحدث التقنيات والأجهزة الطبية' },
      { icon: Award, name: 'معتمدة دولياً', description: 'شهادات اعتماد دولية' },
      { icon: Coffee, name: 'خدمة القهوة', description: 'خدمة القهوة والشاي المجانية' }
    ]
  };

  const handleBooking = () => {
    navigate(`/booking?clinicId=${clinic.id}&clinic=${encodeURIComponent(clinic.name)}`);
  };

  const handleDirections = () => {
    // فتح خرائط جوجل للاتجاهات
    const address = encodeURIComponent(clinic.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              رجوع
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">تفاصيل العيادة</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Clinic Info */}
              <Card className="p-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-2xl">
                      {clinic.name.split(' ')[1]?.[0] || 'A'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{clinic.name}</h2>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-semibold text-lg">{clinic.rating}</span>
                    <span className="text-gray-600">({clinic.reviews} تقييم)</span>
                  </div>
                </div>

                <p className="text-gray-700 text-center leading-relaxed mb-6">
                  {clinic.description}
                </p>

                {/* Specialties */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 text-right">التخصصات</h3>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {clinic.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Doctors */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 text-right">الأطباء</h3>
                  <div className="space-y-3">
                    {clinic.doctors.map((doctor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{doctor.rating}</span>
                          </div>
                          <span className="text-sm text-gray-600">{doctor.experience}</span>
                        </div>
                        <div className="text-right">
                          <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                          <p className="text-sm text-gray-600">{doctor.specialty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Facilities */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 text-right">المرافق والخدمات</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {clinic.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <facility.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="text-right">
                          <h4 className="font-semibold text-gray-900 text-sm">{facility.name}</h4>
                          <p className="text-xs text-gray-600">{facility.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">معلومات التواصل</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 text-right">
                      <p className="font-medium text-gray-900">العنوان</p>
                      <p className="text-sm text-gray-600">{clinic.location}</p>
                    </div>
                    <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-right">
                      <p className="font-medium text-gray-900">الهاتف</p>
                      <p className="text-sm text-gray-600">{clinic.phone}</p>
                    </div>
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-right">
                      <p className="font-medium text-gray-900">البريد الإلكتروني</p>
                      <p className="text-sm text-gray-600">{clinic.email}</p>
                    </div>
                    <div className="w-5 h-5 text-gray-400 flex-shrink-0 text-center text-sm">@</div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleDirections}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Navigation className="w-4 h-4" />
                    الاتجاهات
                  </Button>
                  <a
                    href={`tel:${clinic.phone}`}
                    className="flex-1"
                  >
                    <Button variant="secondary" size="sm" className="w-full flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      اتصال
                    </Button>
                  </a>
                </div>
              </Card>

              {/* Working Hours */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">ساعات العمل</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{clinic.workingHours.weekdays}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">الأحد - الخميس</span>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{clinic.workingHours.friday}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">الجمعة</span>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{clinic.workingHours.saturday}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">السبت</span>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Booking */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">حجز موعد سريع</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    احجز موعدك الآن واحصل على أفضل الخدمات
                  </p>
                  <Button 
                    onClick={handleBooking}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    <Calendar className="w-4 h-4 ml-2" />
                    احجز موعد الآن
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};