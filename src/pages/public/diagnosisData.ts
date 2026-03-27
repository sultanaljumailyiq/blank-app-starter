import { Activity, AlertCircle, Zap, Smile, Stethoscope } from 'lucide-react';

export const commonConditions = [
    { id: 'tooth_pain', title: 'ألم في الأسنان', icon: Activity, color: 'from-red-500 to-rose-600' },
    { id: 'gum_bleeding', title: 'نزيف اللثة', icon: Activity, color: 'from-pink-500 to-red-500' },
    { id: 'bad_breath', title: 'رائحة الفم', icon: AlertCircle, color: 'from-amber-500 to-orange-600' },
    { id: 'sensitivity', title: 'حساسية الأسنان', icon: Zap, color: 'from-blue-500 to-cyan-600' },
    { id: 'cosmetic', title: 'تجميل وابتسامة', icon: Smile, color: 'from-purple-500 to-violet-600' },
    { id: 'checkup', title: 'فحص دوري', icon: Stethoscope, color: 'from-emerald-500 to-green-600' },
];

export interface DiagnosisQuestion {
    question: string;
    options: { id: string; text: string }[];
}

// بيانات المريض
export interface PatientInfo {
    ageGroup: string;
    sex: string;
}

export interface MedicalCondition {
    id: string;
    label: string;
    icon: string;
    impactDescription: string;
}

export const ageGroups = [
    { id: 'child', label: 'أقل من 12 سنة', icon: '👶' },
    { id: 'teen', label: '12 - 17 سنة', icon: '🧒' },
    { id: 'young', label: '18 - 35 سنة', icon: '🧑' },
    { id: 'middle', label: '36 - 55 سنة', icon: '👨' },
    { id: 'senior', label: 'فوق 55 سنة', icon: '👴' },
];

export const sexOptions = [
    { id: 'male', label: 'ذكر', icon: '♂️' },
    { id: 'female', label: 'أنثى', icon: '♀️' },
];

export const medicalConditions: MedicalCondition[] = [
    { id: 'diabetes', label: 'السكري', icon: '🩸', impactDescription: 'يؤثر على التئام الجروح وصحة اللثة' },
    { id: 'heart', label: 'أمراض القلب أو الضغط', icon: '❤️', impactDescription: 'قد يؤثر على بعض الإجراءات' },
    { id: 'blood_thinners', label: 'أدوية مميعة للدم', icon: '💊', impactDescription: 'يؤثر على النزيف أثناء العلاج' },
    { id: 'drug_allergy', label: 'حساسية من أدوية معينة', icon: '⚠️', impactDescription: 'ضرورة إبلاغ الطبيب' },
    { id: 'pregnancy', label: 'حمل حالي', icon: '🤰', impactDescription: 'يؤثر على نوع الأشعة والأدوية' },
    { id: 'smoking', label: 'تدخين', icon: '🚬', impactDescription: 'يؤثر سلباً على صحة الفم واللثة' },
    { id: 'osteoporosis', label: 'هشاشة العظام', icon: '🦴', impactDescription: 'يؤثر على عظام الفك والزرع' },
    { id: 'immune', label: 'ضعف مناعة أو علاج كيماوي', icon: '🛡️', impactDescription: 'يؤثر على التئام الأنسجة' },
];

export const questionSets: Record<string, DiagnosisQuestion[]> = {
    tooth_pain: [
        {
            question: "منذ متى تشعر بالألم؟", options: [
                { id: 'today', text: 'بدأ اليوم' }, { id: 'days', text: 'منذ أيام قليلة' },
                { id: 'week', text: 'منذ أسبوع أو أكثر' }, { id: 'month', text: 'منذ أكثر من شهر' }
            ]
        },
        {
            question: "أين يتركز الألم بالضبط؟", options: [
                { id: 'single', text: 'سن واحد محدد' }, { id: 'area', text: 'منطقة كاملة (عدة أسنان)' },
                { id: 'jaw', text: 'الفك بالكامل' }, { id: 'mixed', text: 'ينتقل بين عدة أماكن' }
            ]
        },
        {
            question: "كيف تصف شدة الألم من 1 إلى 10؟", options: [
                { id: 'mild', text: 'خفيف (1-3) يمكن تحمله' }, { id: 'moderate', text: 'متوسط (4-6) مزعج' },
                { id: 'severe', text: 'شديد (7-8) يؤثر على يومي' }, { id: 'extreme', text: 'لا يُحتمل (9-10) يمنعني من النوم' }
            ]
        },
        {
            question: "هل يزداد الألم مع المشروبات الباردة أو الساخنة؟", options: [
                { id: 'cold', text: 'نعم، مع البارد فقط' }, { id: 'hot', text: 'نعم، مع الساخن فقط' },
                { id: 'both', text: 'مع البارد والساخن معاً' }, { id: 'none', text: 'لا يتأثر بدرجة الحرارة' }
            ]
        },
        {
            question: "هل يزداد الألم عند العض أو المضغ؟", options: [
                { id: 'yes_always', text: 'نعم، دائماً عند المضغ' }, { id: 'sometimes', text: 'أحياناً فقط' },
                { id: 'specific', text: 'عند العض على شيء صلب فقط' }, { id: 'no', text: 'لا علاقة بالمضغ' }
            ]
        },
        {
            question: "هل تلاحظ أي تورم في اللثة أو الوجه؟", options: [
                { id: 'gum_swelling', text: 'تورم في اللثة حول السن' }, { id: 'face_swelling', text: 'تورم في الوجه أو الخد' },
                { id: 'both', text: 'تورم في اللثة والوجه معاً' }, { id: 'none', text: 'لا يوجد أي تورم' }
            ]
        },
        {
            question: "هل لاحظت أي تغير في لون السن المؤلم؟", options: [
                { id: 'dark', text: 'أصبح داكناً أو رمادياً' }, { id: 'brown', text: 'ظهور بقع بنية أو سوداء' },
                { id: 'yellow', text: 'أصفر أكثر من المعتاد' }, { id: 'normal', text: 'لونه طبيعي' }
            ]
        },
        {
            question: "هل يوقظك الألم من النوم ليلاً؟", options: [
                { id: 'always', text: 'نعم، كل ليلة تقريباً' }, { id: 'sometimes', text: 'أحياناً فقط' },
                { id: 'lying', text: 'يزداد عند الاستلقاء فقط' }, { id: 'no', text: 'لا يؤثر على نومي' }
            ]
        },
        {
            question: "هل هناك خراج أو قيح (صديد) حول السن؟", options: [
                { id: 'yes', text: 'نعم، أرى تجمع قيح' }, { id: 'taste', text: 'لا أراه لكن أشعر بطعم سيء' },
                { id: 'burst', text: 'كان موجوداً وانفجر' }, { id: 'no', text: 'لا يوجد' }
            ]
        },
        {
            question: "هل سبق أن عالجت هذا السن من قبل؟", options: [
                { id: 'filling', text: 'نعم، حشوة سابقة' }, { id: 'root_canal', text: 'نعم، علاج عصب سابق' },
                { id: 'crown', text: 'نعم، تلبيسة أو تاج' }, { id: 'never', text: 'لم يُعالج من قبل' }
            ]
        },
        {
            question: "هل تتناول مسكنات حالياً؟ وهل تفيد؟", options: [
                { id: 'helps', text: 'نعم وتخفف الألم مؤقتاً' }, { id: 'no_help', text: 'نعم لكن لا تفيد كثيراً' },
                { id: 'not_taking', text: 'لا أتناول مسكنات' }, { id: 'afraid', text: 'لا أعرف أيها مناسب' }
            ]
        },
        {
            question: "هل لديك حالات صحية مزمنة؟", options: [
                { id: 'diabetes', text: 'سكري' }, { id: 'heart', text: 'أمراض قلب أو ضغط' },
                { id: 'other', text: 'حالات أخرى' }, { id: 'none', text: 'لا توجد أمراض مزمنة' }
            ]
        }
    ],
    gum_bleeding: [
        {
            question: "منذ متى تلاحظ نزيف اللثة؟", options: [
                { id: 'recent', text: 'بدأ مؤخراً (أيام)' }, { id: 'weeks', text: 'منذ أسابيع' },
                { id: 'months', text: 'منذ أشهر' }, { id: 'years', text: 'منذ سنوات' }
            ]
        },
        {
            question: "متى يحدث النزيف عادة؟", options: [
                { id: 'brushing', text: 'عند تنظيف الأسنان' }, { id: 'eating', text: 'عند الأكل' },
                { id: 'spontaneous', text: 'بدون سبب واضح' }, { id: 'touch', text: 'عند لمس اللثة' }
            ]
        },
        {
            question: "ما كمية النزيف التي تلاحظها؟", options: [
                { id: 'trace', text: 'آثار بسيطة على الفرشاة' }, { id: 'moderate', text: 'دم واضح عند البصق' },
                { id: 'heavy', text: 'نزيف غزير يستمر دقائق' }, { id: 'continuous', text: 'نزيف لا يتوقف بسهولة' }
            ]
        },
        {
            question: "هل تلاحظ تورماً أو احمراراً في اللثة؟", options: [
                { id: 'red_swollen', text: 'حمراء ومنتفخة' }, { id: 'red_only', text: 'حمراء لكن غير منتفخة' },
                { id: 'localized', text: 'في منطقة محددة فقط' }, { id: 'normal', text: 'تبدو طبيعية' }
            ]
        },
        {
            question: "هل تشعر بألم في اللثة؟", options: [
                { id: 'constant', text: 'ألم مستمر' }, { id: 'when_touched', text: 'عند لمسها أو تنظيفها فقط' },
                { id: 'eating_pain', text: 'عند الأكل' }, { id: 'no_pain', text: 'لا يوجد ألم' }
            ]
        },
        {
            question: "هل لاحظت انحسار اللثة أو ظهور جذور الأسنان؟", options: [
                { id: 'yes_visible', text: 'نعم، واضح جداً' }, { id: 'slight', text: 'بشكل بسيط' },
                { id: 'not_sure', text: 'لست متأكداً' }, { id: 'no', text: 'لا' }
            ]
        },
        {
            question: "كم مرة تنظف أسنانك يومياً؟", options: [
                { id: 'twice_plus', text: 'مرتين أو أكثر' }, { id: 'once', text: 'مرة واحدة' },
                { id: 'irregular', text: 'بشكل غير منتظم' }, { id: 'rarely', text: 'نادراً' }
            ]
        },
        {
            question: "هل تستخدم خيط الأسنان أو غسول الفم؟", options: [
                { id: 'both', text: 'أستخدم كليهما' }, { id: 'floss', text: 'خيط الأسنان فقط' },
                { id: 'mouthwash', text: 'غسول الفم فقط' }, { id: 'neither', text: 'لا أستخدم أياً منهما' }
            ]
        },
        {
            question: "هل تدخن أو تستخدم التبغ؟", options: [
                { id: 'smoker', text: 'نعم، مدخن حالياً' }, { id: 'former', text: 'مدخن سابق' },
                { id: 'hookah', text: 'أرجيلة أو سجائر إلكترونية' }, { id: 'no', text: 'لا' }
            ]
        },
        {
            question: "هل تشعر بأن أسنانك أصبحت تتحرك أو تهتز؟", options: [
                { id: 'yes_loose', text: 'نعم، واضح' }, { id: 'slight', text: 'حركة بسيطة جداً' },
                { id: 'one_tooth', text: 'سن واحد فقط' }, { id: 'stable', text: 'ثابتة تماماً' }
            ]
        }
    ],
    bad_breath: [
        {
            question: "منذ متى تعاني من رائحة الفم؟", options: [
                { id: 'recent', text: 'مؤخراً فقط' }, { id: 'months', text: 'منذ عدة أشهر' },
                { id: 'years', text: 'منذ سنوات' }, { id: 'always', text: 'دائماً' }
            ]
        },
        {
            question: "متى تكون الرائحة أسوأ؟", options: [
                { id: 'morning', text: 'عند الاستيقاظ صباحاً' }, { id: 'after_eating', text: 'بعد الأكل' },
                { id: 'all_day', text: 'طوال اليوم' }, { id: 'evening', text: 'في المساء' }
            ]
        },
        {
            question: "هل أخبرك أحد عن الرائحة أم لاحظتها بنفسك؟", options: [
                { id: 'others', text: 'أخبرني آخرون' }, { id: 'self', text: 'لاحظتها بنفسي' },
                { id: 'both', text: 'كلاهما' }, { id: 'unsure', text: 'لست متأكداً تماماً' }
            ]
        },
        {
            question: "هل لديك جفاف في الفم؟", options: [
                { id: 'always_dry', text: 'جفاف مستمر' }, { id: 'sometimes', text: 'أحياناً خاصة ليلاً' },
                { id: 'medications', text: 'بسبب أدوية أتناولها' }, { id: 'no', text: 'لا' }
            ]
        },
        {
            question: "هل تعاني من نزيف في اللثة؟", options: [
                { id: 'yes_frequent', text: 'نعم، بشكل متكرر' }, { id: 'sometimes', text: 'أحياناً' },
                { id: 'rarely', text: 'نادراً' }, { id: 'no', text: 'لا' }
            ]
        },
        {
            question: "هل لديك تسوسات أو حشوات قديمة؟", options: [
                { id: 'cavities', text: 'تسوسات غير معالجة' }, { id: 'old_fillings', text: 'حشوات قديمة' },
                { id: 'both', text: 'كلاهما' }, { id: 'none', text: 'لا' }
            ]
        },
        {
            question: "هل تنظف لسانك عند تنظيف أسنانك؟", options: [
                { id: 'always', text: 'دائماً' }, { id: 'sometimes', text: 'أحياناً' },
                { id: 'rarely', text: 'نادراً' }, { id: 'never', text: 'لا أنظفه أبداً' }
            ]
        },
        {
            question: "هل تعاني من مشاكل في المعدة أو ارتجاع؟", options: [
                { id: 'reflux', text: 'ارتجاع مريئي' }, { id: 'gastritis', text: 'التهاب معدة' },
                { id: 'sometimes', text: 'مشاكل هضمية أحياناً' }, { id: 'no', text: 'لا' }
            ]
        },
        {
            question: "هل تعاني من التهاب في اللوزتين أو الجيوب الأنفية؟", options: [
                { id: 'tonsils', text: 'التهاب لوزتين متكرر' }, { id: 'sinusitis', text: 'التهاب جيوب أنفية' },
                { id: 'post_nasal', text: 'إفرازات خلف الأنف' }, { id: 'no', text: 'لا' }
            ]
        },
        {
            question: "كم كوب ماء تشرب يومياً تقريباً؟", options: [
                { id: 'less_4', text: 'أقل من 4 أكواب' }, { id: '4_6', text: '4-6 أكواب' },
                { id: '6_8', text: '6-8 أكواب' }, { id: 'more_8', text: 'أكثر من 8 أكواب' }
            ]
        }
    ],
    sensitivity: [
        {
            question: "منذ متى تعاني من حساسية الأسنان؟", options: [
                { id: 'recent', text: 'بدأت مؤخراً' }, { id: 'months', text: 'منذ أشهر' },
                { id: 'years', text: 'منذ سنوات' }, { id: 'after_treatment', text: 'بعد علاج أسنان' }
            ]
        },
        {
            question: "ما الذي يثير الحساسية أكثر؟", options: [
                { id: 'cold', text: 'المشروبات والأطعمة الباردة' }, { id: 'hot', text: 'المشروبات الساخنة' },
                { id: 'sweet', text: 'الحلويات والسكريات' }, { id: 'air', text: 'الهواء البارد' }
            ]
        },
        {
            question: "كم يستمر الألم بعد المؤثر؟", options: [
                { id: 'seconds', text: 'ثوانٍ ثم يختفي' }, { id: 'minutes', text: 'دقائق قليلة' },
                { id: 'long', text: 'يستمر طويلاً (أكثر من 30 ثانية)' }, { id: 'lingering', text: 'يبقى حتى بعد إزالة المؤثر' }
            ]
        },
        {
            question: "كم عدد الأسنان المتأثرة؟", options: [
                { id: 'one', text: 'سن واحد' }, { id: 'few', text: '2-3 أسنان' },
                { id: 'many', text: 'عدة أسنان' }, { id: 'all', text: 'معظم الأسنان' }
            ]
        },
        {
            question: "هل تلاحظ انحسار اللثة عن الأسنان الحساسة؟", options: [
                { id: 'yes', text: 'نعم، واضح' }, { id: 'slight', text: 'بسيط' },
                { id: 'not_sure', text: 'غير متأكد' }, { id: 'no', text: 'لا' }
            ]
        },
        {
            question: "هل تضغط على أسنانك أو تطحنها أثناء النوم؟", options: [
                { id: 'yes', text: 'نعم' }, { id: 'told', text: 'أخبرني شخص بذلك' },
                { id: 'jaw_pain', text: 'أستيقظ بألم في الفك' }, { id: 'no', text: 'لا' }
            ]
        },
        {
            question: "ما نوع فرشاة الأسنان التي تستخدمها؟", options: [
                { id: 'hard', text: 'خشنة' }, { id: 'medium', text: 'متوسطة' },
                { id: 'soft', text: 'ناعمة' }, { id: 'dont_know', text: 'لا أعرف' }
            ]
        },
        {
            question: "هل تستخدم معجون أسنان للحساسية؟", options: [
                { id: 'yes_helps', text: 'نعم ويساعد' }, { id: 'yes_no_help', text: 'نعم لكن بدون فائدة' },
                { id: 'tried', text: 'جربته سابقاً' }, { id: 'no', text: 'لا' }
            ]
        },
        {
            question: "هل أجريت تبييض أسنان مؤخراً؟", options: [
                { id: 'recent', text: 'نعم، مؤخراً' }, { id: 'past', text: 'في الماضي' },
                { id: 'home', text: 'منتجات تبييض منزلية' }, { id: 'no', text: 'لا' }
            ]
        },
        {
            question: "هل تتناول أطعمة حمضية بكثرة؟", options: [
                { id: 'daily', text: 'نعم، يومياً' }, { id: 'often', text: 'كثيراً' },
                { id: 'sometimes', text: 'أحياناً' }, { id: 'rarely', text: 'نادراً' }
            ]
        }
    ],
    cosmetic: [
        {
            question: "ما هو هدفك الرئيسي من التجميل؟", options: [
                { id: 'whitening', text: 'تبييض الأسنان' }, { id: 'alignment', text: 'تقويم الأسنان' },
                { id: 'shape', text: 'تغيير شكل أو حجم الأسنان' }, { id: 'full_smile', text: 'ابتسامة هوليوود كاملة' }
            ]
        },
        {
            question: "ما لون أسنانك الحالي؟", options: [
                { id: 'yellow', text: 'أصفر / مائل للأصفر' }, { id: 'stained', text: 'بها بقع وتصبغات' },
                { id: 'grey', text: 'رمادي أو داكن' }, { id: 'acceptable', text: 'مقبول لكن أريد أفضل' }
            ]
        },
        {
            question: "هل لديك أسنان مكسورة أو متشققة؟", options: [
                { id: 'broken', text: 'نعم، مكسورة' }, { id: 'chipped', text: 'متشققة أو مقطوعة الطرف' },
                { id: 'worn', text: 'متآكلة من الأطراف' }, { id: 'intact', text: 'سليمة' }
            ]
        },
        {
            question: "هل لديك فراغات بين أسنانك؟", options: [
                { id: 'front', text: 'نعم، في الأمام' }, { id: 'sides', text: 'في الجوانب' },
                { id: 'missing', text: 'أسنان مفقودة' }, { id: 'no_gaps', text: 'لا فراغات' }
            ]
        },
        {
            question: "هل تعاني من ازدحام أو اعوجاج الأسنان؟", options: [
                { id: 'severe', text: 'ازدحام شديد' }, { id: 'moderate', text: 'اعوجاج متوسط' },
                { id: 'slight', text: 'بسيط جداً' }, { id: 'straight', text: 'مستقيمة' }
            ]
        },
        {
            question: "هل تظهر لثتك بشكل مفرط عند الابتسام (Gummy Smile)؟", options: [
                { id: 'yes_much', text: 'نعم، بشكل واضح' }, { id: 'slightly', text: 'قليلاً' },
                { id: 'uneven', text: 'غير متساوية' }, { id: 'normal', text: 'طبيعية' }
            ]
        },
        {
            question: "هل سبق أن أجريت أي إجراء تجميلي للأسنان؟", options: [
                { id: 'veneers', text: 'قشور/فينير' }, { id: 'whitening', text: 'تبييض' },
                { id: 'braces', text: 'تقويم' }, { id: 'never', text: 'لم أجرِ شيئاً' }
            ]
        },
        {
            question: "ما مدى استعدادك المادي للعلاج التجميلي؟", options: [
                { id: 'budget', text: 'ميزانية محدودة' }, { id: 'moderate', text: 'متوسطة' },
                { id: 'flexible', text: 'مرنة ومفتوحة' }, { id: 'exploring', text: 'أستكشف الخيارات أولاً' }
            ]
        },
        {
            question: "هل لديك حساسية في الأسنان حالياً؟", options: [
                { id: 'yes', text: 'نعم' }, { id: 'mild', text: 'حساسية خفيفة' },
                { id: 'past', text: 'كانت سابقاً' }, { id: 'no', text: 'لا' }
            ]
        },
        {
            question: "ما هو الجدول الزمني المفضل لك؟", options: [
                { id: 'asap', text: 'في أقرب وقت' }, { id: 'month', text: 'خلال شهر' },
                { id: 'flexible', text: 'مرن ولا أستعجل' }, { id: 'event', text: 'قبل مناسبة محددة' }
            ]
        }
    ],
    checkup: [
        {
            question: "متى كانت آخر زيارة لطبيب الأسنان؟", options: [
                { id: 'recent', text: 'خلال 6 أشهر' }, { id: 'year', text: 'خلال سنة' },
                { id: 'years', text: 'أكثر من سنة' }, { id: 'never', text: 'لا أتذكر / لم أزر' }
            ]
        },
        {
            question: "هل لديك أي ألم حالياً؟", options: [
                { id: 'yes', text: 'نعم، ألم واضح' }, { id: 'mild', text: 'انزعاج بسيط' },
                { id: 'occasional', text: 'ألم متقطع أحياناً' }, { id: 'no', text: 'لا يوجد ألم' }
            ]
        },
        {
            question: "هل تلاحظ نزيف في اللثة عند التنظيف؟", options: [
                { id: 'always', text: 'دائماً' }, { id: 'sometimes', text: 'أحياناً' },
                { id: 'rarely', text: 'نادراً' }, { id: 'never', text: 'لا' }
            ]
        },
        {
            question: "كم مرة تنظف أسنانك يومياً؟", options: [
                { id: 'three', text: '3 مرات أو أكثر' }, { id: 'twice', text: 'مرتين' },
                { id: 'once', text: 'مرة واحدة' }, { id: 'irregular', text: 'غير منتظم' }
            ]
        },
        {
            question: "هل تستخدم خيط الأسنان؟", options: [
                { id: 'daily', text: 'يومياً' }, { id: 'weekly', text: 'أسبوعياً' },
                { id: 'rarely', text: 'نادراً' }, { id: 'never', text: 'لا أستخدمه' }
            ]
        },
        {
            question: "هل تتناول أطعمة سكرية أو مشروبات غازية بكثرة؟", options: [
                { id: 'daily', text: 'يومياً' }, { id: 'often', text: 'كثيراً' },
                { id: 'moderate', text: 'باعتدال' }, { id: 'rarely', text: 'نادراً' }
            ]
        },
        {
            question: "هل تعاني من جفاف الفم؟", options: [
                { id: 'always', text: 'دائماً' }, { id: 'sometimes', text: 'أحياناً' },
                { id: 'night', text: 'ليلاً فقط' }, { id: 'no', text: 'لا' }
            ]
        },
        {
            question: "هل تعاني من صرير الأسنان (الطحن)؟", options: [
                { id: 'yes', text: 'نعم' }, { id: 'sleep', text: 'أثناء النوم' },
                { id: 'stress', text: 'عند التوتر' }, { id: 'no', text: 'لا' }
            ]
        },
        {
            question: "هل لديك تاريخ عائلي لأمراض اللثة أو فقدان الأسنان؟", options: [
                { id: 'gum_disease', text: 'أمراض لثة' }, { id: 'tooth_loss', text: 'فقدان أسنان مبكر' },
                { id: 'both', text: 'كلاهما' }, { id: 'no', text: 'لا' }
            ]
        },
        {
            question: "هل لديك أمراض مزمنة أو تتناول أدوية بانتظام؟", options: [
                { id: 'diabetes', text: 'سكري' }, { id: 'blood_pressure', text: 'ضغط دم' },
                { id: 'medications', text: 'أدوية أخرى' }, { id: 'healthy', text: 'لا' }
            ]
        }
    ]
};

export interface DiagnosisResult {
    severity: 'low' | 'medium' | 'high';
    severityLabel: string;
    severityColor: string;
    title: string;
    summary: string;
    possibleDiagnosis: string[];
    recommendations: string[];
    immediateTips: string[];
    specialty: string;
    urgency: string;
}

export const diagnosisResults: Record<string, DiagnosisResult> = {
    tooth_pain: {
        severity: 'high',
        severityLabel: 'مرتفعة',
        severityColor: 'from-red-500 to-rose-600',
        title: 'ألم الأسنان - تقرير التشخيص المبدئي',
        summary: 'بناءً على إجاباتك، تشير الأعراض إلى وجود مشكلة تحتاج لتقييم طبي متخصص. ألم الأسنان قد يكون ناتجاً عن تسوس عميق، التهاب في العصب، أو مشاكل في اللثة المحيطة بالسن.',
        possibleDiagnosis: ['تسوس عميق وصل للعصب', 'التهاب لب السن (العصب)', 'خراج سني أو لثوي', 'كسر أو شرخ في السن', 'التهاب نسيج حول الذروة'],
        recommendations: [
            'زيارة طبيب أسنان متخصص في أقرب وقت ممكن',
            'إجراء صورة أشعة بانورامية أو سينية للسن المتأثر',
            'تجنب المضغ على الجانب المصاب',
            'عدم وضع الأسبرين مباشرة على اللثة (خطأ شائع)',
            'تجنب الأطعمة والمشروبات شديدة الحرارة أو البرودة',
            'عدم تأجيل العلاج لتجنب تفاقم الحالة',
            'إبلاغ الطبيب بجميع الأدوية التي تتناولها'
        ],
        immediateTips: [
            'يمكن تناول مسكن مثل الإيبوبروفين (400mg) كل 6 ساعات',
            'المضمضة بماء دافئ وملح (نصف ملعقة لكل كوب)',
            'وضع كمادة باردة على الخد إن وجد تورم',
            'النوم مع رفع الرأس قليلاً لتقليل الألم الليلي'
        ],
        specialty: 'طب أسنان عام / علاج جذور',
        urgency: 'يُنصح بزيارة الطبيب خلال 24-48 ساعة'
    },
    gum_bleeding: {
        severity: 'medium',
        severityLabel: 'متوسطة',
        severityColor: 'from-amber-500 to-orange-500',
        title: 'نزيف اللثة - تقرير التشخيص المبدئي',
        summary: 'تشير أعراضك إلى وجود التهاب في أنسجة اللثة. قد يتراوح بين التهاب لثة بسيط (Gingivitis) قابل للعلاج، إلى التهاب نسيج داعم (Periodontitis) يحتاج متابعة متخصصة.',
        possibleDiagnosis: ['التهاب اللثة البسيط', 'التهاب النسيج الداعم للأسنان', 'تراكم الجير والبلاك', 'نقص فيتامين C أو K', 'تأثيرات دوائية على اللثة'],
        recommendations: [
            'زيارة طبيب أسنان لإجراء تنظيف احترافي (تقليح)',
            'إجراء فحص شامل لقياس عمق الجيوب اللثوية',
            'استخدام فرشاة أسنان ناعمة وتغييرها كل 3 أشهر',
            'تنظيف الأسنان بتقنية Bass المعدّلة (حركة دائرية لطيفة)',
            'استخدام خيط الأسنان يومياً بلطف',
            'المضمضة بغسول فم مضاد للبكتيريا (Chlorhexidine)',
            'فحص مستوى فيتامين D وC في الدم'
        ],
        immediateTips: [
            'لا تتوقف عن تنظيف أسنانك بسبب النزيف',
            'استخدم فرشاة ناعمة مع ضغط خفيف',
            'المضمضة بماء وملح دافئ 2-3 مرات يومياً',
            'تناول أطعمة غنية بفيتامين C (حمضيات، فلفل، كيوي)'
        ],
        specialty: 'أمراض اللثة / طب أسنان عام',
        urgency: 'يُنصح بزيارة الطبيب خلال أسبوع'
    },
    bad_breath: {
        severity: 'medium',
        severityLabel: 'متوسطة',
        severityColor: 'from-amber-500 to-yellow-500',
        title: 'رائحة الفم - تقرير التشخيص المبدئي',
        summary: 'رائحة الفم الكريهة (Halitosis) مشكلة شائعة في 90% من الحالات يكون مصدرها من الفم نفسه. قد تنتج عن تراكم البكتيريا على اللسان، أمراض اللثة، تسوسات، أو جفاف الفم.',
        possibleDiagnosis: ['تراكم بكتيري على اللسان', 'أمراض اللثة والتهاباتها', 'تسوسات غير معالجة', 'جفاف الفم المزمن', 'مشاكل في الجهاز الهضمي أو الجيوب الأنفية'],
        recommendations: [
            'زيارة طبيب الأسنان لاستبعاد الأسباب الفموية',
            'تنظيف اللسان يومياً بمكشطة لسان مخصصة',
            'علاج أي تسوسات أو أمراض لثة موجودة',
            'شرب كمية كافية من الماء (8 أكواب يومياً على الأقل)',
            'استخدام غسول فم خالي من الكحول',
            'مراجعة طبيب أنف وأذن إن استمرت المشكلة',
            'فحص وظائف المعدة إن وُجدت أعراض هضمية'
        ],
        immediateTips: [
            'تنظيف اللسان عند كل تنظيف للأسنان',
            'مضغ علكة خالية من السكر لتحفيز إفراز اللعاب',
            'تجنب الأطعمة ذات الرائحة القوية (ثوم، بصل)',
            'شرب الشاي الأخضر فهو يقلل البكتيريا الفموية'
        ],
        specialty: 'طب أسنان عام / أمراض اللثة',
        urgency: 'يُنصح بزيارة الطبيب خلال أسبوعين'
    },
    sensitivity: {
        severity: 'low',
        severityLabel: 'منخفضة',
        severityColor: 'from-blue-500 to-cyan-500',
        title: 'حساسية الأسنان - تقرير التشخيص المبدئي',
        summary: 'حساسية الأسنان (Dentin Hypersensitivity) تحدث عندما تتعرض طبقة العاج. قد تكون بسبب انحسار اللثة، تآكل المينا، أو تشققات دقيقة في الأسنان.',
        possibleDiagnosis: ['انحسار اللثة وكشف جذور الأسنان', 'تآكل طبقة المينا', 'تسوس مبكر', 'شروخ دقيقة في الأسنان', 'تأثيرات ما بعد التبييض'],
        recommendations: [
            'استخدام معجون أسنان مخصص للحساسية بانتظام',
            'استخدام فرشاة أسنان ناعمة (soft) حصراً',
            'تجنب التنظيف بقوة مفرطة',
            'تقليل الأطعمة والمشروبات الحمضية',
            'زيارة الطبيب لتطبيق طلاء الفلورايد المركّز',
            'استشارة بخصوص واقي أسنان ليلي إن وُجد صرير',
            'عدم استخدام منتجات التبييض حتى تتحسن الحساسية'
        ],
        immediateTips: [
            'ضع معجون الحساسية مباشرة على السن لدقيقتين قبل البصق',
            'تجنب المشروبات الباردة جداً أو الساخنة جداً',
            'لا تنظف أسنانك فوراً بعد تناول الحمضيات (انتظر 30 دقيقة)',
            'استخدم ماصة (شاليمو) للمشروبات الباردة'
        ],
        specialty: 'طب أسنان عام / طب أسنان ترميمي',
        urgency: 'يُنصح بزيارة الطبيب خلال 2-4 أسابيع'
    },
    cosmetic: {
        severity: 'low',
        severityLabel: 'اختيارية',
        severityColor: 'from-purple-500 to-violet-500',
        title: 'تجميل الأسنان - تقرير الاستشارة المبدئية',
        summary: 'بناءً على إجاباتك، يمكن تحقيق تحسين ملحوظ في مظهر ابتسامتك. تتوفر خيارات عديدة تتراوح من التبييض البسيط إلى القشور التجميلية (فينير) وابتسامة هوليوود.',
        possibleDiagnosis: ['حاجة لتبييض احترافي', 'إمكانية تركيب قشور خزفية (فينير)', 'حاجة لتقويم أسنان', 'إمكانية تجميل اللثة', 'حاجة لتعويضات تجميلية'],
        recommendations: [
            'استشارة طبيب تجميل أسنان متخصص',
            'إجراء تصوير رقمي لتصميم الابتسامة (Smile Design)',
            'فحص صحة الأسنان واللثة قبل أي إجراء تجميلي',
            'مناقشة الخيارات المتاحة ومقارنة التكاليف',
            'السؤال عن فترة الضمان للعمل التجميلي',
            'طلب صور لحالات سابقة من الطبيب',
            'التأكد من جودة المواد المستخدمة (بورسلين، زيركون، إلخ)'
        ],
        immediateTips: [
            'تجنب التدخين فهو يؤثر سلباً على أي عمل تجميلي',
            'حافظ على نظافة أسنانك إلى حين الزيارة',
            'اجمع صوراً للابتسامة التي تعجبك لمناقشتها مع الطبيب',
            'لا تقارن الأسعار فقط، بل الجودة والخبرة أيضاً'
        ],
        specialty: 'طب أسنان تجميلي',
        urgency: 'حسب رغبتك - لا توجد استعجال طبي'
    },
    checkup: {
        severity: 'low',
        severityLabel: 'وقائية',
        severityColor: 'from-emerald-500 to-green-500',
        title: 'الفحص الدوري - تقرير الصحة الفموية',
        summary: 'الفحص الدوري هو أهم خطوة للحفاظ على صحة أسنانك. يساعد في اكتشاف المشاكل مبكراً قبل أن تصبح مؤلمة أو مكلفة. يُنصح بالفحص كل 6 أشهر.',
        possibleDiagnosis: ['حاجة لتنظيف احترافي وإزالة الجير', 'فحص لكشف تسوسات مبكرة', 'تقييم صحة اللثة', 'كشف مبكر عن أي تغيرات غير طبيعية', 'تقييم الإطباق والمفصل الفكي'],
        recommendations: [
            'حجز موعد فحص دوري وتنظيف احترافي',
            'إجراء صورة بانورامية شاملة (كل سنتين)',
            'تنظيف الأسنان مرتين يومياً لمدة دقيقتين',
            'استخدام خيط الأسنان يومياً',
            'تقليل السكريات والمشروبات الغازية',
            'شرب كمية كافية من الماء يومياً',
            'تغيير فرشاة الأسنان كل 3 أشهر'
        ],
        immediateTips: [
            'ابدأ بتنظيف أسنانك مرتين يومياً إن لم تكن تفعل',
            'أضف خيط الأسنان لروتينك اليومي',
            'استخدم معجون أسنان يحتوي على الفلورايد',
            'قلل من الوجبات الخفيفة بين الوجبات الرئيسية'
        ],
        specialty: 'طب أسنان عام',
        urgency: 'يُنصح بالزيارة عند أول فرصة متاحة'
    }
};
