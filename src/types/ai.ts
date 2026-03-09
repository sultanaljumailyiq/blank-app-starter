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

export interface AIAnalysisMetadata {
    isMock: boolean;
    provider: string;
    model?: string;
    processingTime?: number;
}

export interface AIAnalysisResult {
    issues: Array<{
        label: string;
        confidence: number;
        box?: [number, number, number, number];
        description?: string;
    }>;
    summary: string;
    recommendation: string;
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
