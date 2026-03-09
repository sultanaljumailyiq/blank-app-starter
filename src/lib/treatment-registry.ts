import { getTreatments } from '../data/mock/assets';
import { ClinicalSchemas } from '../types/clinical-schemas';
import { TreatmentType } from '../types/treatment';

export interface TreatmentWorkflow {
    type: TreatmentType;
    defaultSessions: {
        title: string;
        schemaId: string; // References keys in ClinicalSchemas
        duration: number; // minutes
    }[];
    requiresLab: boolean;
}

// Map "Assets" categories or specific names to workflows
// This Registry acts as the brain telling the system "If user selects 'Root Canal', here are the 3 sessions they need"
export const TreatmentRegistry: Record<string, TreatmentWorkflow> = {
    'general_exam': {
        type: 'general',
        defaultSessions: [
            { title: 'Examination & X-Ray', schemaId: 'restoration', duration: 30 } // Using generic for now
        ],
        requiresLab: false
    },
    'root_canal_molar': {
        type: 'endo',
        defaultSessions: [
            { title: 'Session 1: Access & Cleaning', schemaId: 'endo_access', duration: 60 },
            { title: 'Session 2: Instrumentation', schemaId: 'endo_cleaning', duration: 45 },
            { title: 'Session 3: Obturation', schemaId: 'endo_fill', duration: 45 },
            { title: 'Session 4: Final Restoration', schemaId: 'endo_final_restoration', duration: 45 }
        ],
        requiresLab: false
    },
    'root_canal_anterior': {
        type: 'endo',
        defaultSessions: [
            { title: 'Session 1: Access & Instrumentation', schemaId: 'endo_cleaning', duration: 60 },
            { title: 'Session 2: Obturation', schemaId: 'endo_fill', duration: 45 },
            { title: 'Session 3: Final Restoration', schemaId: 'endo_final_restoration', duration: 45 }
        ],
        requiresLab: false
    },
    'dental_implant': {
        type: 'implant',
        defaultSessions: [
            { title: 'Surgical Placement', schemaId: 'implant_surgery', duration: 90 },
            { title: 'Healing Check & Uncovering', schemaId: 'implant_loading', duration: 30 },
            { title: 'Impression', schemaId: 'crown_prep', duration: 45 },
            { title: 'Final Delivery', schemaId: 'crown_delivery', duration: 30 }
        ],
        requiresLab: true
    },
    'zirconia_crown': {
        type: 'prosthetic',
        defaultSessions: [
            { title: 'Preparation & Impression', schemaId: 'crown_prep', duration: 60 },
            { title: 'Try-in (Optional)', schemaId: 'crown_tryin', duration: 30 },
            { title: 'Cementation', schemaId: 'crown_delivery', duration: 30 }
        ],
        requiresLab: true
    },
    'composite_filling': {
        type: 'general',
        defaultSessions: [
            { title: 'Restoration Procedure', schemaId: 'restoration', duration: 45 }
        ],
        requiresLab: false
    }
};

// Helper to find the best matching workflow based on the asset Name or Category from AssetsTreatments
export const getWorkflowForAsset = (assetName: string, category: string): TreatmentWorkflow => {
    // 1. Try exact match (normalized)
    const normalizedName = assetName.toLowerCase().replace(/\s+/g, '_');
    // Simple heuristic matching
    if (normalizedName.includes('root_canal') || category.includes('endo') || category.includes('جذور')) {
        return TreatmentRegistry['root_canal_molar'];
    }
    if (normalizedName.includes('implant') || category.includes('implant') || category.includes('زراعة')) {
        return TreatmentRegistry['dental_implant'];
    }
    if (normalizedName.includes('crown') || category.includes('prosthetic') || category.includes('تعويضات') || category.includes('تجميل')) {
        return TreatmentRegistry['zirconia_crown'];
    }

    // Default Fallback
    return TreatmentRegistry['composite_filling'];
};
