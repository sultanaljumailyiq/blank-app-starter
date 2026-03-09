import { TreatmentPlan, TreatmentType, TreatmentSession } from '../types/treatment';
// import { v4 as uuidv4 } from 'uuid'; // Removed to avoid dependency

// Simple ID generator if uuid is not available
const generateId = () => Math.random().toString(36).substr(2, 9);

export const createDefaultPlan = (
    type: TreatmentType,
    toothNumber: number,
    patientId: string
): TreatmentPlan => {
    const planId = generateId();
    const startDate = new Date().toISOString().split('T')[0];

    let sessions: TreatmentSession[] = [];
    let cost = 0;

    switch (type) {
        case 'endo':
            cost = 350000; // IQD
            sessions = [
                {
                    id: generateId(),
                    number: 1,
                    title: 'جلسة أولى - فتح العصب',
                    status: 'pending',
                    notes: 'Opening Access, Pulpectomy, Initial Irrigation',
                    data: { canalCount: 0, workingLength: 0 }
                },
                {
                    id: generateId(),
                    number: 2,
                    title: 'جلسة ثانية - تحديد الطول والتنظيف',
                    status: 'pending',
                    notes: 'Working Length Determination, BMI, Instrumentation',
                },
                {
                    id: generateId(),
                    number: 3,
                    title: 'جلسة ثالثة - الحشو الجذري',
                    status: 'pending',
                    notes: 'Obturation (Gutta Percha)',
                },
                {
                    id: generateId(),
                    number: 4,
                    title: 'جلسة رابعة - الحشوة النهائية',
                    status: 'pending',
                    notes: 'Final Restoration / Build-up',
                }
            ];
            break;

        case 'implant':
            cost = 750000;
            sessions = [
                {
                    id: generateId(),
                    number: 1,
                    title: 'المرحلة الجراحية - زرع الغرسة',
                    status: 'pending',
                    notes: 'Surgical Placement of Implant Fixture',
                },
                {
                    id: generateId(),
                    number: 2,
                    title: 'مرحلة الشفاء - كشف الزرعة',
                    status: 'pending',
                    notes: 'Healing Abutment Placement (after 3-6 months)',
                },
                {
                    id: generateId(),
                    number: 3,
                    title: 'المرحلة التعويضية - التركيب النهائي',
                    status: 'pending',
                    notes: 'Final Crown Delivery',
                }
            ];
            break;

        case 'prosthetic':
            cost = 150000;
            sessions = [
                {
                    id: generateId(),
                    number: 1,
                    title: 'تحضير السن وأخذ الطبعة',
                    status: 'pending',
                    notes: 'Tooth Preparation, Impression Taking, Shade Selection',
                },
                {
                    id: generateId(),
                    number: 2,
                    title: 'تثبيت التاج النهائي',
                    status: 'pending',
                    notes: 'Cementation of Final Crown',
                }
            ];
            break;

        default:
            cost = 50000;
            sessions = [
                {
                    id: generateId(),
                    number: 1,
                    title: 'جلسة علاجية',
                    status: 'pending',
                    notes: 'Treatment Session',
                }
            ];
    }

    return {
        id: planId,
        patientId,
        toothNumber,
        type,
        status: 'planned',
        totalSessions: sessions.length,
        completedSessions: 0,
        progress: 0,
        sessions,
        cost,
        paid: 0,
        startDate
    };
};
