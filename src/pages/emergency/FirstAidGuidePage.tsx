import React, { useState } from 'react';
import { ArrowRight, Heart, CheckCircle, ChevronDown, ChevronUp, AlertTriangle, Zap, Shield, Stethoscope, Phone, Award, Info } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useNavigate } from 'react-router-dom';

interface FirstAidStep {
  id: number;
  text: string;
  completed: boolean;
}

interface FirstAidCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  severity: 'critical' | 'urgent' | 'normal';
  steps: FirstAidStep[];
  onStepsChange: (steps: FirstAidStep[]) => void;
  isExpanded: boolean;
  onToggle: () => void;
}

const FirstAidCard: React.FC<FirstAidCardProps> = ({
  title,
  icon,
  description,
  severity,
  steps,
  onStepsChange,
  isExpanded,
  onToggle
}) => {
  const handleStepToggle = (stepId: number) => {
    const updatedSteps = steps.map(step =>
      step.id === stepId
        ? { ...step, completed: !step.completed }
        : step
    );
    onStepsChange(updatedSteps);
  };

  const completionPercentage = Math.round((steps.filter(step => step.completed).length / steps.length) * 100);

  const severityStyles = {
    critical: {
      border: 'border-red-100',
      bg: 'bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      progress: 'bg-red-500'
    },
    urgent: {
      border: 'border-orange-100',
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      progress: 'bg-orange-500'
    },
    normal: {
      border: 'border-blue-100',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      progress: 'bg-blue-500'
    }
  };

  const currentStyle = severityStyles[severity];

  return (
    <div className={`group relative bg-white rounded-3xl border ${isExpanded ? 'border-blue-200 ring-4 ring-blue-50' : 'border-gray-200'} transition-all duration-300 hover:shadow-xl overflow-hidden`}>
      <div
        className="p-6 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${currentStyle.iconBg} ${currentStyle.iconColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
              {React.cloneElement(icon as React.ReactElement, { className: "w-8 h-8" })}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>
              <p className="text-gray-500 text-sm mb-3 font-medium">{description}</p>

              {/* Progress Status */}
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${currentStyle.progress}`}
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-500">{completionPercentage}% مكتمل</span>
              </div>
            </div>
          </div>

          <button className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors ${isExpanded ? 'rotate-180 bg-gray-50' : ''}`}>
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      <div className={`grid transition-all duration-300 ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-0">
            <div className="h-px w-full bg-gray-100 mb-6"></div>

            <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
              <CheckCircle className="w-4 h-4 text-green-500" />
              خطوات التعامل
            </h4>

            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  onClick={() => handleStepToggle(step.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${step.completed
                    ? 'bg-green-50 border-green-200'
                    : 'bg-white border-gray-100 hover:border-blue-200 hover:bg-blue-50/30'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${step.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'bg-transparent border-gray-300 text-gray-400'
                    }`}>
                    {step.completed ? <CheckCircle className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                  </div>
                  <p className={`text-sm font-medium transition-colors ${step.completed ? 'text-green-800 line-through opacity-75' : 'text-gray-700'}`}>
                    {step.text}
                  </p>
                </div>
              ))}
            </div>

            <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${currentStyle.bg} border ${currentStyle.border}`}>
              <Info className={`w-5 h-5 flex-shrink-0 ${currentStyle.iconColor}`} />
              <div>
                <p className={`text-sm font-bold ${currentStyle.iconColor} mb-1`}>نصيحة طبية</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  هذه الخطوات للإسعاف الأولي فقط. يجب زيارة الطبيب في أقرب وقت لتقييم الحالة بشكل كامل وتلقي العلاج المناسب.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FirstAidGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<string | null>('toothache'); // Default expand first one
  const [stepsData, setStepsData] = useState<{ [key: string]: FirstAidStep[] }>({
    toothache: [
      { id: 1, text: 'اشطف فمك بماء دافئ مالح لتطهير المنطقة.', completed: false },
      { id: 2, text: 'تناول مسكن للألم (مثل الإيبوبروفين) حسب التعليمات.', completed: false },
      { id: 3, text: 'استخدم خيط الأسنان بلطف لإزالة أي طعام عالق.', completed: false },
      { id: 4, text: 'ضع كمادة باردة على الوجه من الخارج لتقليل التورم.', completed: false },
    ],
    brokenTooth: [
      { id: 1, text: 'اجمع أي أجزاء مكسورة من السن واحفظها.', completed: false },
      { id: 2, text: 'اشطف فمك وأجزاء السن بماء دافئ.', completed: false },
      { id: 3, text: 'إذا كان هناك نزيف، اضغط بقطعة شاش نظيفة.', completed: false },
      { id: 4, text: 'توجه لطبيب الأسنان فوراً.', completed: false },
    ],
    bleeding: [
      { id: 1, text: 'اغسل يديك جيداً قبل لمس الفم.', completed: false },
      { id: 2, text: 'اشطف فمك بماء بارد لإبطاء تدفق الدم.', completed: false },
      { id: 3, text: 'عض على قطعة شاش نظيفة أو كيس شاي مبلل لمدة 15-20 دقيقة.', completed: false },
      { id: 4, text: 'تجنب المضمضة العنيفة أو البصق.', completed: false },
    ],
    swelling: [
      { id: 1, text: 'اجلس مع إبقاء رأسك مرفوعاً.', completed: false },
      { id: 2, text: 'ضع كمادة باردة على منطقة التورم (20 دقيقة وضع، 20 دقيقة راحة).', completed: false },
      { id: 3, text: 'اشطف فمك بماء دافئ وملح بحري.', completed: false },
      { id: 4, text: 'لا تضع الحرارة المباشرة على الوجه.', completed: false },
    ],
    knockedOutTooth: [
      { id: 1, text: 'أمسك السن من التاج (الجزء العلوي) ولا تلمس الجذر.', completed: false },
      { id: 2, text: 'إذا كان متسخاً، اشطفه بماء فاتر فقط (لا تفركه).', completed: false },
      { id: 3, text: 'حاول إعادة السن إلى مكانه في اللثة بلطف وعض على شاش.', completed: false },
      { id: 4, text: 'إذا لم تستطع، احفظ السن في كوب من الحليب البارد.', completed: false },
      { id: 5, text: 'هذه حالة طارئة جداً! اذهب للطبيب خلال 30 دقيقة.', completed: false },
    ],
    abscess: [
      { id: 1, text: 'مضمض بمحلول ملحي دافئ عدة مرات يومياً.', completed: false },
      { id: 2, text: 'لا تحاول فتح الخراج بنفسك.', completed: false },
      { id: 3, text: 'تناول مسكنات الألم عند الضرورة.', completed: false },
      { id: 4, text: 'حدد موعداً مع الطبيب فوراً لعلاج العدوى.', completed: false },
    ]
  });

  const firstAidCases = [
    {
      id: 'toothache',
      title: 'ألم الأسنان الحاد',
      icon: <Zap />,
      description: 'ألم مستمر أو نابض في الأسنان أو الفك.',
      severity: 'normal' as const,
      category: 'الألم والانزعاج'
    },
    {
      id: 'brokenTooth',
      title: 'كسر الأسنان',
      icon: <AlertTriangle />,
      description: 'تكسر أو تشقق جزء من السن.',
      severity: 'urgent' as const,
      category: 'الإصابات'
    },
    {
      id: 'bleeding',
      title: 'نزيف اللثة أو الفم',
      icon: <Heart />,
      description: 'نزيف مستمر بعد خلع أو إصابة.',
      severity: 'urgent' as const,
      category: 'النزيف'
    },
    {
      id: 'swelling',
      title: 'تورم الوجه',
      icon: <Shield />,
      description: 'انتفاخ في الخد أو اللثة قد يشير لالتهاب.',
      severity: 'urgent' as const,
      category: 'الألم والانزعاج'
    },
    {
      id: 'knockedOutTooth',
      title: 'سقوط السن (Avulsion)',
      icon: <Award />, // Using Award for "Golden Hour" importance? Or maybe Clock. Staying with generic for now.
      description: 'خروج السن الدائم بالكامل من مكانه.',
      severity: 'critical' as const,
      category: 'الإصابات'
    },
    {
      id: 'abscess',
      title: 'خراج الأسنان',
      icon: <Stethoscope />,
      description: 'تجمع صديدي مؤلم ناتج عن عدوى بكتيرية.',
      severity: 'critical' as const,
      category: 'العدوى'
    }
  ];

  const categories = [...new Set(firstAidCases.map(item => item.category))];

  const handleStepsChange = (caseId: string, newSteps: FirstAidStep[]) => {
    setStepsData(prev => ({
      ...prev,
      [caseId]: newSteps
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans" dir="rtl">
      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="sm" onClick={() => navigate('/services#tab-emergency')} className="text-gray-500 hover:text-gray-900">
                <ArrowRight className="w-4 h-4 ml-1" />
                عودة
              </Button>
              <div className="h-4 w-px bg-gray-200"></div>
              <span className="text-sm font-medium text-blue-600">مركز الطوارئ</span>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                  دليل <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-cyan-500">الإسعافات الأولية</span>
                </h1>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  دليل تفاعلي وسريع لمساعدتك في التعامل مع حالات طوارئ الأسنان الشائعة خطوة بخطوة حتى وصولك للطبيب.
                </p>

                <div className="flex gap-4">
                  <Button onClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })} className="rounded-xl px-6 py-3">
                    بدء الدليل
                  </Button>
                  <Button variant="outline" className="rounded-xl px-6 py-3" onClick={() => navigate('/emergency/centers')}>
                    أقرب مكز طوارئ
                  </Button>
                </div>
              </div>

              {/* Quick Stats/Tip */}
              <div className="w-full md:w-72 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900">طوارئ 24/7</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  في الحالات الحرجة جداً (مثل صعوبة التنفس)، اتصل بالإسعاف فوراً.
                </p>
                <div className="text-2xl font-black text-blue-600">122</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {categories.map((category) => (
            <section key={category}>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1.5 h-8 bg-blue-500 rounded-full"></span>
                <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {firstAidCases.filter(item => item.category === category).map((caseItem) => (
                  <FirstAidCard
                    key={caseItem.id}
                    title={caseItem.title}
                    icon={caseItem.icon}
                    description={caseItem.description}
                    severity={caseItem.severity}
                    steps={stepsData[caseItem.id] || []}
                    onStepsChange={(newSteps) => handleStepsChange(caseItem.id, newSteps)}
                    isExpanded={expandedCard === caseItem.id}
                    onToggle={() => setExpandedCard(expandedCard === caseItem.id ? null : caseItem.id)}
                  />
                ))}
              </div>
            </section>
          ))}

          {/* Disclaimer Card */}
          <div className="bg-gray-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold mb-4">إخلاء مسؤولية</h3>
              <p className="text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                المعلومات الواردة في هذا الدليل هي للإرشاد الأولي فقط ولا تغني بأي حال من الأحوال عن استشارة طبيب الأسنان المختص. نحن لسنا مسؤولين عن أي مضاعفات قد تنتج عن اتباع هذه النصائح.
              </p>
              <Button
                onClick={() => navigate('/emergency/centers')}
                className="bg-white text-gray-900 hover:bg-gray-100 border-none font-bold px-8 py-3 rounded-xl show-lg"
              >
                البحث عن طبيب الآن
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
