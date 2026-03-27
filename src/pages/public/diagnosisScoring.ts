import { DiagnosisResult } from './diagnosisData';

// Weight maps: each answer option gets a severity weight (0=normal, 1=mild, 2=moderate, 3=severe)
const weightMaps: Record<string, number[][]> = {
    tooth_pain: [
        [1, 2, 2, 3],  // Q0: duration - longer = worse
        [1, 2, 3, 2],  // Q1: location - jaw=worst
        [0, 1, 2, 3],  // Q2: severity scale
        [1, 2, 3, 0],  // Q3: temp sensitivity - both=worst
        [2, 1, 1, 0],  // Q4: biting pain
        [2, 3, 3, 0],  // Q5: swelling - face=worst
        [3, 2, 1, 0],  // Q6: color change
        [3, 2, 2, 0],  // Q7: night pain
        [3, 2, 2, 0],  // Q8: abscess
        [1, 2, 1, 0],  // Q9: previous treatment
        [1, 2, 0, 1],  // Q10: painkillers effectiveness
        [2, 2, 1, 0],  // Q11: chronic conditions
    ],
    gum_bleeding: [
        [1, 2, 3, 3],  // Q0: duration
        [1, 1, 3, 2],  // Q1: when bleeding occurs - spontaneous=worst
        [0, 1, 2, 3],  // Q2: amount
        [3, 2, 2, 0],  // Q3: swelling/redness
        [3, 2, 2, 0],  // Q4: pain
        [3, 2, 1, 0],  // Q5: gum recession
        [0, 0, 1, 2],  // Q6: brushing frequency - less=worse
        [0, 0, 0, 2],  // Q7: floss/mouthwash - neither=worse
        [3, 1, 2, 0],  // Q8: smoking
        [3, 2, 2, 0],  // Q9: teeth mobility
    ],
    bad_breath: [
        [1, 2, 3, 3],  // Q0: duration
        [1, 1, 3, 2],  // Q1: when worst - all day=worst
        [2, 1, 3, 1],  // Q2: who noticed
        [3, 2, 2, 0],  // Q3: dry mouth
        [3, 2, 1, 0],  // Q4: gum bleeding
        [3, 2, 3, 0],  // Q5: cavities/fillings
        [0, 1, 2, 3],  // Q6: tongue cleaning - never=worst
        [2, 2, 1, 0],  // Q7: stomach issues
        [2, 2, 2, 0],  // Q8: tonsils/sinuses
        [2, 1, 0, 0],  // Q9: water intake - less=worse
    ],
    sensitivity: [
        [1, 2, 3, 2],  // Q0: duration
        [2, 2, 1, 2],  // Q1: trigger
        [0, 1, 2, 3],  // Q2: duration of pain - lingering=worst
        [0, 1, 2, 3],  // Q3: number of teeth
        [3, 2, 1, 0],  // Q4: gum recession
        [3, 2, 2, 0],  // Q5: grinding
        [3, 2, 0, 1],  // Q6: brush type - hard=worst
        [0, 0, 1, 2],  // Q7: sensitivity toothpaste usage
        [3, 1, 2, 0],  // Q8: recent whitening
        [3, 2, 1, 0],  // Q9: acidic foods
    ],
    cosmetic: [
        [1, 2, 2, 3],  // Q0: goal
        [2, 2, 3, 1],  // Q1: current color
        [3, 2, 2, 0],  // Q2: broken teeth
        [2, 2, 3, 0],  // Q3: gaps
        [3, 2, 1, 0],  // Q4: crowding
        [3, 1, 2, 0],  // Q5: gummy smile
        [1, 1, 1, 0],  // Q6: previous cosmetic
        [0, 1, 2, 1],  // Q7: budget
        [2, 1, 1, 0],  // Q8: current sensitivity
        [0, 0, 1, 2],  // Q9: timeline
    ],
    checkup: [
        [0, 1, 2, 3],  // Q0: last visit - never/long=worse
        [3, 2, 1, 0],  // Q1: current pain
        [3, 2, 1, 0],  // Q2: bleeding
        [0, 0, 1, 2],  // Q3: brushing frequency
        [0, 0, 1, 2],  // Q4: floss usage
        [3, 2, 1, 0],  // Q5: sugar intake
        [3, 2, 1, 0],  // Q6: dry mouth
        [2, 2, 2, 0],  // Q7: grinding
        [2, 2, 3, 0],  // Q8: family history
        [2, 2, 1, 0],  // Q9: chronic conditions
    ]
};

// Calculate total score from answers
export function calculateScore(condition: string, answers: Record<number, string>, questionOptions: { id: string }[][]): { score: number; maxScore: number; percentage: number } {
    const weights = weightMaps[condition];
    if (!weights) return { score: 0, maxScore: 1, percentage: 0 };

    let score = 0;
    let maxScore = 0;

    weights.forEach((questionWeights, qIndex) => {
        maxScore += Math.max(...questionWeights);
        if (answers[qIndex] !== undefined) {
            const options = questionOptions[qIndex];
            const selectedIndex = options?.findIndex(opt => opt.id === answers[qIndex]);
            if (selectedIndex !== undefined && selectedIndex >= 0 && questionWeights[selectedIndex] !== undefined) {
                score += questionWeights[selectedIndex];
            }
        }
    });

    return { score, maxScore: maxScore || 1, percentage: Math.round((score / (maxScore || 1)) * 100) };
}

// Get severity level from percentage
function getSeverityLevel(percentage: number): 'low' | 'medium' | 'high' {
    if (percentage >= 60) return 'high';
    if (percentage >= 30) return 'medium';
    return 'low';
}

// Dynamic results based on actual score
const dynamicResults: Record<string, Record<'low' | 'medium' | 'high', DiagnosisResult>> = {
    tooth_pain: {
        low: {
            severity: 'low', severityLabel: 'خفيفة', severityColor: 'from-green-500 to-emerald-500',
            title: 'ألم الأسنان - حالة بسيطة',
            summary: 'بناءً على إجاباتك، تبدو الأعراض خفيفة وقد تكون ناتجة عن حساسية مؤقتة أو تهيج بسيط. مع ذلك، يُنصح بمتابعة الوضع.',
            possibleDiagnosis: ['حساسية أسنان مؤقتة', 'تهيج لثوي بسيط', 'تسوس سطحي مبكر'],
            recommendations: ['مراقبة الأعراض خلال الأيام القادمة', 'استخدام معجون أسنان للحساسية', 'زيارة الطبيب إن استمر الألم أكثر من أسبوع'],
            immediateTips: ['المضمضة بماء دافئ وملح', 'تجنب الأطعمة شديدة البرودة أو الحرارة', 'تنظيف الأسنان بفرشاة ناعمة'],
            specialty: 'طب أسنان عام', urgency: 'يمكن المتابعة خلال أسبوعين'
        },
        medium: {
            severity: 'medium', severityLabel: 'متوسطة', severityColor: 'from-amber-500 to-orange-500',
            title: 'ألم الأسنان - يحتاج متابعة',
            summary: 'تشير إجاباتك إلى وجود مشكلة تحتاج تقييماً طبياً. قد يكون تسوساً متوسطاً أو بداية التهاب يحتاج علاجاً قبل تفاقمه.',
            possibleDiagnosis: ['تسوس متوسط العمق', 'التهاب لثوي حول السن', 'حشوة قديمة تحتاج استبدال', 'شرخ بسيط في السن'],
            recommendations: ['زيارة طبيب الأسنان خلال أيام', 'إجراء صورة أشعة للسن المتأثر', 'تجنب المضغ على الجانب المصاب', 'عدم تأجيل العلاج لتجنب التفاقم'],
            immediateTips: ['تناول مسكن مثل الإيبوبروفين عند الحاجة', 'المضمضة بماء وملح 2-3 مرات يومياً', 'تجنب الأطعمة الصلبة على الجانب المصاب'],
            specialty: 'طب أسنان عام / ترميمي', urgency: 'يُنصح بزيارة الطبيب خلال 3-5 أيام'
        },
        high: {
            severity: 'high', severityLabel: 'مرتفعة', severityColor: 'from-red-500 to-rose-600',
            title: 'ألم الأسنان - يحتاج تدخل عاجل',
            summary: 'تشير إجاباتك إلى حالة متقدمة تحتاج تدخلاً طبياً عاجلاً. قد يكون التهاباً في العصب أو خراجاً يتطلب علاجاً فورياً لتجنب مضاعفات خطيرة.',
            possibleDiagnosis: ['تسوس عميق وصل للعصب', 'التهاب لب السن الحاد', 'خراج سني أو لثوي', 'كسر في السن مع إصابة العصب', 'التهاب نسيج حول الذروة'],
            recommendations: ['زيارة طبيب أسنان فوراً أو خلال 24 ساعة', 'إجراء صورة أشعة بانورامية عاجلة', 'قد تحتاج علاج عصب أو قلع', 'عدم وضع الأسبرين على اللثة مباشرة', 'إبلاغ الطبيب بجميع أدويتك'],
            immediateTips: ['تناول إيبوبروفين 400mg كل 6 ساعات', 'كمادة باردة على الخد إن وجد تورم', 'النوم مع رفع الرأس قليلاً', 'توجه للطوارئ إن ظهر تورم في الوجه أو صعوبة بالبلع'],
            specialty: 'علاج جذور / جراحة فم', urgency: 'مستعجل - خلال 24 ساعة'
        }
    },
    gum_bleeding: {
        low: {
            severity: 'low', severityLabel: 'خفيفة', severityColor: 'from-green-500 to-emerald-500',
            title: 'نزيف اللثة - حالة بسيطة',
            summary: 'النزيف يبدو بسيطاً وقد يكون بسبب طريقة التنظيف أو فرشاة خشنة. تحسين عادات النظافة عادة يحل المشكلة.',
            possibleDiagnosis: ['تهيج لثوي بسيط من التنظيف', 'استخدام فرشاة خشنة', 'بداية تراكم جير خفيف'],
            recommendations: ['تغيير الفرشاة لنوع ناعم', 'تنظيف الأسنان بلطف بحركة دائرية', 'استخدام خيط الأسنان بانتظام'],
            immediateTips: ['لا تتوقف عن التنظيف بسبب النزيف', 'استخدم غسول فم مضاد للبكتيريا', 'تناول أطعمة غنية بفيتامين C'],
            specialty: 'طب أسنان عام', urgency: 'يمكن المتابعة خلال شهر'
        },
        medium: {
            severity: 'medium', severityLabel: 'متوسطة', severityColor: 'from-amber-500 to-orange-500',
            title: 'نزيف اللثة - التهاب لثوي',
            summary: 'تشير الأعراض إلى التهاب لثوي (Gingivitis) يحتاج تنظيفاً احترافياً. هذه المرحلة قابلة للعلاج الكامل إن تمت المعالجة.',
            possibleDiagnosis: ['التهاب اللثة (Gingivitis)', 'تراكم جير وبلاك', 'نقص فيتامين C أو K', 'تأثير دوائي على اللثة'],
            recommendations: ['زيارة طبيب لتنظيف احترافي (تقليح)', 'فحص عمق الجيوب اللثوية', 'استخدام غسول الكلورهكسيدين', 'فحص مستوى الفيتامينات'],
            immediateTips: ['تنظيف الأسنان مرتين يومياً بفرشاة ناعمة', 'المضمضة بماء وملح دافئ', 'تناول حمضيات لفيتامين C'],
            specialty: 'أمراض اللثة', urgency: 'يُنصح بزيارة خلال أسبوع'
        },
        high: {
            severity: 'high', severityLabel: 'مرتفعة', severityColor: 'from-red-500 to-rose-600',
            title: 'نزيف اللثة - حالة متقدمة',
            summary: 'تشير الأعراض إلى التهاب نسيج داعم متقدم (Periodontitis). هذا يؤثر على العظم المحيط بالأسنان وقد يسبب فقدان أسنان إن لم يُعالج.',
            possibleDiagnosis: ['التهاب النسيج الداعم (Periodontitis)', 'فقدان عظم حول الأسنان', 'جيوب لثوية عميقة', 'حركة أسنان بسبب فقدان الدعم'],
            recommendations: ['زيارة أخصائي لثة عاجلاً', 'أشعة بانورامية لتقييم فقدان العظم', 'قد تحتاج تنظيف عميق تحت التخدير', 'متابعة دورية كل 3 أشهر', 'إيقاف التدخين فوراً إن كنت مدخناً'],
            immediateTips: ['تنظيف لطيف جداً لتجنب زيادة النزيف', 'المضمضة بغسول طبي', 'لا تتجاهل حركة الأسنان'],
            specialty: 'أخصائي أمراض لثة', urgency: 'مستعجل - خلال 2-3 أيام'
        }
    },
    bad_breath: {
        low: {
            severity: 'low', severityLabel: 'خفيفة', severityColor: 'from-green-500 to-emerald-500',
            title: 'رائحة الفم - حالة بسيطة',
            summary: 'الرائحة على الأرجح مؤقتة أو مرتبطة بعادات النظافة. تحسين الروتين اليومي كافٍ عادة.',
            possibleDiagnosis: ['رائحة صباحية طبيعية', 'نتيجة أطعمة معينة', 'تنظيف لسان غير كافٍ'],
            recommendations: ['تنظيف اللسان يومياً بمكشطة', 'شرب ماء كافٍ يومياً', 'استخدام غسول فم بدون كحول'],
            immediateTips: ['نظف لسانك عند كل تنظيف أسنان', 'امضغ علكة خالية من السكر', 'اشرب 8 أكواب ماء يومياً'],
            specialty: 'طب أسنان عام', urgency: 'يمكن المتابعة عند أقرب فحص دوري'
        },
        medium: {
            severity: 'medium', severityLabel: 'متوسطة', severityColor: 'from-amber-500 to-orange-500',
            title: 'رائحة الفم - تحتاج تقييم',
            summary: 'الرائحة المستمرة تشير غالباً لمشكلة فموية مثل أمراض لثة أو تسوسات. التشخيص الدقيق ضروري.',
            possibleDiagnosis: ['أمراض لثة والتهابات', 'تسوسات غير معالجة', 'جفاف فم مزمن', 'تراكم بكتيري على اللسان'],
            recommendations: ['زيارة طبيب لفحص شامل', 'علاج أي تسوسات أو التهابات', 'فحص غدد اللعاب', 'مراجعة الأدوية المسببة لجفاف الفم'],
            immediateTips: ['تنظيف اللسان مرتين يومياً', 'شرب ماء بانتظام طوال اليوم', 'تجنب التدخين والكحول'],
            specialty: 'طب أسنان عام / أمراض لثة', urgency: 'يُنصح بزيارة خلال أسبوعين'
        },
        high: {
            severity: 'high', severityLabel: 'مرتفعة', severityColor: 'from-red-500 to-rose-600',
            title: 'رائحة الفم - حالة تحتاج تدخل',
            summary: 'الرائحة الشديدة والمستمرة تشير لمشاكل متعددة قد تشمل التهابات لثوية متقدمة، تسوسات عميقة، أو مشاكل في الجهاز الهضمي.',
            possibleDiagnosis: ['التهاب لثة متقدم', 'تسوسات عميقة متعددة', 'خراج أو عدوى فموية', 'مشاكل هضمية (ارتجاع مريئي)', 'التهاب لوزتين أو جيوب أنفية'],
            recommendations: ['زيارة طبيب أسنان عاجلاً', 'قد تحتاج تحويل لطبيب أنف أذن حنجرة', 'فحص الجهاز الهضمي إن لم تكن المشكلة فموية', 'تنظيف احترافي شامل'],
            immediateTips: ['تنظيف شامل 3 مرات يومياً مع اللسان', 'غسول الكلورهكسيدين مؤقتاً', 'تجنب الثوم والبصل والتوابل القوية'],
            specialty: 'طب أسنان + أنف أذن حنجرة', urgency: 'يُنصح بزيارة خلال أسبوع'
        }
    },
    sensitivity: {
        low: {
            severity: 'low', severityLabel: 'خفيفة', severityColor: 'from-green-500 to-emerald-500',
            title: 'حساسية الأسنان - بسيطة',
            summary: 'الحساسية تبدو خفيفة ومحدودة. استخدام معجون مخصص للحساسية عادة يحسن الوضع خلال أسابيع.',
            possibleDiagnosis: ['حساسية مؤقتة بعد تنظيف أو تبييض', 'تآكل طفيف في المينا', 'استخدام فرشاة خشنة'],
            recommendations: ['استخدام معجون حساسية لمدة 4 أسابيع', 'تبديل الفرشاة لنوع ناعم', 'تقليل الأطعمة الحمضية'],
            immediateTips: ['ضع معجون الحساسية على السن لدقيقتين', 'استخدم ماصة للمشروبات الباردة', 'انتظر 30 دقيقة بعد الحمضيات قبل التنظيف'],
            specialty: 'طب أسنان عام', urgency: 'يمكن المتابعة خلال شهر'
        },
        medium: {
            severity: 'medium', severityLabel: 'متوسطة', severityColor: 'from-amber-500 to-orange-500',
            title: 'حساسية الأسنان - تحتاج علاج',
            summary: 'الحساسية تؤثر على عدة أسنان وتحتاج تقييماً لمعرفة السبب. قد يكون انحسار لثة أو تآكل مينا يحتاج تدخلاً.',
            possibleDiagnosis: ['انحسار لثة وكشف جذور', 'تآكل طبقة المينا', 'صرير أسنان ليلي', 'تسوس مبكر في عدة أسنان'],
            recommendations: ['زيارة الطبيب لتطبيق فلورايد مركّز', 'فحص الإطباق وصرير الأسنان', 'قد تحتاج واقي أسنان ليلي', 'علاج أي انحسار لثوي'],
            immediateTips: ['معجون حساسية مرتين يومياً', 'تجنب تنظيف الأسنان بعنف', 'تجنب المبيضات حتى تتحسن الحساسية'],
            specialty: 'طب أسنان ترميمي', urgency: 'يُنصح بزيارة خلال 1-2 أسبوع'
        },
        high: {
            severity: 'high', severityLabel: 'مرتفعة', severityColor: 'from-red-500 to-rose-600',
            title: 'حساسية الأسنان - شديدة',
            summary: 'الحساسية شديدة ومنتشرة، مما يشير لمشكلة أعمق مثل تآكل شديد في المينا أو التهاب عصبي. العلاج الفوري مهم.',
            possibleDiagnosis: ['تآكل شديد في المينا', 'كشف عاج واسع', 'التهاب عصبي بداية', 'صرير أسنان شديد', 'انحسار لثة متقدم'],
            recommendations: ['زيارة عاجلة لتقييم شامل', 'أشعة للأسنان المتأثرة', 'قد تحتاج ترميمات أو تلبيسات', 'واقي أسنان ليلي ضروري إن وُجد صرير'],
            immediateTips: ['تجنب كل المثيرات (بارد/ساخن/حمضي) مؤقتاً', 'معجون حساسية 3 مرات يومياً', 'راجع الطبيب في أقرب وقت'],
            specialty: 'طب أسنان ترميمي / علاج عصب', urgency: 'يُنصح بزيارة خلال أسبوع'
        }
    },
    cosmetic: {
        low: {
            severity: 'low', severityLabel: 'بسيطة', severityColor: 'from-green-500 to-emerald-500',
            title: 'تجميل الأسنان - تحسينات بسيطة',
            summary: 'احتياجاتك التجميلية بسيطة ويمكن تحقيقها بإجراءات خفيفة مثل التبييض أو التلميع.',
            possibleDiagnosis: ['حاجة لتبييض بسيط', 'تلميع وتنظيف احترافي', 'تحسينات طفيفة في المظهر'],
            recommendations: ['تبييض احترافي في العيادة أو منزلي', 'تنظيف وتلميع دوري', 'استشارة تجميلية للخيارات المتاحة'],
            immediateTips: ['حافظ على نظافة أسنانك', 'قلل القهوة والشاي للحفاظ على اللون', 'لا تستخدم منتجات تبييض بدون استشارة'],
            specialty: 'طب أسنان تجميلي', urgency: 'حسب رغبتك - لا استعجال'
        },
        medium: {
            severity: 'medium', severityLabel: 'متوسطة', severityColor: 'from-amber-500 to-orange-500',
            title: 'تجميل الأسنان - خيارات متعددة',
            summary: 'لديك عدة احتياجات تجميلية يمكن تحقيقها بخطة علاج شاملة. الاستشارة مع متخصص ستحدد أفضل خيار.',
            possibleDiagnosis: ['حاجة لقشور خزفية (فينير)', 'تقويم بسيط أو شفاف', 'تعويض أسنان مفقودة', 'تجميل لثة'],
            recommendations: ['استشارة متخصص تجميل أسنان', 'تصوير رقمي لتصميم الابتسامة', 'مقارنة الخيارات والتكاليف', 'فحص صحة الأسنان أولاً'],
            immediateTips: ['اجمع صوراً للابتسامة التي تريدها', 'تأكد من صحة اللثة قبل أي تجميل', 'اسأل عن الضمان وجودة المواد'],
            specialty: 'طب أسنان تجميلي', urgency: 'حسب الجدول الزمني المفضل'
        },
        high: {
            severity: 'high', severityLabel: 'شاملة', severityColor: 'from-purple-500 to-violet-600',
            title: 'تجميل الأسنان - خطة شاملة',
            summary: 'تحتاج خطة تجميلية شاملة تشمل عدة إجراءات. يُنصح باستشارة متخصص لوضع خطة متكاملة تحقق أفضل نتيجة.',
            possibleDiagnosis: ['ابتسامة هوليوود كاملة', 'تقويم + فينير', 'تعويضات متعددة', 'تجميل لثة + أسنان'],
            recommendations: ['استشارة شاملة مع متخصص تجميل', 'خطة علاج مرحلية واضحة', 'صور قبل وبعد من حالات مشابهة', 'مناقشة التكلفة الإجمالية وخيارات الدفع', 'التأكد من خبرة الطبيب في الحالات المشابهة'],
            immediateTips: ['لا تتسرع في الاختيار - قارن بين أطباء', 'اطلب خطة مكتوبة بالتكاليف', 'تأكد من فهمك لكل إجراء ومدته'],
            specialty: 'أخصائي تجميل أسنان', urgency: 'حسب رغبتك - خطة مرحلية'
        }
    },
    checkup: {
        low: {
            severity: 'low', severityLabel: 'جيدة', severityColor: 'from-green-500 to-emerald-500',
            title: 'صحة فموية جيدة',
            summary: 'عاداتك في العناية بالأسنان جيدة! استمر على نفس الروتين مع فحص دوري للحفاظ على صحتك الفموية.',
            possibleDiagnosis: ['صحة فموية جيدة عموماً', 'حاجة لفحص دوري روتيني', 'تنظيف احترافي وقائي'],
            recommendations: ['فحص دوري كل 6 أشهر', 'استمر بتنظيف مرتين يومياً', 'حافظ على استخدام خيط الأسنان'],
            immediateTips: ['استمر على روتينك الحالي', 'حدد موعد فحصك الدوري القادم', 'استخدم معجوناً بالفلورايد'],
            specialty: 'طب أسنان عام', urgency: 'فحص روتيني - كل 6 أشهر'
        },
        medium: {
            severity: 'medium', severityLabel: 'تحتاج تحسين', severityColor: 'from-amber-500 to-orange-500',
            title: 'الفحص الدوري - تحسينات مطلوبة',
            summary: 'هناك بعض عوامل الخطر التي تحتاج انتباه. زيارة الطبيب وتحسين عادات النظافة سيساعد كثيراً.',
            possibleDiagnosis: ['بداية تراكم جير', 'حاجة لتحسين عادات النظافة', 'عوامل خطر قابلة للتحكم', 'احتمال تسوسات مبكرة'],
            recommendations: ['زيارة طبيب لتنظيف وفحص شامل', 'تحسين روتين التنظيف اليومي', 'تقليل السكريات والمشروبات الغازية', 'البدء باستخدام خيط الأسنان'],
            immediateTips: ['ابدأ بتنظيف مرتين يومياً', 'قلل الوجبات الخفيفة السكرية', 'اشرب ماء بدل المشروبات الغازية'],
            specialty: 'طب أسنان عام', urgency: 'يُنصح بزيارة خلال شهر'
        },
        high: {
            severity: 'high', severityLabel: 'تحتاج اهتمام', severityColor: 'from-red-500 to-rose-600',
            title: 'الفحص الدوري - مخاطر مرتفعة',
            summary: 'لديك عدة عوامل خطر تحتاج تقييماً طبياً. التأخر في الفحص قد يؤدي لمشاكل أكبر وأكثر تكلفة.',
            possibleDiagnosis: ['تسوسات محتملة غير مكتشفة', 'أمراض لثة محتملة', 'مشاكل إطباق أو صرير', 'تأثيرات سلبية من أمراض مزمنة'],
            recommendations: ['زيارة طبيب في أقرب وقت', 'أشعة بانورامية شاملة', 'فحص اللثة والعظم', 'خطة علاج شاملة', 'متابعة دورية كل 3-4 أشهر بدل 6'],
            immediateTips: ['لا تؤجل الزيارة أكثر', 'ابدأ بتحسين التنظيف فوراً', 'سجل أي أعراض تلاحظها لإخبار الطبيب'],
            specialty: 'طب أسنان عام / أمراض لثة', urgency: 'يُنصح بزيارة خلال أسبوع'
        }
    }
};

// Medical history score modifiers per condition
const medicalModifiers: Record<string, Record<string, number>> = {
    tooth_pain: { diabetes: 8, heart: 3, blood_thinners: 5, smoking: 6, immune: 8, osteoporosis: 4 },
    gum_bleeding: { diabetes: 10, blood_thinners: 10, smoking: 8, pregnancy: 6, immune: 7, heart: 3 },
    bad_breath: { diabetes: 5, smoking: 7, immune: 4 },
    sensitivity: { smoking: 4, osteoporosis: 5, immune: 3 },
    cosmetic: { smoking: 5, pregnancy: 3 },
    checkup: { diabetes: 7, heart: 5, smoking: 6, immune: 6, osteoporosis: 4, pregnancy: 3 },
};

// Age modifiers (seniors and children get higher risk)
const ageModifiers: Record<string, number> = { child: 5, teen: 2, young: 0, middle: 3, senior: 8 };

// Generate medical warnings based on conditions
export function getMedicalWarnings(medicalHistory: string[], patientSex?: string): string[] {
    const warnings: string[] = [];
    if (medicalHistory.includes('diabetes')) warnings.push('⚠️ مريض سكري: يجب ضبط السكر قبل أي إجراء، وتأخر الالتئام محتمل');
    if (medicalHistory.includes('heart')) warnings.push('⚠️ أمراض القلب/الضغط: أبلغ الطبيب بجميع أدويتك قبل العلاج');
    if (medicalHistory.includes('blood_thinners')) warnings.push('⚠️ أدوية مميعة: قد تحتاج إيقافها قبل إجراءات معينة بإذن الطبيب');
    if (medicalHistory.includes('drug_allergy')) warnings.push('⚠️ حساسية أدوية: أبلغ الطبيب فوراً بنوع الحساسية');
    if (medicalHistory.includes('pregnancy')) warnings.push('⚠️ حمل: تجنب الأشعة والأدوية غير الآمنة، يُفضل العلاج بالثلث الثاني');
    if (medicalHistory.includes('smoking')) warnings.push('⚠️ تدخين: يبطئ الالتئام ويزيد خطر أمراض اللثة - يُنصح بإيقافه');
    if (medicalHistory.includes('osteoporosis')) warnings.push('⚠️ هشاشة عظام: يؤثر على زراعة الأسنان وجراحات الفك');
    if (medicalHistory.includes('immune')) warnings.push('⚠️ ضعف مناعة: خطر العدوى مرتفع - يحتاج احتياطات خاصة');
    return warnings;
}

// Main function to get the appropriate result
export function getDynamicResult(
    condition: string, answers: Record<number, string>, questionOptions: { id: string }[][],
    medicalHistory: string[] = [], ageGroup: string = 'young'
): DiagnosisResult {
    const { percentage: basePercentage } = calculateScore(condition, answers, questionOptions);

    // Add medical history modifiers
    let bonus = 0;
    const condModifiers = medicalModifiers[condition] || {};
    medicalHistory.forEach(mc => { bonus += condModifiers[mc] || 0; });
    bonus += ageModifiers[ageGroup] || 0;

    const finalPercentage = Math.min(100, basePercentage + bonus);
    const level = getSeverityLevel(finalPercentage);

    const conditionResults = dynamicResults[condition];
    if (!conditionResults) return dynamicResults.checkup.medium;

    const result = { ...conditionResults[level] };

    // Add medical warnings to recommendations
    const warnings = getMedicalWarnings(medicalHistory);
    if (warnings.length > 0) {
        result.recommendations = [...warnings, ...result.recommendations];
    }

    return result;
}

// Export the percentage calculator for UI use
export function getScorePercentage(
    condition: string, answers: Record<number, string>, questionOptions: { id: string }[][],
    medicalHistory: string[] = [], ageGroup: string = 'young'
): number {
    const { percentage: basePercentage } = calculateScore(condition, answers, questionOptions);
    let bonus = 0;
    const condModifiers = medicalModifiers[condition] || {};
    medicalHistory.forEach(mc => { bonus += condModifiers[mc] || 0; });
    bonus += ageModifiers[ageGroup] || 0;
    return Math.min(100, basePercentage + bonus);
}
