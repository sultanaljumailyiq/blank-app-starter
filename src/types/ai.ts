export type AIAgentType = 'image_analysis' | 'doctor_assistant' | 'patient_assistant';

export interface AIAgentConfig {
    id: AIAgentType;
    name: string;
    description: string;
    provider: 'openai' | 'anthropic' | 'google' | 'deepseek' | 'banana' | 'mock';
    apiKey?: string;
    model: string;
    isActive: boolean;
    systemRules: string; // The "Rules" the user requested
    temperature: number;
}

export type DentalImageType =
    | 'panoramic_xray'
    | 'periapical_xray'
    | 'bitewing_xray'
    | 'cbct_slice'
    | 'intraoral_phone_photo'
    | 'extraoral_face_photo'
    | 'unknown';

export interface AIAnalysisMetadata {
    isMock: boolean;
    provider: string;
    model?: string;
    processingTime?: number;
}

export interface AIAnalysisResult {
    image_type?: DentalImageType;
    image_quality?: string | {
        rating: 'excellent' | 'good' | 'fair' | 'poor';
        problems: string[];
        retake_recommended: boolean;
    };
    issues: Array<{
        label: string;
        confidence: number;
        box?: [number, number, number, number];
        description?: string;
        tooth_number?: string;
        category?: string;
        severity?: 'low' | 'medium' | 'high';
        clinical_description?: string;
        evidence_visible?: string;
        differential_diagnosis?: string[];
        risk_if_untreated?: string;
        treatment_suggestion?: string;
        treatment_steps?: string[];
        priority?: 'urgent' | 'high' | 'normal' | 'low';
        estimated_sessions?: number;
        matched_treatment_name?: string;
        matched_treatment_price?: number;
        treatment_match_status?: 'matched' | 'manual_pricing_needed';
    }>;
    treatment_plan?: {
        phases: Array<{
            title: string;
            description: string;
            priority: string;
            sessions: number;
            items: string[];
            estimated_cost?: number;
        }>;
        total_sessions?: number;
        total_estimated_cost?: number;
    };
    doctor_notes?: string[];
    patient_friendly_summary?: string;
    follow_up_schedule?: string;
    total_estimated_cost?: number;
    has_clinic_catalog?: boolean;
    summary: string;
    recommendation: string;
    affected_teeth?: string[];
    metadata?: AIAnalysisMetadata;
    // Optional compatibility fields if needed elsewhere
    diagnosis?: string;
    confidence?: number;
    findings?: string[];
    severity?: 'low' | 'medium' | 'high';
}

export interface AIChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    attachments?: {
        type: 'image' | 'file';
        url: string;
        name: string;
    }[];
}
