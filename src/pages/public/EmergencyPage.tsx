import React, { useState } from 'react';
import {
  AlertCircle,
  Phone,
  MapPin,
  Clock,
  Heart,
  Activity,
  Zap,
  MessageCircle,
  UserCheck,
  ArrowRight,
  Calendar,
  Navigation
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Link } from 'react-router-dom';

export const EmergencyPage: React.FC = () => {
  const [selectedEmergency, setSelectedEmergency] = useState<string | null>(null);
  const [location, setLocation] = useState('');

  const emergencyTypes = [
    {
      id: 'severe-pain',
      title: 'ألم حاد لا يطاق',
      icon: AlertCircle,
      severity: 'عالي',
      color: 'red',
      description: 'ألم شديد في الأسنان أو اللثة',
      timeFrame: 'فوري - خلال 30 دقيقة',
      actions: [
        'تطبيق كمادات باردة على الخد',
        'تجنب الأطعمة والمشروبات الساخنة',
        'تناول مسكن للآلام إذا لزم الأمر'
      ]
    },
    {
      id: 'bleeding',
      title: 'نزيف حاد',
      icon: Heart,
      severity: 'عالي',
      color: 'red',
      description: 'نزيف شديد أو مستمر',
      timeFrame: 'فوري - خلال 30 دقيقة',
      actions: [
        'الضغط على المنطقة بقطعة قماش نظيفة',
        'الماء المالح للفم (إذا لم يكن هناك نزيف حاد)',
        'تجنب المضمضة القوية'
      ]
    },
    {
      id: 'trauma',
      title: 'إصابة أو كسر في السن',
      icon: Activity,
      severity: 'متوسط',
      color: 'orange',
      description: 'كسر أو خلع في السن بسبب صدمة',
      timeFrame: 'مستعجل - خلال ساعة',
      actions: [
        'البحث عن السن المفقود إن أمكن',
        'شطف الفم بالماء الفاتر',
        'تجنب لمس المنطقة المصابة'
      ]
    },
    {
      id: 'swelling',
      title: 'تورم شديد',
      icon: Zap,
      severity: 'متوسط',
      color: 'orange',
      description: 'تورم في الوجه أو اللثة',
      timeFrame: 'مستعجل - خلال ساعة',
      actions: [
        'كمادات باردة على المنطقة المنتفخة',
        'رفع الرأس عند النوم',
        'تجنب الأطعمة الصلبة'
      ]
    }
  ];

  const nearbyEmergencyClinics = [
    {
      name: 'مستشفى بغداد للأسنان - طوارئ',
      address: 'شارع بابل، بغداد الجديدة',
      phone: '07701234567',
      distance: '0.8 كم',
      isOpen: true,
      rating: 4.8,
      openHours: '24/7'
    },
    {
      name: 'مستشفى الشهيد الأولى - طوارئ',
      address: 'شارع الأردن، الكاظمية',
      phone: '07901234567',
      distance: '1.2 كم',
      isOpen: true,
      rating: 4.6,
      openHours: '24/7'
    },
    {
      name: 'مستشفى الرسول الأعظم - طوارئ',
      address: 'شارع الكوفة، الكوفة',
      phone: '07601234567',
      distance: '2.1 كم',
      isOpen: false,
      rating: 4.7,
      openHours: '6 صباحاً - 11 مساءً'
    }
  ];

  const getColorClasses = (color: string, type: 'bg' | 'text' | 'border') => {
    const colorMap = {
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-200'
      },
      orange: {
        bg: 'bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-200'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200'
      }
    };
    return colorMap[color as keyof typeof colorMap][type];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">الطوارئ والعيادات العاجلة</h1>
            <p className="text-xl text-gray-600">
              في حالة الطوارئ، احصل على المساعدة الفورية من أقرب عيادة
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Emergency Types */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">أنواع الطوارئ</h2>

              {emergencyTypes.map((emergency) => (
                <Card
                  key={emergency.id}
                  hover
                  className={`p-6 cursor-pointer transition-all ${selectedEmergency === emergency.id
                    ? `${getColorClasses(emergency.color, 'bg')} ${getColorClasses(emergency.color, 'border')} border-2`
                    : 'hover:shadow-lg'
                    }`}
                  onClick={() => setSelectedEmergency(
                    selectedEmergency === emergency.id ? null : emergency.id
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getColorClasses(emergency.color, 'bg')}`}>
                      <emergency.icon className={`w-6 h-6 ${getColorClasses(emergency.color, 'text')}`} />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${emergency.severity === 'عالي'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-orange-100 text-orange-600'
                            }`}>
                            {emergency.severity}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {emergency.timeFrame}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{emergency.title}</h3>
                      <p className="text-gray-600 mb-4">{emergency.description}</p>

                      {selectedEmergency === emergency.id && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-gray-900 mb-3">الإجراءات الفورية:</h4>
                          <ul className="space-y-2">
                            {emergency.actions.map((action, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Emergency Contact & Nearby Clinics */}
            <div className="space-y-6">
              {/* Emergency Contact */}
              <Card className="p-6 bg-red-50 border-red-200">
                <div className="text-center">
                  <Phone className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-900 mb-2">اتصال طوارئ فوري</h3>
                  <p className="text-red-700 mb-4">خط الطوارئ 24/7</p>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white mb-3">
                    <Phone className="w-4 h-4 ml-2" />
                    0800 123 456
                  </Button>
                  <Link to="/booking">
                    <Button variant="secondary" className="w-full">
                      <Calendar className="w-4 h-4 ml-2" />
                      حجز موعد عاجل
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Location Search */}
              <Card className="p-4">
                <h3 className="font-bold text-gray-900 mb-3 text-right">تحديد موقعك</h3>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-shrink-0">
                    <Navigation className="w-4 h-4" />
                  </Button>
                  <input
                    type="text"
                    placeholder="أدخل عنوانك..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-right text-sm"
                  />
                </div>
              </Card>

              {/* Nearby Emergency Clinics */}
              <Card className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-right">عيادات قريبة للحوادث</h3>
                <div className="space-y-4">
                  {nearbyEmergencyClinics.map((clinic, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{clinic.distance}</span>
                          <div className={`w-2 h-2 rounded-full ${clinic.isOpen ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                        </div>
                        <div className="flex-1 text-right">
                          <h4 className="font-semibold text-gray-900 text-sm">{clinic.name}</h4>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 text-right">{clinic.address}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-yellow-600">★ {clinic.rating}</span>
                          <span className="text-xs text-gray-500">({clinic.openHours})</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="secondary" className="text-xs px-2 py-1">
                            <Phone className="w-3 h-3 ml-1" />
                            {clinic.phone}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};