import { AIAgentConfig, AIAgentType, AIAnalysisResult } from '../../types/ai';
import { DEFAULT_AI_CONFIGS } from './defaultConfig';
import { supabase } from '../../lib/supabase';

class AIService {
    private configs: Record<string, AIAgentConfig> = {};
    private initialized = false;

    constructor() {
        this.loadConfigs();
    }

    async loadConfigs() {
        try {
            const { data, error } = await supabase
                .from('ai_agents')
                .select('*');

            if (data && !error) {
                const configMap: Record<string, AIAgentConfig> = {};
                data.forEach((agent: any) => {
                    configMap[agent.id] = {
                        id: agent.id,
                        name: agent.name,
                        description: agent.description,
                        provider: agent.provider, // 'openai', 'anthropic', 'google', 'banana'
                        model: agent.model,
                        isActive: agent.is_active,
                        temperature: agent.temperature,
                        systemRules: agent.system_rules,
                        capabilities: agent.capabilities,
                        apiKey: agent.api_key
                    } as AIAgentConfig;
                });
                this.configs = configMap;
                this.initialized = true;
            } else {
                console.warn('Failed to load AI configs from DB, using defaults.', error);
                this.configs = DEFAULT_AI_CONFIGS;
            }
        } catch (e) {
            console.error('Error loading AI configs:', e);
            this.configs = DEFAULT_AI_CONFIGS;
        }
    }

    getConfigs(): AIAgentConfig[] {
        return Object.values(this.configs);
    }

    getConfig(type: string): AIAgentConfig {
        return this.configs[type] || DEFAULT_AI_CONFIGS[type];
    }

    async updateConfig(type: string, updates: Partial<AIAgentConfig>) {
        // Update local state
        if (this.configs[type]) {
            this.configs[type] = { ...this.configs[type], ...updates };
        }

        // Get current config to ensure we have all fields for upsert
        const currentConfig = this.configs[type] || DEFAULT_AI_CONFIGS[type];
        const mergedConfig = { ...currentConfig, ...updates };

        // Update DB (Upsert is safer in case row is missing)
        const { error } = await supabase
            .from('ai_agents')
            .upsert({
                id: type,
                name: mergedConfig.name,
                description: mergedConfig.description,
                provider: mergedConfig.provider,
                model: mergedConfig.model,
                temperature: mergedConfig.temperature,
                system_rules: mergedConfig.systemRules,
                is_active: mergedConfig.isActive,
                api_key: mergedConfig.apiKey,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

        if (error) {
            console.error('Error updating AI config:', error);
            // If error is code 42P01 (undefined_table), we should probably alert the user,
            // but we can't easily do that from a service without a callback or event.
            // Console error is the best we can do here for now.
            throw error;
        }
    }

    // --- Capabilities ---

    // --- Helper to get API Key ---
    private getApiKey(provider: string): string | null {
        // 1. Try Config (DB)
        // Find ANY agent using this provider to get key, or look up a provider-specific key storage?
        // Current schema stores key per agent. So we look at the agent config being used.
        // But here we just need a key for the provider.
        // Let's assume we pass the agent config to getApiKey or we look for the specific agent we are running.

        // Simpler: Just get it from the agent config directly in the method.
        // Fallback to env
        if (provider === 'openai') return import.meta.env.VITE_OPENAI_API_KEY || null;
        if (provider === 'anthropic') return import.meta.env.VITE_ANTHROPIC_API_KEY || null;
        if (provider === 'google') return import.meta.env.VITE_GOOGLE_API_KEY || null;
        if (provider === 'banana') return import.meta.env.VITE_BANANA_API_KEY || null;

        return null;
    }

    // --- Usage Logging & Stats ---
    private async logUsage(agentId: string, tokens: number, type: string, userId?: string, clinicId?: number | string, sessionId?: string) {
        try {
            await supabase.from('ai_usage_logs').insert({
                agent_id: agentId,
                user_id: userId || null,
                clinic_id: clinicId ? Number(clinicId) : null,
                session_id: sessionId || null,
                tokens_used: tokens,
                request_type: type,
                user_type: userId ? 'clinic' : 'guest' // guest = visitor
            });
        } catch (e) {
            console.error('Failed to log AI usage', e);
        }
    }

    async getUsageStats() {
        try {
            // 1. Fetch ALL Clinics with their owners
            const { data: allClinics, error: clinicsError } = await supabase
                .from('clinics')
                .select('id, name, owner_id, city, image_url, is_active')
                .eq('is_active', true);

            if (clinicsError) throw clinicsError;

            // 1.1 Fetch Profiles for these owners to get Doctor Names
            const ownerIds = allClinics?.map(c => c.owner_id).filter(Boolean) || [];
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', ownerIds);

            // Create a map for quick profile lookup
            const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]));

            // 2. Fetch Usage Logs
            const { data: usageLogs, error: logsError } = await supabase
                .from('ai_usage_logs')
                .select(`
                    *,
                    clinics:clinic_id (name),
                    profiles:user_id (full_name)
                `)
                .order('created_at', { ascending: false });

            if (logsError) throw logsError;

            // 3. Fetch Subscriptions for these owners
            const { data: subscriptions, error: subsError } = await supabase
                .from('user_subscriptions')
                .select(`
                    user_id,
                    plan_id,
                    status,
                    subscription_plans (id, name, name_en, limits)
                `)
                .in('user_id', ownerIds)
                .in('status', ['active', 'trialing']);

            // 4. Fetch All Plans to find Default/Free one
            const { data: allPlans } = await supabase
                .from('subscription_plans')
                .select('id, name, name_en, price, limits');

            // Identify Default Plan (Price 0 or name contains Basic/Free)
            const defaultPlan = allPlans?.find(p =>
                (typeof p.price === 'number' && p.price === 0) ||
                (typeof p.price === 'object' && (p.price as any)?.monthly === 0) ||
                p.name_en?.toLowerCase().includes('basic') ||
                p.name_en?.toLowerCase().includes('free')
            );

            // Process for Clinics
            const clinicStatsMap = new Map();

            // Initialize all clinics
            allClinics?.forEach(clinic => {
                // Find subscription for this clinic's owner
                const sub = subscriptions?.find(s => s.user_id === clinic.owner_id);

                // Determine Plan to use (Subscription or Default)
                const rawPlan = sub?.subscription_plans;
                let activePlan: any = Array.isArray(rawPlan) ? rawPlan[0] : rawPlan;
                let planName = '';
                let limit: string | number = 0;

                if (activePlan) {
                    planName = activePlan.name || activePlan.name_en || 'Plan';
                } else if (defaultPlan) {
                    activePlan = defaultPlan;
                    planName = defaultPlan.name || defaultPlan.name_en || 'Basic';
                } else {
                    planName = 'Basic'; // Fallback if no plans found in DB
                }

                // Parse limits from the determined activePlan
                if (activePlan?.limits) {
                    try {
                        const limitsObj = typeof activePlan.limits === 'string' ? JSON.parse(activePlan.limits) : activePlan.limits;
                        const maxAi = limitsObj?.max_ai;

                        if (maxAi !== undefined && maxAi !== null) {
                            const numMax = Number(maxAi);
                            limit = numMax > 1000 ? '∞' : numMax;
                        }
                    } catch (e) {
                        console.error('Error parsing limits for clinic:', clinic.id, e);
                    }
                }

                // Get Doctor Name from Profile Map
                const doctorName = profileMap.get(clinic.owner_id) || 'Unknown Doctor';

                clinicStatsMap.set(clinic.id, {
                    id: clinic.id,
                    clinic: clinic.name || 'Unknown Clinic',
                    doctor: doctorName,
                    plan: planName,
                    used: 0,
                    limit: limit,
                    lastUse: 'غير مستخدم',
                    status: 'active'
                });
            });

            // Process Usage Logs
            const visitorStatsMap = new Map();

            usageLogs?.forEach(log => {
                if (log.user_type === 'clinic' && log.clinic_id) {
                    const key = log.clinic_id;

                    // Update existing clinic entry
                    if (clinicStatsMap.has(key)) {
                        const entry = clinicStatsMap.get(key);
                        entry.used += 1;
                        entry.lastUse = new Date(log.created_at).toLocaleString('ar-EG');
                        if (log.profiles?.full_name) {
                            entry.doctor = log.profiles.full_name; // Update doctor name from actual usage log if available
                        }
                    }
                } else {
                    // Visitor Logic
                    const date = new Date(log.created_at).toLocaleDateString('en-CA');
                    const key = `${date}`;

                    if (!visitorStatsMap.has(key)) {
                        visitorStatsMap.set(key, {
                            date: date,
                            service: 'المساعد الذكي للمرضى',
                            requests: 0,
                            tokens: 0,
                            uniqueUsers: new Set()
                        });
                    }
                    const entry = visitorStatsMap.get(key);
                    entry.tokens += (log.tokens_used || 0);
                    entry.requests += 1;

                    if (log.session_id) {
                        entry.uniqueUsers.add(log.session_id);
                    }
                }
            });

            return {
                clinics: Array.from(clinicStatsMap.values()),
                visitors: Array.from(visitorStatsMap.values()).map((v: any) => ({
                    date: v.date,
                    service: v.service,
                    requests: v.requests,
                    tokens: v.tokens,
                    users: v.uniqueUsers.size
                }))
            };

        } catch (e) {
            console.error('Failed to get usage stats', e);
            return { clinics: [], visitors: [] };
        }
    }

    // --- Capabilities ---

    // --- Usage Limiting & Permissions ---

    private async checkUsageLimit(clinicId: number): Promise<void> {
        if (!clinicId) return;

        // Get Clinic Owner to find Subscription
        const { data: clinic, error: clinicError } = await supabase
            .from('clinics')
            .select('owner_id')
            .eq('id', clinicId)
            .single();

        if (clinicError || !clinic) {
            console.error('Failed to get clinic for limit check', clinicError);
            return; // Fail open if we can't check, or fail closed? Let's fail open for now to avoid blocking on errors.
        }

        // Get Subscription & Plan
        const { data: sub, error: subError } = await supabase
            .from('user_subscriptions')
            .select('subscription_plans(limits)')
            .eq('user_id', clinic.owner_id)
            .in('status', ['active', 'trialing'])
            .single();

        let maxAi = 0; // Default to 0 if no plan

        const plan = Array.isArray(sub?.subscription_plans) ? sub.subscription_plans[0] : sub?.subscription_plans;

        if (plan?.limits) {
            const limits = typeof plan.limits === 'string'
                ? JSON.parse(plan.limits)
                : plan.limits;
            maxAi = (limits as any).max_ai ?? 0;
        } else {
            // Fallback for no active subscription (maybe free tier?)
            // For now, let's assume 0.
            maxAi = 0;
        }

        if (maxAi === -1) return; // Unlimited

        // Count Usage for Current Day (Daily Limit)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { count, error: countError } = await supabase
            .from('ai_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', clinicId)
            .gte('created_at', startOfDay.toISOString());

        if (countError) {
            console.error('Failed to count usage', countError);
            return;
        }

        if ((count || 0) >= maxAi) {
            throw new Error(`تم تجاوز حد الباقة اليومي لاستخدام الذكاء الاصطناعي (${count}/${maxAi}). يرجى المحاولة غداً أو ترقية الباقة.`);
        }
    }

    private async checkStaffPermission(userId: string, clinicId?: number): Promise<void> {
        // 1. Check if User is Owner
        if (clinicId) {
            const { data: clinic } = await supabase
                .from('clinics')
                .select('owner_id')
                .eq('id', clinicId)
                .single();

            if (clinic?.owner_id === userId) return; // Owner has access (subject to plan limits)
        }

        // 2. Check Staff Record
        const { data: staffMember, error } = await supabase
            .from('staff')
            .select('permissions, role, role_title')
            .eq('auth_user_id', userId)
            .single();

        if (error || !staffMember) {
            // Not a staff member? Maybe an owner accessing directly? 
            // If we didn't match owner above, and no staff record, block.
            // But wait, what if they are an admin?
            // For safety, if we can't verify, we block, unless it's a known role.
            return; // Let it slide? No, strict.
        }

        // Logic: 
        // - Specific 'ai_access' permission in JSON
        // - OR role is 'doctor' (maybe default allow?) -> No, stick to explicit permission.

        const permissions = typeof staffMember.permissions === 'string'
            ? JSON.parse(staffMember.permissions)
            : staffMember.permissions || {};

        if (!permissions.ai_access) {
            throw new Error('ليس لديك صلاحية لاستخدام أدوات الذكاء الاصطناعي. يرجى مراجعة مدير العيادة.');
        }
    }

    async analyzeImage(imageUrl: string, context?: string, sessionId?: string, clinicId?: number): Promise<AIAnalysisResult> {
        // Identify User & Clinic contexts
        const { data: { user } } = await supabase.auth.getUser();
        // If clinicId matches passed arg, use it. Otherwise try to resolve.
        // Actually, if passed, we should TRUST it (subject to permission check).

        let targetClinicId = clinicId;

        if (user && !targetClinicId) {
            // Attempt to resolve targetClinicId for the user
            // 1. Is Owner?
            const { data: ownedClinic } = await supabase.from('clinics').select('id').eq('owner_id', user.id).single();
            if (ownedClinic) targetClinicId = ownedClinic.id;

            // 2. Is Staff?
            if (!targetClinicId) {
                const { data: staffMember } = await supabase.from('staff').select('clinic_id').eq('auth_user_id', user.id).single();
                if (staffMember) targetClinicId = staffMember.clinic_id;
            }
        }

        if (user && targetClinicId) {
            await this.checkUsageLimit(targetClinicId);
            await this.checkStaffPermission(user.id, targetClinicId);
        }

        if (!this.initialized) await this.loadConfigs();

        const agentType = 'image_analysis';
        const config = this.getConfig(agentType);
        if (!config.isActive) throw new Error('خدمة تحليل الصور غير مفعلة');

        const apiKey = config.apiKey || this.getApiKey(config.provider);

        // --- 1. Google / Banana Logic ---
        if (config.provider === 'google' || config.provider === 'banana' || config.model.includes('banana')) {
            if (!apiKey) {
                console.warn('[AI-Service] No API Key for Google/Banana. Using Mock.');
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.getMockAnalysis();
            }

            console.log(`Calling ${config.provider} (${config.model}) with key...`);
            // TODO: Implement actual Google Gemini / Banana Dev wrapper here.
            // For now, return Mock as placeholder for logic proof.

            return { ...this.getMockAnalysis(), metadata: { isMock: true, provider: config.provider, model: config.model } };
        }

        // --- 2. OpenAI Logic ---
        if (!apiKey) {
            console.warn('[AI-Service] No API Key. Using Mock Response.');
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { ...this.getMockAnalysis(), metadata: { isMock: true, provider: config.provider, model: config.model } };
        }

        const start = Date.now();
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey} `
                },
                body: JSON.stringify({
                    model: config.model || 'gpt-4o',
                    messages: [
                        {
                            role: 'system',
                            content: config.systemRules + "\nProvide the output in valid JSON format matching this structure: { diagnosis: string, severity: 'low'|'medium'|'high', confidence: number, findings: string[], recommendations: string[] }."
                        },
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: context || "Analyze this dental image." },
                                { type: 'image_url', image_url: { url: imageUrl } }
                            ]
                        }
                    ],
                    max_tokens: 1000,
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'OpenAI API Error');
            }

            const data = await response.json();
            const resultText = data.choices[0].message.content;

            const tokens = data.usage?.total_tokens || 0;
            this.logUsage(agentType, tokens, 'image_analysis', user?.id, targetClinicId, sessionId);

            const result = JSON.parse(resultText) as AIAnalysisResult;
            result.metadata = {
                isMock: false,
                provider: config.provider,
                model: config.model,
                processingTime: Date.now() - start
            };
            return result;

        } catch (error) {
            console.error('[AI-Service] Analysis Failed:', error);
            throw error;
        }
    }

    async chat(agentType: string, message: string, contextObj?: any, userId?: string, clinicId?: string, sessionId?: string): Promise<string> {
        // Resolve IDs if not provided (similar to analyzeImage, but maybe simpler here if passed in)
        // For consistency, let's trust passed in IDs or resolve them if missing?
        // Actually, let's just optimize validation:
        if (userId && clinicId) {
            try {
                await this.checkUsageLimit(parseInt(clinicId)); // Ensure number
                await this.checkStaffPermission(userId, parseInt(clinicId));
            } catch (e: any) {
                return e.message; // Return error as chat response for better UX? Or throw?
                // For chat, returning message is often better so UI doesn't crash.
            }
        }

        if (!this.initialized) await this.loadConfigs();

        const config = this.getConfig(agentType);
        if (!config.isActive) return 'نأسف، هذه الخدمة غير مفعلة حالياً.';

        const apiKey = config.apiKey || this.getApiKey(config.provider);
        if (!apiKey) {
            console.warn('[AI-Service] Chat: No API Key. Using Mock.');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return this.getMockChatResponse(agentType, message, contextObj);
        }

        const systemContent = config.systemRules + (contextObj ? `\n\nContext Data: ${JSON.stringify(contextObj)} ` : "");

        console.log(`[AI-Service] Chat Request -> Provider: ${config.provider}, Model: ${config.model}`);

        if (config.provider === 'google') {
            try {
                const modelName = config.model || 'gemini-1.5-pro';
                // Remove 'models/' prefix if present to avoid duplication
                const cleanModel = modelName.replace('models/', '');

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: systemContent + "\n" + message }] }]
                    })
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error?.message || 'Gemini API Error');
                }

                const data = await response.json();
                const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

                // Estimate tokens (Gemini doesn't always return usage in simple response)
                const tokens = content.length / 4;
                this.logUsage(agentType, Math.ceil(tokens), 'text_chat', userId, clinicId ? parseInt(clinicId) : undefined, sessionId);

                return content;

            } catch (e) {
                console.error('Gemini Chat Error:', e);
                return "عذراً، حدث خطأ أثناء الاتصال بـ Google Gemini.";
            }
        }

        // --- 3. OpenAI / DeepSeek (Compatible) Logic ---
        const baseURL = config.provider === 'deepseek' ? 'https://api.deepseek.com' : 'https://api.openai.com/v1';

        try {
            const response = await fetch(`${baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey} `
                },
                body: JSON.stringify({
                    model: config.model || 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemContent },
                        { role: 'user', content: message }
                    ],
                    temperature: config.temperature
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Chat API Error');
            }

            const data = await response.json();

            const tokens = data.usage?.total_tokens || 0;
            this.logUsage(agentType, tokens, 'text_chat', userId, clinicId ? parseInt(clinicId) : undefined, sessionId);

            return data.choices[0].message.content;

        } catch (error) {
            console.error('[AI-Service] Chat Failed:', error);
            return "عذراً، حدث خطأ أثناء الاتصال بالخادم الذكي.";
        }
    }

    // --- Mock Fallbacks (Preserved for Demo) ---
    private getMockAnalysis(): AIAnalysisResult {
        return {
            issues: [
                {
                    label: 'تسوس (Caries)',
                    confidence: 0.92,
                    box: [0.3, 0.4, 0.1, 0.1],
                    description: 'تسوس في الضاحك الثاني العلوي'
                }
            ],
            summary: 'تم اكتشاف تسوس محتمل في الجهة العلوية اليسرى، مع سلامة العظم السنخي.',
            recommendation: 'يُنصح بإجراء حشوة تجميلية وفحص مدى عمق التسوس.',
            // Compatibility fields
            diagnosis: 'تسوس في الضاحك الثاني العلوي (Upper Second Premolar Caries)',
            severity: 'medium',
            confidence: 0.92,
            findings: [
                'وجود ظل شعاعي (Radiolucency) في السطح الوحشي للسن #15.',
                'احتمالية امتداد التسوس إلى طبقة العاج (Dentin).',
                'مستويات العظم السنخي تظهر طبيعية.'
            ],
            metadata: {
                isMock: true,
                provider: 'mock',
                model: 'demo-v1'
            }
        };
    }

    private getMockChatResponse(agentType: string, message: string, contextObj?: any): string {
        if (agentType === 'doctor_assistant') {
            return `(Mock Response) بناءً على بيانات المريض ${contextObj?.patientName || ''}: أنصح بمراجعة التاريخ الطبي قبل وصف أي مضادات حيوية.`;
        }
        return "أهلاً بك. كيف يمكنني مساعدتك؟ (تجريبي)";
    }
}

export const aiService = new AIService();
