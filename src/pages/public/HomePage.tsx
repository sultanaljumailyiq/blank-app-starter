import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Shield,
  Award,
  Clock,
  Stethoscope,
  Users,
  ShoppingBag,
  TestTube,
  Settings,
  Building2
} from 'lucide-react';
import { InteractiveMap } from '../../components/public/InteractiveMap';
import { EducationalArticles } from '../../components/public/EducationalArticles';
import { usePlatform } from '../../contexts/PlatformContext';
import { usePublicClinics } from '../../hooks/usePublicClinics';

export const HomePage: React.FC = () => {
  const { settings } = usePlatform();
  const { clinics } = usePublicClinics();



  const stats = [
    { number: 'عيادات', label: 'عيادات قريبة منك' },
    { number: 'تشخيص', label: 'تشخيص ذكي' },
    { number: 'طوارئ', label: 'تعلم التعامل مع الحالات الطارئة' },
    { number: 'مقالات', label: 'ثقف نفسك بصحة الفم و الاسنان' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Hero Section - For Patients */}
      <section className="bg-gradient-to-br from-slate-50 via-white to-blue-50 text-gray-900 pt-24 pb-12 md:pt-32 md:pb-24 px-4 relative overflow-hidden">
        {/* Advanced Background Pattern */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          {/* Geometric Shapes */}
          <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-gradient-to-br from-blue-200/30 to-cyan-200/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          <div className="absolute top-1/4 right-0 w-48 h-48 md:w-80 md:h-80 bg-gradient-to-br from-teal-200/25 to-green-200/15 rounded-full blur-3xl transform translate-x-1/2 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 left-1/3 w-40 h-40 md:w-72 md:h-72 bg-gradient-to-br from-blue-300/20 to-indigo-200/15 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>

          {/* Modern Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        </div>

        {/* Floating Elements - Hidden on small mobile to prevent overflow/clutter */}
        <div className="hidden sm:block absolute top-20 right-20 w-4 h-4 bg-blue-500 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="hidden sm:block absolute bottom-32 left-16 w-3 h-3 bg-teal-400 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        <div className="hidden sm:block absolute top-1/3 left-10 w-2 h-2 bg-indigo-500 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '2.5s' }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              {/* Enhanced Text Content */}
              <div className="text-center lg:text-right space-y-6 md:space-y-8">
                <div className="space-y-3 md:space-y-4">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100/80 backdrop-blur-sm rounded-full text-blue-700 text-xs md:text-sm font-medium border border-blue-200/50">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                    {settings.platform_title_ar || 'منصة عيادة الأسنان الذكية'}
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 md:mb-8 leading-tight tracking-tight">
                    <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-blue-800 bg-clip-text text-transparent">
                      ابتسامتك
                    </span>
                    <span className="block bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mt-1">
                      أهميتنا
                    </span>
                  </h1>
                  <p className="text-lg md:text-2xl text-gray-600 leading-relaxed font-medium max-w-2xl mx-auto lg:mx-0">
                    احصل على أفضل رعاية طبية شاملة ومتكاملة مع أطباء الأسنان الخبراء في العراق
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/services" className="group w-full sm:w-auto">
                    <button className="relative w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:from-blue-700 group-hover:to-cyan-700">
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl md:rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></span>
                      <span className="relative flex items-center">
                        ابدأ رحلتك العلاجية
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </button>
                  </Link>
                  <Link to="/services#diagnosis" className="group w-full sm:w-auto">
                    <button className="relative w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-bold text-gray-700 bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl border-2 border-gray-200/50 hover:border-blue-300 hover:bg-white hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                      <span className="relative flex items-center">
                        تشخيص مجاني
                        <Stethoscope className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-600" />
                      </span>
                    </button>
                  </Link>
                </div>
              </div>


              {/* Modern Statistics Section */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 lg:mt-0">
                {[
                  {
                    number: 'عيادات',
                    label: 'عيادات قريبة',
                    href: '/services#tab-clinics',
                    color: 'from-green-500 to-emerald-500'
                  },
                  {
                    number: 'تشخيص',
                    label: 'تشخيص ذكي',
                    href: '/services#tab-diagnosis',
                    color: 'from-blue-500 to-cyan-500'
                  },
                  {
                    number: 'طوارئ',
                    label: 'حالات طارئة',
                    href: '/services#tab-emergency',
                    color: 'from-red-500 to-rose-500'
                  },
                  {
                    number: 'مقالات',
                    label: 'صحة الفم',
                    href: '/services#tab-articles',
                    color: 'from-purple-500 to-indigo-500'
                  }
                ].map((stat, index) => (
                  <Link
                    to={stat.href}
                    key={index}
                    className="group"
                  >
                    <div
                      className="group relative p-4 lg:p-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:bg-white/80 cursor-pointer h-full flex flex-col justify-center items-center"
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      {/* Glow Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10 rounded-2xl blur-xl group-hover:opacity-20 transition-all duration-500`}></div>

                      {/* Content */}
                      <div className="relative z-10 text-center">
                        <div className={`text-xl sm:text-2xl lg:text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1 `}>
                          {stat.number}
                        </div>
                        <div className="text-gray-600 font-semibold text-[10px] sm:text-xs leading-tight group-hover:text-gray-700 transition-colors">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Interactive Map Section - Filter by showOnMap setting */}
      <InteractiveMap clinics={clinics.filter(c => c.settings?.showOnMap === true)} />

      {/* Educational Articles Section */}
      <EducationalArticles />

      {/* Features Section - Why Choose Our Clinics */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              لماذا تختار عياداتنا؟
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              نقدم لك تجربة طبية استثنائية مع أحدث التقنيات وأفضل الأطباء
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-4xl mx-auto">
            {[
              { icon: <Shield className="w-4 h-4" />, title: 'خدمات آمنة', desc: 'معتمدة من وزارة الصحة', color: 'from-blue-500 to-cyan-500' },
              { icon: <Award className="w-4 h-4" />, title: 'أطباء معتمدين', desc: 'أفضل أطباء العراق', color: 'from-green-500 to-emerald-500' },
              { icon: <Clock className="w-4 h-4" />, title: 'خدمة 24/7', desc: 'متاحون في أي وقت', color: 'from-purple-500 to-indigo-500' },
              { icon: <CheckCircle className="w-4 h-4" />, title: 'ضمان الجودة', desc: 'أفضل جودة في الخدمة', color: 'from-orange-500 to-red-500' }
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105"
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mx-auto mb-2 text-white`}>
                  {feature.icon}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600 leading-tight">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
