import { AIAgentConfig, AIAnalysisResult } from '../../types/ai';
import { DEFAULT_AI_CONFIGS } from './defaultConfig';
import { supabase } from '../../lib/supabase';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-agent`;

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
                        provider: agent.provider,
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
                this.initialized = true;
            }
        } catch (e) {
            console.error('Error loading AI configs:', e);
            this.configs = DEFAULT_AI_CONFIGS;
            this.initialized = true;
        }
    }

    getConfigs(): AIAgentConfig[] {
        return Object.values(this.configs);
    }

    getConfig(type: string): AIAgentConfig {
        return this.configs[type] || DEFAULT_AI_CONFIGS[type];
    }

    async updateConfig(type: string, updates: Partial<AIAgentConfig>) {
        if (this.configs[type]) {
            this.configs[type] = { ...this.configs[type], ...updates };
        }

        const currentConfig = this.configs[type] || DEFAULT_AI_CONFIGS[type];
        const mergedConfig = { ...currentConfig, ...updates };

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
            throw error;
        }
    }

    async getUsageStats() {
        try {
            const { data: allClinics, error: clinicsError } = await supabase
                .from('clinics')
                .select('id, name, owner_id, city, image_url, is_active')
                .eq('is_active', true);

            if (clinicsError) throw clinicsError;

            const ownerIds = allClinics?.map(c => c.owner_id).filter(Boolean) || [];
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name')
                .in('id', ownerIds);

            const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]));

            const { data: usageLogs, error: logsError } = await supabase
                .from('ai_usage_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (logsError) throw logsError;

            const { data: subscriptions } = await supabase
                .from('user_subscriptions')
                .select('user_id, plan_id, status, subscription_plans (id, name, name_en, limits)')
                .in('user_id', ownerIds)
                .in('status', ['active', 'trialing']);

            const { data: allPlans } = await supabase
                .from('subscription_plans')
                .select('id, name, name_en, price, limits');

            const defaultPlan = allPlans?.find(p =>
                (typeof p.price === 'number' && p.price === 0) ||
                p.name_en?.toLowerCase().includes('basic') ||
                p.name_en?.toLowerCase().includes('free')
            );

            const clinicStatsMap = new Map();
            allClinics?.forEach(clinic => {
                const sub = subscriptions?.find(s => s.user_id === clinic.owner_id);
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
                    planName = 'Basic';
                }

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

            const visitorStatsMap = new Map();
            usageLogs?.forEach(log => {
                if (log.user_type === 'clinic' && log.clinic_id) {
                    if (clinicStatsMap.has(log.clinic_id)) {
                        const entry = clinicStatsMap.get(log.clinic_id);
                        entry.used += 1;
                        entry.lastUse = new Date(log.created_at).toLocaleString('ar-EG');
                    }
                } else {
                    const date = new Date(log.created_at).toLocaleDateString('en-CA');
                    if (!visitorStatsMap.has(date)) {
                        visitorStatsMap.set(date, { date, service: 'المساعد الذكي للمرضى', requests: 0, tokens: 0, uniqueUsers: new Set() });
                    }
                    const entry = visitorStatsMap.get(date);
                    entry.tokens += (log.tokens_used || 0);
                    entry.requests += 1;
                    if (log.session_id) entry.uniqueUsers.add(log.session_id);
                }
            });

            return {
                clinics: Array.from(clinicStatsMap.values()),
                visitors: Array.from(visitorStatsMap.values()).map((v: any) => ({
                    date: v.date, service: v.service, requests: v.requests, tokens: v.tokens, users: v.uniqueUsers.size
                }))
            };
        } catch (e) {
            console.error('Failed to get usage stats', e);
            return { clinics: [], visitors: [] };
        }
    }

    /**
     * Call the ai-agent edge function for all AI requests
     */
    private async callEdgeFunction(payload: Record<string, any>): Promise<any> {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'خطأ غير متوقع' }));
            if (response.status === 429) {
                throw new Error('تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.');
            }
            if (response.status === 402) {
                throw new Error('رصيد الذكاء الاصطناعي غير كافٍ.');
            }
            throw new Error(errorData.error || 'خطأ في خدمة الذكاء الاصطناعي');
        }

        return response.json();
    }

    async analyzeImage(imageUrl: string, context?: string, sessionId?: string, clinicId?: number): Promise<AIAnalysisResult> {
        if (!this.initialized) await this.loadConfigs();

        const config = this.getConfig('image_analysis');
        if (!config.isActive) throw new Error('خدمة تحليل الصور غير مفعلة');

        try {
            const data = await this.callEdgeFunction({
                agent_type: 'image_analysis',
                image_url: imageUrl,
                message: context || 'حلل هذه الصورة السنية بدقة وأعط تقريراً تفصيلياً.',
                session_id: sessionId,
                clinic_id: clinicId,
            });

            if (data.result) {
                return {
                    issues: data.result.issues || [],
                    summary: data.result.summary || data.result.diagnosis || '',
                    recommendation: data.result.recommendation || '',
                    diagnosis: data.result.diagnosis,
                    severity: data.result.severity,
                    confidence: data.result.confidence,
                    findings: data.result.findings || [],
                    metadata: { isMock: false, provider: 'lovable-ai', model: 'gemini-2.5-pro' }
                };
            }

            // Parse from raw text
            return {
                issues: [],
                summary: data.raw || 'تم التحليل',
                recommendation: '',
                findings: [data.raw || ''],
                metadata: { isMock: false, provider: 'lovable-ai', model: 'gemini-2.5-pro' }
            };
        } catch (error) {
            console.error('[AI-Service] Analysis Failed:', error);
            throw error;
        }
    }

    async chat(agentType: string, message: string, contextObj?: any, userId?: string, clinicId?: string, sessionId?: string): Promise<string> {
        if (!this.initialized) await this.loadConfigs();

        const config = this.getConfig(agentType);
        if (!config.isActive) return 'نأسف، هذه الخدمة غير مفعلة حالياً.';

        try {
            const data = await this.callEdgeFunction({
                agent_type: agentType,
                message,
                context: contextObj,
                session_id: sessionId,
                clinic_id: clinicId ? parseInt(clinicId) : undefined,
            });

            return data.response || data.raw || 'لم يتم تلقي رد.';
        } catch (error: any) {
            console.error('[AI-Service] Chat Failed:', error);
            return error.message || 'عذراً، حدث خطأ أثناء الاتصال بالخادم الذكي.';
        }
    }
}

export const aiService = new AIService();
