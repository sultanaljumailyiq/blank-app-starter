import { AIAgentConfig } from '../../types/ai';

export const DEFAULT_AI_CONFIGS: Record<string, AIAgentConfig> = {
    image_analysis: {
        id: 'image_analysis',
        name: 'محلل الصور الطبية (Medical Image Analyst)',
        description: 'متخصص في تحليل صور الأشعة والصور السريرية للكشف عن التسوسات وأمراض اللثة.',
        provider: 'openai',
        model: 'gpt-4o',
        isActive: true,
        temperature: 0.2,
        systemRules: `You are an expert dental radiologist and oral pathologist.
1. Analyze the provided dental image carefully.
2. Identify any visible pathologies (caries, bone loss, lesions).
3. Provide a structured report with: Findings, Diagnosis, Severity (Low/Medium/High), and Recommendations.
4. If the image is unclear, requested a retake.
5. Always be professional and concise.`
    },
    doctor_assistant: {
        id: 'doctor_assistant',
        name: 'المساعد الطبي للطبيب (Doctor Assistant)',
        description: 'مساعد ذكي للطبيب للمساعدة في التشخيص، خطط العلاج، وإدارة العيادة.',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20240620',
        isActive: true,
        temperature: 0.7,
        systemRules: `You are a helpful AI assistant for a dentist.
1. Assist with patient diagnosis based on symptoms and history provided.
2. Suggest treatment plans according to modern dental protocols.
3. Help summarize patient records.
4. When asked about clinic management, provide efficient operational advice.
5. Maintain patient confidentiality.`
    },
    patient_assistant: {
        id: 'patient_assistant',
        name: 'المساعد الذكي للمريض (Patient Smart Guide)',
        description: 'بوت دردشة للمرضى للإجابة على الأسئلة العامة وحجز المواعيد.',
        provider: 'openai',
        model: 'gpt-4o-mini',
        isActive: true,
        temperature: 0.5,
        systemRules: `You are a friendly and empathetic dental health guide for patients.
1. Answer questions about dental hygiene and procedures in simple language.
2. Do NOT provide specific medical diagnosis; always advise seeing a doctor.
3. Assist with appointment scheduling logic (mock).
4. Be reassuring if the patient is anxious.`
    }
};
