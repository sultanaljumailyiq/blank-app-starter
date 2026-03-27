import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle, Heart, Zap, Shield, UserCheck, Phone, ChevronDown, ChevronUp, Stethoscope } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

interface ExpandableCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  description: string;
  severity?: 'high' | 'medium' | 'low';
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({ title, icon, children, description, severity = 'medium' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const severityStyles = {
    high: {
      bg: 'bg-red-50',
      border: 'border-red-100',
      text: 'text-red-900',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
    medium: {
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      text: 'text-orange-900',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    low: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-100',
      text: 'text-yellow-900',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  };

  const style = severityStyles[severity];

  return (
    <div className={`transition-all duration-300 rounded-2xl border ${isExpanded ? style.border : 'border-transparent'} ${isExpanded ? style.bg : 'bg-white'} hover:shadow-lg hover:bg-gray-50/80 group overflow-hidden shadow-sm`}>
      <div
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${style.iconBg} ${style.iconColor} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              {icon}
            </div>
            <div>
              <h3 className={`text-lg font-bold ${style.text} mb-1`}>{title}</h3>
              <p className="text-gray-500 text-sm">{description}</p>
            </div>
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-white shadow-sm rotate-180' : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'}`}>
            <ChevronDown className="w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-8 animate-in slide-in-from-top-2">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100/50">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

export const DentalEmergencyPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('pain');

  const sections = [
    {
      id: 'pain',
      title: 'إدارة الألم',
      icon: <Zap className="w-6 h-6 text-red-600" />,
      color: 'red'
    },
    {
      id: 'trauma',
      title: 'الحوادث والكسور',
      icon: <AlertCircle className="w-6 h-6 text-orange-600" />,
      color: 'orange'
    },
    {
      id: 'infections',
      title: 'العدوى والالتهابات',
      icon: <Shield className="w-6 h-6 text-yellow-600" />,
      color: 'yellow'
    },
    {
      id: 'procedures',
      title: 'إجراءات متقدمة',
      icon: <Stethoscope className="w-6 h-6 text-blue-600" />,
      color: 'blue'
    }
  ];

  // ... (Data arrays remain unchanged) ...

  const painManagementSteps = [
    {
      title: 'الألم الحاد في السن',
      steps: [
        'استخدم مسكنات الألم المتاحة بدون وصفة (إيبوبروفين أو باراسيتامول)',
        'تطبيق كمادات باردة على الوجه لمدة 15 دقيقة',
        'تجنب الأطعمة والمشروبات الساخنة والباردة جداً',
        'نظف المنطقة المتأثرة بلطف',
        'لا تستخدم الحرارة على المنطقة المتورمة'
      ],
      emergency: true
    },
    {
      title: 'الألم بعد علاج القناة الجذرية',
      steps: [
        'هذا الألم طبيعي لمدة 24-48 ساعة',
        'تناول الأدوية الموصوفة بانتظام',
        'تجنب مضغ الطعام الصلب على السن المعالج',
        'استخدام غسول الفم المطهر',
        'اتصل بالطبيب إذا استمر الألم أكثر من 3 أيام'
      ],
      emergency: false
    },
    {
      title: 'ألم بعد خلع السن',
      steps: [
        'نزف طفيف طبيعي في الساعات الأولى',
        'لا تشطف الفم بقوة خلال 24 ساعة',
        'تناول الأدوية المسكنة حسب التوجيهات',
        'تجنب التدخين والكحول',
        'استخدام أكياس الثلج للتحكم في التورم'
      ],
      emergency: false
    }
  ];

  const traumaProcedures = [
    {
      title: 'كسر أو خلع السن بالكامل',
      steps: [
        'أمسك السن من التاج وليس الجذر',
        'اشطف السن بلطف بماء فاتر',
        'أعد السن في مكانه إن أمكن',
        'إذا لم يكن ذلك ممكناً، احفظ السن في حليب أو ماء',
        'اذهب لطبيب الأسنان خلال 30 دقيقة'
      ],
      emergency: true
    },
    {
      title: 'جرح في الفم أو اللثة',
      steps: [
        'اشطف فمك بماء دافئ مالح',
        'اضغط بشاش نظيف على الجرح لمدة 10-15 دقيقة',
        'استخدم كمادات باردة من الخارج',
        'لا تحاول إزالة أي شظايا ملتصقة',
        'راجع الطوارئ في حالة نزيف شديد'
      ],
      emergency: true
    },
    {
      title: 'إصابة في الوجه أو الفك',
      steps: [
        'تقييم شدة الإصابة بصرياً',
        'تطبيق كمادات باردة على المنطقة المتأثرة',
        'لا تحرك الفك أو الفم بقوة',
        'تناول مسكنات الألم للسيطرة على الألم',
        'اذهب لأقرب قسم طوارئ فوراً'
      ],
      emergency: true
    }
  ];

  const infectionSteps = [
    {
      title: 'خراج في اللثة',
      steps: [
        'تورم مع ألم شديد',
        'استخدم غسول الفم بماء مالح دافئ',
        'تطبيق كمادات باردة',
        'تناول مضاد حيوي (إذا كان موصوفاً)',
        'راجع طبيب الأسنان فوراً'
      ],
      emergency: true
    },
    {
      title: 'تورم الوجه من عدوى الأسنان',
      steps: [
        'تورم في الخد أو الفك',
        'صعوبة في فتح الفم',
        'ارتفاع في درجة الحرارة',
        'تناول مضاد حيوي حسب الوصفة',
        'اذهب للطوارئ إذا تضخم التورم بسرعة'
      ],
      emergency: true
    }
  ];

  const advancedProcedures = [
    {
      title: 'إعادة زراعة السن المخلوع',
      steps: [
        'لا تنظف السن المخلوع',
        'حفظ السن في محلول ملحي أو حليب',
        'إعادة الزرع خلال 30 دقيقة',
        'تثبيت السن بسلك مؤقت',
        'راجع طبيب الأسنان فوراً'
      ],
      emergency: true
    },
    {
      title: 'إدارة النزيف المفرط',
      steps: [
        'استخدام ضمادة شاش نظيفة',
        'الضغط المستمر لمدة 15-20 دقيقة',
        'استبدال الشاش بآخر جديد عند الحاجة',
        'تطبيق ضغط مباشر',
        'راجع الطوارئ إذا لم يتوقف النزيف'
      ],
      emergency: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-right" dir="rtl">
      {/* Header - White Theme */}
      <div className="bg-white border-b border-gray-200 py-8 px-4 relative overflow-hidden">
        {/* Simple background pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute right-0 top-0 w-64 h-64 bg-red-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div className="container mx-auto relative z-10">
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-100">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              طوارئ 24/7
            </span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">طوارئ الأسنان والإسعافات الأولية</h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              دليل شامل للتعامل مع الحالات الطارئة، إدارة الألم، والإجراءات الفورية لحماية صحة الفم والأسنان.
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contact Banner */}
      <div className="container mx-auto px-4 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-lg border border-red-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100 shadow-inner">
              <Phone className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">هل تحتاج لمساعدة فورية؟</h3>
              <p className="text-gray-500">فريق الطوارئ متاح على مدار الساعة لتقديم الدعم</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <a href="tel:+9647700000000" className="w-full md:w-auto">
              <Button className="bg-red-600 hover:bg-red-700 text-white w-full md:w-auto shadow-lg shadow-red-200 h-12 px-6 text-lg" size="lg">
                <Phone className="w-5 h-5 ml-2" />
                اتصال بالطوارئ
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* Section Navigation */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center gap-4 group ${activeSection === section.id
                  ? `border-${section.color}-100 bg-white ring-4 ring-${section.color}-50 shadow-lg scale-105`
                  : 'border-transparent bg-white shadow-sm hover:shadow-md hover:-translate-y-1'
                  }`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${activeSection === section.id ? `bg-${section.color}-100 text-${section.color}-600 scale-110` : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                  }`}>
                  {React.cloneElement(section.icon as React.ReactElement, {
                    className: `w-7 h-7 ${activeSection === section.id ? '' : 'text-gray-400 group-hover:text-gray-600'}`
                  })}
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-1 transition-colors ${activeSection === section.id ? 'text-gray-900' : 'text-gray-600'}`}>
                    {section.title}
                  </h3>
                  <div className={`h-1 w-8 mx-auto rounded-full transition-all duration-300 ${activeSection === section.id ? `bg-${section.color}-500 w-16` : 'bg-transparent'}`}></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section Content */}
        <div className="max-w-6xl mx-auto min-h-[400px]">
          {activeSection === 'pain' && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="mb-8 flex items-end gap-4 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center shadow-inner">
                  <Zap className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">إدارة الألم</h2>
                  <p className="text-xl text-gray-500">بروتوكولات التعامل مع آلام الأسنان الحادة</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {painManagementSteps.map((item, index) => (
                  <ExpandableCard
                    key={index}
                    title={item.title}
                    icon={<Zap className={`w-6 h-6 ${item.emergency ? 'text-red-500' : 'text-orange-500'}`} />}
                    description={item.emergency ? "حالة طارئة تتطلب تدخلاً فورياً" : "إجراءات تخفيف الألم المنزلي"}
                    severity={item.emergency ? 'high' : 'medium'}
                  >
                    <div className="pt-2">
                      <ol className="space-y-3">
                        {item.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100/50">
                            <span className="flex-shrink-0 w-6 h-6 bg-white border border-gray-200 text-gray-500 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm mt-1">
                              {stepIndex + 1}
                            </span>
                            <span className="text-gray-700 leading-relaxed font-medium text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </ExpandableCard>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'trauma' && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="mb-8 flex items-end gap-4 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center shadow-inner">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">الحوادث والكسور</h2>
                  <p className="text-xl text-gray-500">الإسعافات الأولية لحوادث الأسنان والفكين</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {traumaProcedures.map((item, index) => (
                  <ExpandableCard
                    key={index}
                    title={item.title}
                    icon={<AlertCircle className="w-6 h-6 text-orange-600" />}
                    description="إجراءات فورية للحد من الضرر"
                    severity="high"
                  >
                    <div className="pt-2">
                      <ol className="space-y-3">
                        {item.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100/50">
                            <span className="flex-shrink-0 w-6 h-6 bg-white border border-gray-200 text-gray-500 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm mt-1">
                              {stepIndex + 1}
                            </span>
                            <span className="text-gray-700 leading-relaxed font-medium text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </ExpandableCard>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'infections' && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="mb-8 flex items-end gap-4 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center shadow-inner">
                  <Shield className="w-8 h-8 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">العدوى والالتهابات</h2>
                  <p className="text-xl text-gray-500">علامات وإجراءات التعامل مع الالتهابات</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {infectionSteps.map((item, index) => (
                  <ExpandableCard
                    key={index}
                    title={item.title}
                    icon={<Shield className="w-6 h-6 text-yellow-600" />}
                    description="التعامل مع التورم والخراجات"
                    severity="high"
                  >
                    <div className="pt-2">
                      <ol className="space-y-3">
                        {item.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100/50">
                            <span className="flex-shrink-0 w-6 h-6 bg-white border border-gray-200 text-gray-500 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm mt-1">
                              {stepIndex + 1}
                            </span>
                            <span className="text-gray-700 leading-relaxed font-medium text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </ExpandableCard>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'procedures' && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="mb-8 flex items-end gap-4 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center shadow-inner">
                  <Stethoscope className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-2">إجراءات متقدمة</h2>
                  <p className="text-xl text-gray-500">خطوات تخصصية للحفاظ على الأسنان</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {advancedProcedures.map((item, index) => (
                  <ExpandableCard
                    key={index}
                    title={item.title}
                    icon={<Stethoscope className="w-6 h-6 text-blue-600" />}
                    description="إرشادات طبية دقيقة"
                    severity="high"
                  >
                    <div className="pt-2">
                      <ol className="space-y-3">
                        {item.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100/50">
                            <span className="flex-shrink-0 w-6 h-6 bg-white border border-gray-200 text-gray-500 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm mt-1">
                              {stepIndex + 1}
                            </span>
                            <span className="text-gray-700 leading-relaxed font-medium text-sm">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </ExpandableCard>
                ))}
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};
