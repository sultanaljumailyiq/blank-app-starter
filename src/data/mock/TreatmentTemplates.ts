export interface TreatmentTemplate {
    id: string;
    name: string;
    category: 'restorative' | 'endodontic' | 'prosthetic' | 'surgery' | 'preventive' | 'cosmetic' | 'orthodontic';
    description: string;
    defaultCost: number;
    sessionCount: number;
    duration: number; // minutes per session average
    procedureDetails: string;
    materials: string[];
    requiresLab: boolean;
}

export const treatmentTemplates: TreatmentTemplate[] = [
    {
        id: 'tpl_scaling',
        name: 'تنظيف وتلميع (Scaling & Polishing)',
        category: 'preventive',
        description: 'إزالة الجير والتصبغات وتلميع الأسنان',
        defaultCost: 50000,
        sessionCount: 1,
        duration: 30,
        procedureDetails: 'إزالة الجير بالموجات فوق الصوتية، إزالة التصبغات، تلميع بالمعجون',
        materials: ['معجون تلميع', 'فلورايد'],
        requiresLab: false
    },
    {
        id: 'tpl_composite',
        name: 'حشوة ضوئية (Composite Filling)',
        category: 'restorative',
        description: 'حشوة تجميلية بلون السن',
        defaultCost: 75000,
        sessionCount: 1,
        duration: 45,
        procedureDetails: 'تخدير، إزالة التسوس، وضع الحامض، وضع اللاصق، بناء الحشوة، التلميع',
        materials: ['مخدر، حامض، لاصق، حشوة ضوئية'],
        requiresLab: false
    },
    {
        id: 'tpl_rct_s',
        name: 'علاج عصب - قناة واحدة (RCT - Single)',
        category: 'endodontic',
        description: 'علاج عصب للقواطع والأنياب',
        defaultCost: 150000,
        sessionCount: 2,
        duration: 60,
        procedureDetails: 'الجلسة 1: فتح السن، استئصال العصب، توسيع القناة. الجلسة 2: حشو القناة والحشو النهائي',
        materials: ['مخدر، مبارد، هيبوكلوريت، جاتا بيركا، سيلر'],
        requiresLab: false
    },
    {
        id: 'tpl_rct_m',
        name: 'علاج عصب - متعدد القنوات (RCT - Molar)',
        category: 'endodontic',
        description: 'علاج عصب للأضراس الخلفية',
        defaultCost: 250000,
        sessionCount: 3,
        duration: 60,
        procedureDetails: 'الجلسة 1: استئصال العصب. الجلسة 2: توسيع وتنظيف. الجلسة 3: حشو القنوات',
        materials: ['مخدر، مبارد روتاري، هيبوكلوريت، جاتا بيركا، سيلر'],
        requiresLab: false
    },
    {
        id: 'tpl_extraction_s',
        name: 'خلع بسيط (Simple Extraction)',
        category: 'surgery',
        description: 'خلع سن عادي غير جراحي',
        defaultCost: 35000,
        sessionCount: 1,
        duration: 20,
        procedureDetails: 'تخدير، فصل اللثة، قلقة السن، الخلع، تعليمات ما بعد الخلع',
        materials: ['مخدر، شاش'],
        requiresLab: false
    },
    {
        id: 'tpl_extraction_surg',
        name: 'خلع جراحي (Surgical Extraction)',
        category: 'surgery',
        description: 'خلع جذور متبقية أو ضرس عقل مطمور',
        defaultCost: 150000,
        sessionCount: 1,
        duration: 60,
        procedureDetails: 'تخدير، شق اللثة، إزالة العظم (إذا لزم)، تقسيم السن، الخلع، خياطة',
        materials: ['مخدر، شفرة جراحية، خيوط جراحية'],
        requiresLab: false
    },
    {
        id: 'tpl_crown_pfm',
        name: 'تاج خزفي معدني (PFM Crown)',
        category: 'prosthetic',
        description: 'تاج بورسلين fused to metal',
        defaultCost: 150000,
        sessionCount: 2,
        duration: 60,
        procedureDetails: 'الجلسة 1: تحضير السن، أخذ طبعة، لون. الجلسة 2: تثبيت التاج',
        materials: ['مخدر، مادة طبعة، أسمنت تثبيت'],
        requiresLab: true
    },
    {
        id: 'tpl_crown_zircon',
        name: 'تاج زيركون (Zirconia Crown)',
        category: 'prosthetic',
        description: 'تاج زيركون عالي الجمالية والمتانة',
        defaultCost: 250000,
        sessionCount: 2,
        duration: 60,
        procedureDetails: 'الجلسة 1: تحضير السن، طبعة رقمية/تقليدية. الجلسة 2: تثبيت الزيركون',
        materials: ['مخدر، مادة طبعة، أسمنت ريزن'],
        requiresLab: true
    },
    {
        id: 'tpl_denture_part',
        name: 'طقم جزئي أكريليك (Acrylic Denture)',
        category: 'prosthetic',
        description: 'تعويض عدد من الأسنان المفقودة',
        defaultCost: 200000,
        sessionCount: 3,
        duration: 45,
        procedureDetails: 'طبعة أولية -> طبعة نهائية -> عضة -> تجربة -> تسليم',
        materials: ['مادة طبعة، شمع'],
        requiresLab: true
    },
    {
        id: 'tpl_implant',
        name: 'زراعة سن (Dental Implant)',
        category: 'surgery',
        description: 'زراعة زرعة تيتانيوم (بدون التركيب النهائي)',
        defaultCost: 600000,
        sessionCount: 1,
        duration: 90,
        procedureDetails: 'شق اللثة، حفر العظم، وضع الزرعة، الخياطة',
        materials: ['زرعة، خيوط، طقم زراعة'],
        requiresLab: false
    }
];
