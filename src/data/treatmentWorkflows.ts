export const treatmentWorkflows: Record<string, any> = {
    'علاج عصب (Root Canal)': {
        type: 'endo',
        requiresLab: false,
        defaultSessions: [
            { title: 'فتح العصب وتنظيف القنوات', duration: 45, schemaId: 'endo_access' },
            { title: 'توسيع القنوات وحشوة مؤقتة', duration: 45, schemaId: 'endo_cleaning' },
            { title: 'حشو العصب (Obturation)', duration: 45, schemaId: 'endo_obturation' }
        ]
    },
    'حشوة ضوئية (Composite)': {
        type: 'restorative',
        requiresLab: false,
        defaultSessions: [
            { title: 'إزالة التسوس وتحضير السن', duration: 30, schemaId: 'restorative_prep' },
            { title: 'وضع الحشوة والإنهاء', duration: 30, schemaId: 'restorative_fill' }
        ]
    },
    'تاج زركون (Zirconia Crown)': {
        type: 'prosthetic',
        requiresLab: true,
        defaultSessions: [
            { title: 'تحضير السن وأخذ الطبعة', duration: 60, schemaId: 'crown_prep' },
            { title: 'تجربة التاج (Try-in)', duration: 30, schemaId: 'crown_tryin' },
            { title: 'تسليم التاج (Cementation)', duration: 30, schemaId: 'crown_delivery' }
        ]
    },
    'تقويم أسنان (Orthodontics)': {
        type: 'ortho',
        requiresLab: false,
        defaultSessions: [
            { title: 'استشارة وأخذ طبعات', duration: 45, schemaId: 'ortho_consult' },
            { title: 'تركيب التقويم (Bonding)', duration: 90, schemaId: 'ortho_bonding' },
            { title: 'متابعة دورية', duration: 30, schemaId: 'ortho_adjustment' }
        ]
    },
    'تنظيف وتلميع (Scaling & Polishing)': {
        type: 'preventive',
        requiresLab: false,
        defaultSessions: [
            { title: 'تنظيف وتلميع', duration: 45, schemaId: 'hygiene_cleaning' }
        ]
    },
    'تبييض أسنان (Whitening)': {
        type: 'cosmetic',
        requiresLab: false,
        defaultSessions: [
            { title: 'جلسة تبييض', duration: 60, schemaId: 'whitening_session' }
        ]
    }
};
