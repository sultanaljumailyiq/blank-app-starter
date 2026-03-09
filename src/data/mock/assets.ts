// Types
export interface TreatmentAsset {
    id: string;
    name: string;
    category: string;
    basePrice: number;
    costEstimate: number;
    profitMargin: number;
    popularity: number;
    totalRevenue: number;
    isActive: boolean;
    expectedSessions: number; // New field for session management
    isComplex: boolean;
    defaultPhases?: string[];
    scope?: 'tooth' | 'general' | 'both';
}

export interface InventoryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    minQuantity: number;
    price: number;
    expiryDate?: string;
    clinicId?: string; // Added clinicId
}

export interface ExpenseCategory {
    id: string;
    name: string;
    isSystem?: boolean;
}

export interface FinancialTransaction {
    id: string;
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: number;
    date: string;
    relatedId?: string; // ID of treatment, inventory, etc.
    patientId?: string; // For revenue/lab
    doctorId?: string; // For revenue/commission
    staffId?: string; // Who recorded it (Attribution)
    quantity?: number; // For inventory items
    itemName?: string; // Snapshot of item name (for inventory/treatments)
    subType?: string; // 'remaining', 'new_session', etc.
    labName?: string; // For Lab Orders
    clinicId?: string; // Ensure this is present
}

export interface DentalLab {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    specialties: string[];
    rating: number;
    reviewCount: number;
    price: {
        panoramic: number;
        periapical: number;
        bitewing: number;
        occlusal: number;
        coneBeam: number;
        gumAnalysis: number;
    };
    isFavorite: boolean;
    isAccredited: boolean;
    workingHours: string;
    responseTime: string;
    isCustom?: boolean;
    certifications?: string[];
    equipment?: string[];
    services?: string[];
    turnaroundTime?: string;
    availability?: string;
    languages?: string[];
    delegates?: {
        id: string;
        name: string;
        phone: string;
        status: 'active' | 'inactive';
        areas?: string[];
    }[];
}

export interface DentalLabRequest {
    id: string;
    patientName: string;
    patientId?: string;
    clinicName: string;
    labName: string;
    doctorName: string;
    testType: string;
    priority: 'low' | 'normal' | 'high' | 'urgent' | 'emergency';
    status: 'awaiting_lab_representative' | 'awaiting_delivery' | 'in_lab' | 'in_progress' | 'delayed' | 'returned' | 'received' | 'completed' | 'cancelled';
    expectedDate: string;
    sentDate: string;
    price: number;
    notes?: string;
    paymentStatus: 'paid' | 'unpaid' | 'partial';
    paymentAmount: number;
    dueDate?: string;
    treatmentType?: 'crown' | 'bridge' | 'partial_denture' | 'complete_denture' | 'implant' | 'orthodontic' | 'cosmetic' | 'restoration' | 'root_canal' | 'denture' | 'xray' | 'other';
    createdAt?: string;
    updatedAt?: string;
    contactInfo?: {
        phone: string;
        email: string;
    };
    urgency?: 'routine' | 'urgent' | 'stat';
    category?: 'routine' | 'special' | 'emergency';
    results?: {
        value: string;
        unit?: string;
        reference?: string;
        status: 'normal' | 'abnormal' | 'critical';
    }[];
    toothNumber?: string;
    deliveryDate?: string;
    receivedDate?: string;
    sampleType?: 'blood' | 'tissue' | 'saliva' | 'other';
    temperature?: string;
    volume?: string;
    collectedBy?: string;
    // Extended fields for Lab Orders integration
    isCustomLab?: boolean;
    laboratoryId?: string | null;
    delegate_id?: string;
    delegate_name?: string;
    pickup_delegate_id?: string;
    pickup_delegate_name?: string;
    pickup_delegate_phone?: string;
    delivery_delegate_id?: string;
    delivery_delegate_name?: string;
    delivery_delegate_phone?: string;
    return_reason?: string;
    is_return_cycle?: boolean;
}

export interface Patient {
    id: string;
    name: string;
    age?: number;
    gender?: 'male' | 'female';
    phone: string;
    email?: string;
    address?: string;
    status: 'active' | 'inactive' | 'emergency';
    paymentStatus: 'paid' | 'pending' | 'overdue';
    lastVisit?: string;
    totalVisits: number;
    balance: number;
    clinicId?: string;
    medicalHistory?: string;
    notes?: string;
    teethConditions?: any[];
    treatmentPlan?: {
        id: string;
        date: string;
        status: 'active' | 'completed' | 'draft';
        items: any[];
    }[];
    existingTreatments?: string[];
    medicalHistoryData?: {
        vitals: { weight: string; height: string; bp: string; sugar: string; pulse: string; };
        conditions: string[];
        allergies: string[];
        habits: string[];
        notes: string;
    };
}


export interface OnlineRequest {
    id: string;
    patientName: string;
    source: string;
    date: string;
    time: string;
    phone: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    hasFile?: boolean;
}

// Initial Data
export let treatments: TreatmentAsset[] = [
    // --- 1. وقائي / Preventive ---
    { id: 'prev_1', name: 'فحص دوري شامل', category: 'وقائي', basePrice: 15000, costEstimate: 0, profitMargin: 100, popularity: 90, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'general' },
    { id: 'prev_2', name: 'تنظيف أسنان (Scaling)', category: 'وقائي', basePrice: 25000, costEstimate: 5000, profitMargin: 87, popularity: 95, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'general' },
    { id: 'prev_5', name: 'تلميع الأسنان (Polishing)', category: 'وقائي', basePrice: 25000, costEstimate: 2000, profitMargin: 92, popularity: 85, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'general' },
    { id: 'prev_6', name: 'تطبيق الفلورايد', category: 'وقائي', basePrice: 30000, costEstimate: 5000, profitMargin: 83, popularity: 70, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'general' },
    { id: 'prev_8', name: 'سد الشقوق (Fissure Sealant) - للسن', category: 'وقائي', basePrice: 35000, costEstimate: 5000, profitMargin: 85, popularity: 65, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'prev_9', name: 'تعليمات العناية الفموية', category: 'وقائي', basePrice: 10000, costEstimate: 0, profitMargin: 100, popularity: 50, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'general' },
    { id: 'prev_11', name: 'واقي ليلي (Night Guard)', category: 'وقائي', basePrice: 150000, costEstimate: 50000, profitMargin: 66, popularity: 45, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, defaultPhases: ['أخذ طبعة', 'تسليم'], scope: 'general' },

    // --- 2. ترميمي / Restorative ---
    { id: 'res_2', name: 'حشوة كلاس آينومر (Glass Ionomer)', category: 'ترميمي', basePrice: 50000, costEstimate: 12000, profitMargin: 76, popularity: 70, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'res_4', name: 'حشوة ضوئية (Composite) - سطح واحد', category: 'ترميمي', basePrice: 60000, costEstimate: 12000, profitMargin: 80, popularity: 95, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'res_7', name: 'بناء سن متهدم (Buildup) - كومبوزيت', category: 'ترميمي', basePrice: 100000, costEstimate: 25000, profitMargin: 75, popularity: 50, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'res_8', name: 'حشوة أملغم (Amalgam)', category: 'ترميمي', basePrice: 50000, costEstimate: 10000, profitMargin: 80, popularity: 30, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'res_13', name: 'تغطية لب مباشرة (Direct Pulp Cap)', category: 'ترميمي', basePrice: 30000, costEstimate: 5000, profitMargin: 83, popularity: 35, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'res_14', name: 'تغطية لب غير مباشرة (Indirect Pulp Cap)', category: 'ترميمي', basePrice: 30000, costEstimate: 5000, profitMargin: 83, popularity: 35, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'res_15', name: '(POST)', category: 'ترميمي', basePrice: 120000, costEstimate: 30000, profitMargin: 75, popularity: 40, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'res_17', name: 'إزالة وتد قديم', category: 'ترميمي', basePrice: 80000, costEstimate: 5000, profitMargin: 93, popularity: 15, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'res_18', name: 'حشوة تجميلية (Diastema Closure)', category: 'ترميمي', basePrice: 150000, costEstimate: 20000, profitMargin: 86, popularity: 30, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'res_19', name: 'حشوة وقائية (PRR)', category: 'ترميمي', basePrice: 40000, costEstimate: 5000, profitMargin: 87, popularity: 50, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'res_20', name: 'تبييض داخلي (سن واحد)', category: 'ترميمي', basePrice: 100000, costEstimate: 10000, profitMargin: 90, popularity: 10, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, scope: 'tooth' },
    { id: 'pros_15', name: 'Inlay/Onlay - سيراميك', category: 'ترميمي', basePrice: 250000, costEstimate: 80000, profitMargin: 68, popularity: 10, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, scope: 'tooth' },

    // --- 3. علاج جذور / Endodontics (15) ---
    { id: 'endo_1', name: 'علاج عصب - (RCT)', category: 'علاج جذور', basePrice: 150000, costEstimate: 30000, profitMargin: 80, popularity: 70, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, defaultPhases: ['فتح وتنظيف قنوات', 'حشو قنوات نهائي'], scope: 'tooth' },
    { id: 'endo_4', name: 'إعادة علاج عصب (Re-treatment)', category: 'علاج جذور', basePrice: 200000, costEstimate: 40000, profitMargin: 80, popularity: 20, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, scope: 'tooth' },
    { id: 'endo_6', name: 'بتر اللب (Pulpotomy) - أطفال', category: 'علاج جذور', basePrice: 100000, costEstimate: 20000, profitMargin: 80, popularity: 50, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'endo_7', name: 'استئصال اللب (Pulpectomy) - أطفال', category: 'علاج جذور', basePrice: 120000, costEstimate: 25000, profitMargin: 79, popularity: 40, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'endo_11', name: 'سد ثقب الجذر (Perforation Repair)', category: 'علاج جذور', basePrice: 150000, costEstimate: 40000, profitMargin: 73, popularity: 5, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: true, scope: 'tooth' },
    { id: 'endo_12', name: 'فتح خراج (Abscess Drainage)', category: 'علاج جذور', basePrice: 50000, costEstimate: 5000, profitMargin: 90, popularity: 30, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'endo_13', name: 'Apexogenesis', category: 'علاج جذور', basePrice: 150000, costEstimate: 30000, profitMargin: 80, popularity: 2, totalRevenue: 0, isActive: true, expectedSessions: 3, isComplex: true, scope: 'tooth' },
    { id: 'endo_14', name: 'Apexification', category: 'علاج جذور', basePrice: 200000, costEstimate: 50000, profitMargin: 75, popularity: 2, totalRevenue: 0, isActive: true, expectedSessions: 3, isComplex: true, scope: 'tooth' },


    // --- 4. جراحة / Surgery (20) ---
    { id: 'surg_1', name: 'قلع بسيط (Simple Extraction)', category: 'جراحة', basePrice: 50000, costEstimate: 5000, profitMargin: 90, popularity: 85, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'surg_2', name: 'قلع جراحي (Surgical Extraction)', category: 'جراحة', basePrice: 100000, costEstimate: 15000, profitMargin: 85, popularity: 40, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: true, scope: 'tooth' },
    { id: 'endo_10', name: 'جراحة ذروة الجذر (Apicoectomy)', category: 'جراحة', basePrice: 350000, costEstimate: 50000, profitMargin: 85, popularity: 10, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: true, scope: 'tooth' },
    { id: 'surg_6', name: 'زراعة سنية (Implant) - كوري', category: 'جراحة', basePrice: 600000, costEstimate: 300000, profitMargin: 50, popularity: 50, totalRevenue: 0, isActive: true, expectedSessions: 3, isComplex: true, defaultPhases: ['جراحة الزرع', 'كشف الزرعة', 'تركيب التاج'], scope: 'tooth' },
    { id: 'surg_7', name: 'زراعة سنية (Implant) - سويسري', category: 'جراحة', basePrice: 1000000, costEstimate: 500000, profitMargin: 50, popularity: 40, totalRevenue: 0, isActive: true, expectedSessions: 3, isComplex: true, defaultPhases: ['جراحة الزرع', 'كشف الزرعة', 'تركيب التاج'], scope: 'tooth' },
    { id: 'surg_8', name: 'زراعة سنية (Implant) - ألماني', category: 'جراحة', basePrice: 800000, costEstimate: 400000, profitMargin: 50, popularity: 45, totalRevenue: 0, isActive: true, expectedSessions: 3, isComplex: true, defaultPhases: ['جراحة الزرع', 'كشف الزرعة', 'تركيب التاج'], scope: 'tooth' },
    { id: 'surg_9', name: 'رفع جيب فكي (Sinus Lift)', category: 'جراحة', basePrice: 400000, costEstimate: 100000, profitMargin: 75, popularity: 15, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: true, scope: 'general' },
    { id: 'surg_11', name: 'تطعيم عظمي (Bone Graft)', category: 'جراحة', basePrice: 200000, costEstimate: 100000, profitMargin: 50, popularity: 20, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: true, scope: 'tooth' },
    { id: 'surg_13', name: 'قص اللثة (Gingivectomy) - للسن', category: 'جراحة', basePrice: 50000, costEstimate: 5000, profitMargin: 90, popularity: 30, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'surg_14', name: 'جراحة اللثة التجميلية (Per Quadrant)', category: 'جراحة', basePrice: 250000, costEstimate: 30000, profitMargin: 88, popularity: 15, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: true, scope: 'general' },
    { id: 'surg_15', name: 'Frenectomy', category: 'جراحة', basePrice: 100000, costEstimate: 10000, profitMargin: 90, popularity: 10, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'general' },

    { id: 'surg_18', name: 'معالجة سنخ جاف (Dry Socket)', category: 'جراحة', basePrice: 20000, costEstimate: 2000, profitMargin: 90, popularity: 15, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'surg_19', name: 'استئصال كيس (Cyst Enucleation)', category: 'جراحة', basePrice: 250000, costEstimate: 30000, profitMargin: 88, popularity: 5, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: true, scope: 'both' },
    { id: 'surg_20', name: 'Biopsy', category: 'جراحة', basePrice: 100000, costEstimate: 20000, profitMargin: 80, popularity: 5, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'general' },

    // --- 5. تعويضات / Prosthodontics (25) ---
    { id: 'pros_1', name: 'تاج خزف معدن (PFM Crown)', category: 'تعويضات', basePrice: 150000, costEstimate: 50000, profitMargin: 66, popularity: 80, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, defaultPhases: ['تحضير وطبعة', 'بروفة', 'تسليم'], scope: 'tooth' },
    { id: 'pros_2', name: 'تاج زركون (Zirconia Crown)', category: 'تعويضات', basePrice: 250000, costEstimate: 80000, profitMargin: 68, popularity: 85, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, defaultPhases: ['تحضير وطبعة', 'بروفة', 'تسليم'], scope: 'tooth' },
    { id: 'pros_3', name: 'تاج إيماكس (E-max Crown)', category: 'تعويضات', basePrice: 300000, costEstimate: 100000, profitMargin: 66, popularity: 70, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, defaultPhases: ['تحضير وطبعة', 'بروفة', 'تسليم'], scope: 'tooth' },
    { id: 'pros_4', name: 'جسر خزف معدن (لكل وحدة)', category: 'تعويضات', basePrice: 150000, costEstimate: 50000, profitMargin: 66, popularity: 60, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, scope: 'tooth' },
    { id: 'pros_5', name: 'جسر زركون (لكل وحدة)', category: 'تعويضات', basePrice: 250000, costEstimate: 80000, profitMargin: 68, popularity: 65, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, scope: 'tooth' },
    { id: 'pros_6', name: 'طقم جزئي أكريليك (Partial Acrylic)', category: 'تعويضات', basePrice: 300000, costEstimate: 50000, profitMargin: 83, popularity: 50, totalRevenue: 0, isActive: true, expectedSessions: 4, isComplex: true, defaultPhases: ['طبعات أولية', 'طبعات نهائية', 'عضة شمعية', 'بروفة أسنان', 'تسليم'], scope: 'general' },
    { id: 'pros_7', name: 'طقم جزئي معدني (Cast Partial)', category: 'تعويضات', basePrice: 600000, costEstimate: 200000, profitMargin: 66, popularity: 30, totalRevenue: 0, isActive: true, expectedSessions: 5, isComplex: true, defaultPhases: ['طبعات أولية', 'طبعات نهائية', 'تجربة معدن', 'عضة شمعية', 'تسليم'], scope: 'general' },
    { id: 'pros_8', name: 'طقم جزئي مرن (Flexible Denture)', category: 'تعويضات', basePrice: 500000, costEstimate: 150000, profitMargin: 70, popularity: 40, totalRevenue: 0, isActive: true, expectedSessions: 4, isComplex: true, scope: 'general' },
    { id: 'pros_9', name: 'طقم كامل (Complete Denture) - فك واحد', category: 'تعويضات', basePrice: 500000, costEstimate: 100000, profitMargin: 80, popularity: 45, totalRevenue: 0, isActive: true, expectedSessions: 5, isComplex: true, defaultPhases: ['طبعات أولية', 'طبعات نهائية', 'عضة شمعية', 'بروفة', 'تسليم'], scope: 'general' },
    { id: 'pros_10', name: 'طقم كامل (Complete Denture) - فكين', category: 'تعويضات', basePrice: 900000, costEstimate: 150000, profitMargin: 83, popularity: 40, totalRevenue: 0, isActive: true, expectedSessions: 5, isComplex: true, scope: 'general' },
    { id: 'pros_11', name: 'تبطين طقم (Reline) - مباشر', category: 'تعويضات', basePrice: 100000, costEstimate: 20000, profitMargin: 80, popularity: 20, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'general' },
    { id: 'pros_12', name: 'تبطين طقم (Reline) - مختبري', category: 'تعويضات', basePrice: 150000, costEstimate: 50000, profitMargin: 66, popularity: 15, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, scope: 'general' },
    { id: 'pros_13', name: 'إصلاح كسر طقم (Denture Repair)', category: 'تعويضات', basePrice: 50000, costEstimate: 10000, profitMargin: 80, popularity: 25, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: true, scope: 'general' },
    { id: 'pros_14', name: 'إضافة سن لطقم', category: 'تعويضات', basePrice: 60000, costEstimate: 15000, profitMargin: 75, popularity: 20, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: true, scope: 'general' },
    { id: 'pros_16', name: 'إلصاق تاج (Recementation)', category: 'تعويضات', basePrice: 25000, costEstimate: 2000, profitMargin: 92, popularity: 35, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'pros_19', name: 'تاج مؤقت (Temporary Crown)', category: 'تعويضات', basePrice: 25000, costEstimate: 2000, profitMargin: 92, popularity: 80, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },
    { id: 'pros_20', name: 'وتد وبناء (Cast Post & Core)', category: 'تعويضات', basePrice: 150000, costEstimate: 40000, profitMargin: 73, popularity: 30, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, scope: 'tooth' },
    { id: 'pros_21', name: 'Richmond Crown', category: 'تعويضات', basePrice: 200000, costEstimate: 60000, profitMargin: 70, popularity: 5, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, scope: 'tooth' },
    { id: 'pros_22', name: 'Veneer (E-max)', category: 'تعويضات', basePrice: 350000, costEstimate: 100000, profitMargin: 71, popularity: 60, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, scope: 'tooth' },
    { id: 'pros_23', name: 'Veneer (Zirconia)', category: 'تعويضات', basePrice: 300000, costEstimate: 80000, profitMargin: 73, popularity: 40, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, scope: 'tooth' },
    { id: 'pros_24', name: 'Lumineer (No prep)', category: 'تعويضات', basePrice: 400000, costEstimate: 150000, profitMargin: 62, popularity: 20, totalRevenue: 0, isActive: true, expectedSessions: 2, isComplex: true, scope: 'tooth' },
    { id: 'pros_25', name: 'إزالة تاج قديم', category: 'تعويضات', basePrice: 30000, costEstimate: 2000, profitMargin: 93, popularity: 45, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'tooth' },

    // --- 6. تجميل / Cosmetic (12) ---
    { id: 'cos_1', name: 'تبييض منزلي (Kit)', category: 'تجميل', basePrice: 250000, costEstimate: 100000, profitMargin: 60, popularity: 70, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'general' },
    { id: 'cos_2', name: 'تبييض ليزر (عيادة)', category: 'تجميل', basePrice: 400000, costEstimate: 80000, profitMargin: 80, popularity: 75, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'general' },

    { id: 'cos_6', name: 'إغلاق فلجة بالكومبوزيت', category: 'تجميل', basePrice: 150000, costEstimate: 20000, profitMargin: 86, popularity: 35, totalRevenue: 0, isActive: true, expectedSessions: 3, isComplex: false, scope: 'general' },
    { id: 'cos_7', name: 'سنايل آرت (Snap-on)', category: 'تجميل', basePrice: 400000, costEstimate: 150000, profitMargin: 62, popularity: 15, totalRevenue: 0, isActive: true, expectedSessions: 3, isComplex: true, scope: 'general' },
    { id: 'cos_8', name: 'Botox (Smile correction)', category: 'تجميل', basePrice: 250000, costEstimate: 100000, profitMargin: 60, popularity: 20, totalRevenue: 0, isActive: true, expectedSessions: 3, isComplex: false, scope: 'general' },
    { id: 'cos_9', name: 'Fillers (Lip)', category: 'تجميل', basePrice: 300000, costEstimate: 150000, profitMargin: 50, popularity: 15, totalRevenue: 0, isActive: true, expectedSessions: 3, isComplex: false, scope: 'general' },

    { id: 'cos_12', name: 'Mock-up', category: 'تجميل', basePrice: 50000, costEstimate: 5000, profitMargin: 90, popularity: 30, totalRevenue: 0, isActive: true, expectedSessions: 1, isComplex: false, scope: 'general' },
];

export let inventory: InventoryItem[] = [
    // Anesthesia
    { id: 'inv_1', name: 'بنج موضعي (Local Anesthetic) - Lidocaine', category: 'medicines', quantity: 45, minQuantity: 10, unit: 'علبة (50 امبولة)', price: 45000, clinicId: '1' },
    { id: 'inv_2', name: 'بنج موضعي (Local Anesthetic) - Articaine', category: 'medicines', quantity: 8, minQuantity: 10, unit: 'علبة (50 امبولة)', price: 50000, clinicId: '1' },
    { id: 'inv_3', name: 'أبر بنج (Needles) - قصيرة 30G', category: 'consumables', quantity: 20, minQuantity: 5, unit: 'علبة (100 قطعة)', price: 15000, clinicId: '1' },
    { id: 'inv_4', name: 'أبر بنج (Needles) - طويلة 27G', category: 'consumables', quantity: 15, minQuantity: 5, unit: 'علبة (100 قطعة)', price: 15000, clinicId: '1' },

    // Restorative (Fillings)
    { id: 'inv_5', name: 'حشوة كومبوزيت (Composite) - A1', category: 'consumables', quantity: 3, minQuantity: 5, unit: 'تيوب (4g)', price: 35000, clinicId: '1' },
    { id: 'inv_6', name: 'حشوة كومبوزيت (Composite) - A2', category: 'consumables', quantity: 12, minQuantity: 5, unit: 'تيوب (4g)', price: 35000, clinicId: '1' },
    { id: 'inv_7', name: 'حشوة كومبوزيت (Composite) - A3', category: 'consumables', quantity: 6, minQuantity: 5, unit: 'تيوب (4g)', price: 35000, clinicId: '1' },
    { id: 'inv_8', name: 'Bending Agents (Bond)', category: 'consumables', quantity: 4, minQuantity: 2, unit: 'علبة (5ml)', price: 45000, clinicId: '1' },
    { id: 'inv_9', name: 'Etching Gel', category: 'consumables', quantity: 10, minQuantity: 3, unit: 'حقنة (3ml)', price: 8000, clinicId: '1' },

    // Disposables
    { id: 'inv_10', name: 'قطن رول (Cotton Rolls)', category: 'consumables', quantity: 4, minQuantity: 10, unit: 'باكيت (500 قطعة)', price: 6000, clinicId: '1' },
    { id: 'inv_11', name: 'شاش طبي (Gauze)', category: 'consumables', quantity: 20, minQuantity: 5, unit: 'باكيت', price: 5000, clinicId: '1' },
    { id: 'inv_12', name: 'ماصة لعاب (Saliva Ejector)', category: 'consumables', quantity: 5, minQuantity: 10, unit: 'كيس (100 قطعة)', price: 4000, clinicId: '1' },
    { id: 'inv_13', name: 'قفازات طبية (Gloves) - M', category: 'consumables', quantity: 50, minQuantity: 10, unit: 'علبة (100 زوج)', price: 8000, clinicId: '1' },
    { id: 'inv_13b', name: 'أقنعة وجه (Face Masks)', category: 'consumables', quantity: 8, minQuantity: 5, unit: 'علبة (50 قطعة)', price: 3000, clinicId: '1' },

    { id: 'inv_17', name: 'ريش حفر (Burs) - Diamond', category: 'instruments', quantity: 20, minQuantity: 5, unit: 'شريط', price: 15000, clinicId: '1' },
    { id: 'inv_18', name: 'ريش حفر (Burs) - Carbide', category: 'instruments', quantity: 15, minQuantity: 5, unit: 'شريط', price: 20000, clinicId: '1' },

    // Endodontics
    { id: 'inv_19', name: 'File K-Type #15-40', category: 'instruments', quantity: 12, minQuantity: 4, unit: 'علبة', price: 25000, clinicId: '1' },
    { id: 'inv_20', name: 'Gutta Percha Points', category: 'consumables', quantity: 15, minQuantity: 5, unit: 'علبة', price: 18000, clinicId: '1' },
    { id: 'inv_21', name: 'Paper Points', category: 'consumables', quantity: 15, minQuantity: 5, unit: 'علبة', price: 15000, clinicId: '1' },
    { id: 'inv_22', name: 'Irrigation Syringes', category: 'consumables', quantity: 40, minQuantity: 10, unit: 'علبة', price: 12000, clinicId: '1' },

    // Impression
    { id: 'inv_14', name: 'تراي طبعة (Impresson Trays)', category: 'supplies', quantity: 10, minQuantity: 2, unit: 'طقم', price: 25000, clinicId: '1' },
    { id: 'inv_15', name: 'الجينات (Alginate)', category: 'supplies', quantity: 15, minQuantity: 3, unit: 'كيس (500g)', price: 18000, clinicId: '1' },
    { id: 'inv_16', name: 'جبس (Stone)', category: 'supplies', quantity: 5, minQuantity: 1, unit: 'كيس (1kg)', price: 12000, clinicId: '1' },

    // --- Clinic 2 Inventory (Digital Smile Center) ---
    // High-end equipment and cosmetic supplies
    { id: 'inv_c2_1', name: '3D Printer Resin (Dental Model)', category: 'supplies', quantity: 1, minQuantity: 5, unit: 'Litre', price: 150000, clinicId: '2' },
    { id: 'inv_c2_2', name: 'Zirconia Blocks (A2)', category: 'consumables', quantity: 20, minQuantity: 5, unit: 'Block', price: 45000, clinicId: '2' },
    { id: 'inv_c2_3', name: 'Digital Scanner Tips', category: 'instruments', quantity: 5, minQuantity: 1, unit: 'pcs', price: 120000, clinicId: '2' },
    { id: 'inv_c2_4', name: 'Ceramic Polishing Paste', category: 'consumables', quantity: 8, minQuantity: 3, unit: 'Jar', price: 35000, clinicId: '2' },
    { id: 'inv_c2_5', name: 'Implant Screw Driver Kit', category: 'instruments', quantity: 2, minQuantity: 1, unit: 'Kit', price: 250000, clinicId: '2' },
    { id: 'inv_c2_6', name: 'بنج موضعي (Local Anesthetic)', category: 'medicines', quantity: 30, minQuantity: 10, unit: 'علبة', price: 45000, clinicId: '2' }, // Common item
];


let expenseCategories: ExpenseCategory[] = [
    { id: 'cat1', name: 'الرواتب', isSystem: true },
    { id: 'cat2', name: 'المخزون', isSystem: true },
    { id: 'cat3', name: 'الأجهزة والمعدات', isSystem: false },
    { id: 'cat4', name: 'الصيانة', isSystem: false },
    { id: 'cat5', name: 'الكهرباء', isSystem: false },
    { id: 'cat6', name: 'الإنترنت', isSystem: false },
    { id: 'cat7', name: 'الإيجار', isSystem: false },
    { id: 'cat8', name: 'طلبات المختبر', isSystem: true }
];

let transactions: FinancialTransaction[] = []; // Deprecated: Moved to Supabase 'financial_transactions'

let dentalLabs: DentalLab[] = [
    {
        id: 'lab1',
        name: 'مختبر الأضواء المتقدم للأسنان',
        address: 'شارع الرشيد، بغداد - الكرادة',
        phone: '07701234567',
        email: 'info@brightlab.iq',
        specialties: ['أشعة بانوراما', 'أشعة مقطعية ثلاثية الأبعاد', 'تحليل اللثة', 'تيجان خزفية', 'تيجان زركون'],
        rating: 4.9,
        reviewCount: 156,
        price: {
            panoramic: 25000,
            periapical: 15000,
            bitewing: 12000,
            occlusal: 18000,
            coneBeam: 75000,
            gumAnalysis: 35000
        },
        isFavorite: true,
        isAccredited: true,
        workingHours: '8:00 ص - 6:00 م',
        responseTime: '2-4 ساعات',
        certifications: ['ISO 15189', 'IRAQ MOHS'],
        equipment: ['CBCT', 'Digital Panoramic', 'Intraoral Scanner'],
        services: ['أشعة رقمية', 'تصوير ثلاثي الأبعاد', 'تحليل متقدم'],
        turnaroundTime: '24-48 ساعة',
        availability: 'متاح',
        languages: ['العربية', 'الإنجليزية']
    },
    {
        id: 'lab2',
        name: 'مركز الأشعة الرقمية للأسنان',
        address: 'شارع الكرادة، بغداد - District 315',
        phone: '07901234567',
        email: 'contact@digitalscan.iq',
        specialties: ['أشعة رقمية', 'أشعة مقطعية', 'تصوير ثلاثي الأبعاد', 'فحص الجذور', 'تجميل سني'],
        rating: 4.7,
        reviewCount: 89,
        price: {
            panoramic: 22000,
            periapical: 13000,
            bitewing: 10000,
            occlusal: 16000,
            coneBeam: 70000,
            gumAnalysis: 30000
        },
        isFavorite: false,
        isAccredited: true,
        workingHours: '9:00 ص - 7:00 م',
        responseTime: '4-6 ساعات',
        certifications: ['IRAQ MOHS', 'NABL'],
        equipment: ['Digital X-ray', '3D Scanner', 'AI Analysis'],
        services: ['أشعة فورية', 'تقارير ذكية', 'تحليل بالذكاء الاصطناعي'],
        turnaroundTime: '1-2 ساعة',
        availability: 'متاح 24/7',
        languages: ['العربية'],
        delegates: [
            { id: 'del1', name: 'علي محمد', phone: '07701234567', status: 'active', areas: ['المنصور', 'اليرموك'] },
            { id: 'del2', name: 'حسين جاسم', phone: '07901234567', status: 'active', areas: ['الكرادة', 'الجادري'] }
        ]
    }
];

let labRequests: DentalLabRequest[] = [
    {
        id: 'DLAB-2024-001',
        patientName: 'أحمد محمد العلي',
        patientId: 'P2024-001',
        clinicName: 'عيادة د. سارة أحمد للأسنان',
        labName: 'مختبر الأضواء المتقدم للأسنان',
        doctorName: 'د. فاطمة أحمد القحطاني',
        testType: 'تاج خزفي - سيراميك عالي الجودة',
        status: 'in_progress',
        priority: 'normal',
        expectedDate: '2025-11-15',
        sentDate: '2025-11-10',
        price: 250000,
        paymentStatus: 'paid',
        paymentAmount: 250000,
        dueDate: '2025-11-20',
        toothNumber: '16',
        treatmentType: 'crown',
        notes: 'تاج للضرس العلوي الأيمن، مادة سيراميك عالية الجودة',
        createdAt: '2025-11-10T10:30:00Z',
        updatedAt: '2025-11-10T14:20:00Z',
        contactInfo: {
            phone: '07901234567',
            email: 'ahmed.ali@email.com'
        },
        urgency: 'routine',
        category: 'routine',
        results: [
            {
                value: 'مطابق للمواصفات',
                unit: '',
                reference: 'Standard ceramic crown specs',
                status: 'normal'
            }
        ]
    },
    {
        id: 'DLAB-2024-C2-001',
        patientName: 'سارة أحمد',
        patientId: 'p_c2_1',
        clinicName: 'مركز الابتسامة الرقمي',
        labName: 'مختبر الأضواء المتقدم للأسنان',
        doctorName: 'د. علي حسين',
        testType: 'Surgical Guide',
        status: 'received',
        priority: 'high',
        expectedDate: '2025-11-14',
        sentDate: '2025-11-12',
        price: 150000,
        paymentStatus: 'paid',
        paymentAmount: 150000,
        contactInfo: { phone: '07705556666', email: 'sara@email.com' },
        urgency: 'urgent',
        category: 'special',
        results: [{ value: 'Ready for surgery', status: 'normal' }]
    },
    // Manual Lab Order (User Request)
    {
        id: 'ord-2',
        patientName: 'Hassan Amir',
        patientId: 'p_man_1',
        clinicName: 'عيادة النور',
        labName: 'مختبر المدينة الخاص',
        doctorName: 'د. الحالي',
        testType: 'Orthodontic Retainer',
        status: 'completed',
        priority: 'urgent',
        expectedDate: '2025-12-19',
        sentDate: '2025-12-15',
        price: 50000,
        paymentStatus: 'unpaid',
        paymentAmount: 0,
        contactInfo: { phone: '07700000000', email: 'hassan@email.com' },
        urgency: 'urgent',
        category: 'routine',
        isCustomLab: true, // This flag ensures it shows in Manual Lab profile
        laboratoryId: null,
        results: []
    }
];

// Data Accessors (Getters)
export const getTreatments = () => [...treatments];
export const getInventory = () => [...inventory];
export const getExpenseCategories = () => [...expenseCategories];
export const getTransactions = () => [...transactions];
export const getLabs = () => [...dentalLabs];
export const getLabRequests = () => [...labRequests];

// --- Labs ---
export const addLab = (lab: DentalLab) => {
    dentalLabs = [...dentalLabs, lab];
    return lab;
};

export const updateLab = (id: string, updates: Partial<DentalLab>) => {
    dentalLabs = dentalLabs.map(l => l.id === id ? { ...l, ...updates } : l);
};

// --- Treatments ---
export const addTreatment = (item: Omit<TreatmentAsset, 'id'>) => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    treatments = [newItem, ...treatments];
    return newItem;
};

export const updateTreatment = (id: string, updates: Partial<TreatmentAsset>) => {
    treatments = treatments.map(t => t.id === id ? { ...t, ...updates } : t);
};

// --- Inventory ---
export const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    inventory = [newItem, ...inventory];
    return newItem;
};

export const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    inventory = inventory.map(i => i.id === id ? { ...i, ...updates } : i);
};

export const updateStock = (id: string, delta: number) => {
    inventory = inventory.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i);
};

// --- Finance ---
export const addTransaction = (transaction: Omit<FinancialTransaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Math.random().toString(36).substr(2, 9) };
    transactions = [newTransaction, ...transactions];
    return newTransaction;
};

export const addExpenseCategory = (name: string, isSystem: boolean = false) => {
    const newCat = { id: Math.random().toString(36).substr(2, 9), name, isSystem };
    expenseCategories = [...expenseCategories, newCat];
    return newCat;
};

export const updateExpenseCategory = (id: string, name: string) => {
    expenseCategories = expenseCategories.map(c => c.id === id ? { ...c, name } : c);
};

export const deleteExpenseCategory = (id: string) => {
    expenseCategories = expenseCategories.filter(c => c.id !== id);
};

export const addLabRequest = (request: DentalLabRequest) => {
    labRequests = [request, ...labRequests];
    return request;
};

export const updateLabRequest = (id: string, updates: Partial<DentalLabRequest>) => {
    labRequests = labRequests.map(r => r.id === id ? { ...r, ...updates } : r);
};

// --- Patients ---
let clinicPatients: Patient[] = []; // Deprecated: Moved to Supabase 'patients'


export const getPatients = () => [...clinicPatients];
export const addPatient = (patient: Patient) => {
    clinicPatients = [patient, ...clinicPatients];
    return patient;
};
export const updatePatient = (id: string, updates: Partial<Patient>) => {
    clinicPatients = clinicPatients.map(p => p.id === id ? { ...p, ...updates } : p);
};
export const deletePatient = (id: string) => {
    clinicPatients = clinicPatients.filter(p => p.id !== id);
};

// --- Online Requests ---
let onlineRequests: OnlineRequest[] = [
    {
        id: 'req-1',
        patientName: 'علي سمير',
        source: 'map',
        date: new Date().toISOString().split('T')[0],
        time: '10:30',
        phone: '07701234567',
        status: 'pending'
    },
    {
        id: 'req-2',
        patientName: 'زينب هادي',
        source: 'app',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '14:00',
        phone: '07809876543',
        status: 'pending'
    }
];

export const getOnlineRequests = () => [...onlineRequests];
export const addOnlineRequest = (request: OnlineRequest) => {
    onlineRequests = [...onlineRequests, { ...request, id: `req-${Date.now()}` }];
};
export const updateOnlineRequest = (id: string, updates: Partial<OnlineRequest>) => {
    onlineRequests = onlineRequests.map(r => r.id === id ? { ...r, ...updates } : r);
};

// --- Aggregated Helpers ---

export interface ActivityItem {
    id: string;
    type: 'appointment' | 'patient' | 'finance' | 'lab' | 'inventory';
    title: string;
    description: string;
    date: string;
    icon?: string;
    status?: string;
    amount?: number;
    clinicId: string;
}

export const getRecentActivities = (limit: number = 20): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    // Transactions
    transactions.forEach(t => {
        activities.push({
            id: `fin-${t.id}`,
            type: 'finance',
            title: t.type === 'income' ? 'إيراد جديد' : 'مصروف جديد',
            description: `${t.category}: ${t.description} - ${(t.amount).toLocaleString()} د.ع`,
            date: t.date,
            status: t.type,
            clinicId: t.clinicId || '1'
        });
    });

    // Lab Requests
    labRequests.forEach(l => {
        activities.push({
            id: `lab-${l.id}`,
            type: 'lab',
            title: 'طلب مختبر جديد',
            description: `${l.testType} - ${l.patientName}`,
            date: l.createdAt || l.sentDate,
            status: l.status,
            clinicId: '1'
        });
    });

    // Patients
    clinicPatients.forEach(p => {
        activities.push({
            id: `pat-${p.id}`,
            type: 'patient',
            title: 'مريض جديد',
            description: p.name,
            date: p.lastVisit || new Date().toISOString(),
            status: 'active',
            clinicId: p.clinicId || '1'
        });
    });

    // Online Requests
    onlineRequests.forEach(r => {
        activities.push({
            id: `req-${r.id}`,
            type: 'appointment',
            title: 'حجز إلكتروني',
            description: `${r.patientName} - ${r.time}`,
            date: `${r.date}T${r.time}:00`,
            status: r.status,
            clinicId: '1'
        });
    });

    return activities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
};

export const getLowStockItems = (limit: number = 5) => {
    return inventory
        .filter(i => i.quantity <= i.minQuantity)
        .map(i => ({
            id: i.id,
            item: i.name,
            clinicName: i.clinicId === '2' ? 'مركز الابتسامة' : 'عيادة النور',
            priority: i.quantity === 0 ? 'عالية جداً' : 'عالية',
            quantity: `${i.quantity} ${i.unit}`,
            color: i.quantity === 0 ? 'red' : 'yellow',
            clinicId: i.clinicId || '1'
        }))
        .slice(0, limit);
};

// Legacy Exports
export { treatments as mockTreatments, inventory as mockInventory, expenseCategories as mockExpenseCategories };
