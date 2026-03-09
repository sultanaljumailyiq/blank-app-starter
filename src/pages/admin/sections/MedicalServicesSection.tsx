import React, { useState, useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import {
    Star,
    MapPin,
    FileText,
    Plus,
    Search,
    Filter,
    MoreVertical,
    CheckCircle,
    X,
    Edit,
    Trash2,
    Eye,
    Settings,
    Zap,
    Tag,
    Building2,
    Brain,
    Bot,
    MessageSquare,
    Save,
    Lock,
    Phone // Added Phone icon
} from 'lucide-react';
import { useArticles } from '../../../hooks/useArticles';
import { useAdminData } from '../../../hooks/useAdminData';
import { supabase } from '../../../lib/supabase';
import { aiService } from '../../../services/ai/AIService';
import { AIAgentConfig } from '../../../types/ai';

export const MedicalServicesSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'featured-clinics' | 'articles' | 'nearby' | 'ai' | 'emergency'>('featured-clinics');

    return (
        <div className="space-y-6">
            {/* Header & Tabs */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">إدارة الخدمات الطبية</h2>

                <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto max-w-full">
                    {[
                        { id: 'featured-clinics', label: 'العيادات المميزة', icon: Star },
                        { id: 'emergency', label: 'مراكز الطوارئ', icon: Phone }, // Added Emergency tab
                        { id: 'articles', label: 'المقالات الطبية', icon: FileText },
                        { id: 'nearby', label: 'إعدادات الخرائط', icon: MapPin },
                        { id: 'ai', label: 'الذكاء الاصطناعي (AI)', icon: Brain },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-purple-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="animate-in fade-in duration-500">
                {activeTab === 'featured-clinics' && <FeaturedClinicsManager />}
                {activeTab === 'emergency' && <EmergencyCentersManager />}
                {activeTab === 'articles' && <ArticlesManager />}
                {activeTab === 'nearby' && <NearbySettings />}
                {activeTab === 'ai' && <AIConfigManager />}
            </div>
        </div>
    );
};

/* Sub-components */

const AIStatsView = () => {
    const [stats, setStats] = useState<{ clinics: any[], visitors: any[] }>({ clinics: [], visitors: [] });
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<'clinics' | 'visitors'>('clinics');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const data = await aiService.getUsageStats();
            setStats(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Totals
    const totalClinicRequests = stats.clinics.reduce((acc, curr) => acc + curr.used, 0);
    const totalVisitorRequests = stats.visitors.reduce((acc, curr) => acc + curr.requests, 0);
    const totalRequests = totalClinicRequests + totalVisitorRequests;
    const activeClinics = stats.clinics.length;

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Global Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-xs mb-1">إجمالي الطلبات (الكلي)</p>
                    <h3 className="text-2xl font-bold text-gray-900">{totalRequests}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-xs mb-1">طلبات الزوار (Public)</p>
                    <h3 className="text-2xl font-bold text-blue-600">{totalVisitorRequests}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-xs mb-1">العيادات النشطة (AI)</p>
                    <h3 className="text-2xl font-bold text-purple-600">{activeClinics}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-xs mb-1">متوسط الاستجابة</p>
                    <h3 className="text-2xl font-bold text-green-600">~1.5s</h3>
                </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-1">
                <button
                    onClick={() => setActiveSubTab('clinics')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeSubTab === 'clinics' ? 'bg-white border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    استهلاك العيادات
                </button>
                <button
                    onClick={() => setActiveSubTab('visitors')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeSubTab === 'visitors' ? 'bg-white border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    استهلاك الزوار (Public)
                </button>
            </div>

            {/* Sub Content */}
            {activeSubTab === 'clinics' ? (
                <Card className="overflow-hidden border border-gray-100 shadow-sm rounded-b-2xl rounded-tr-2xl">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">قائمة العيادات المستهلكة للخدمة</h3>
                        <Button variant="outline" size="sm" onClick={loadStats} className="bg-white">
                            تحديث البيانات
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                                <tr>
                                    <th className="px-6 py-4">العيادة</th>
                                    <th className="px-6 py-4">الباقة</th>
                                    <th className="px-6 py-4">الاستهلاك / الحد</th>
                                    <th className="px-6 py-4">آخر نشاط</th>
                                    <th className="px-6 py-4">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-8">جاري تحميل البيانات...</td></tr>
                                ) : stats.clinics.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">لا توجد بيانات استهلاك للعيادات حتى الآن</td></tr>
                                ) : (
                                    stats.clinics.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-bold text-gray-900">{item.clinic}</div>
                                                    <div className="text-xs text-gray-500">{item.doctor}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${item.plan === 'premium' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                                    {item.plan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${item.plan === 'premium' ? 'bg-purple-500' : (item.used > 40 ? 'bg-red-500' : 'bg-blue-500')}`}
                                                            style={{ width: item.limit === '∞' ? '10%' : `${Math.min((item.used / Number(item.limit)) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {item.used} <span className="text-gray-400">/ {item.limit}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{item.lastUse}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700`}>
                                                    <CheckCircle className="w-3 h-3" />
                                                    نشط
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : (
                <Card className="overflow-hidden border border-gray-100 shadow-sm rounded-b-2xl rounded-tr-2xl">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">سجل استهلاك الزوار (غير المسجلين)</h3>
                        <Button variant="outline" size="sm" onClick={loadStats} className="bg-white">
                            تحديث البيانات
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                                <tr>
                                    <th className="px-6 py-4">التاريخ</th>
                                    <th className="px-6 py-4">الخدمة</th>
                                    <th className="px-6 py-4">عدد الطلبات</th>
                                    <th className="px-6 py-4">Tokens المستهلكة</th>
                                    <th className="px-6 py-4">عدد المستخدمين</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={4} className="text-center py-8">جاري تحميل البيانات...</td></tr>
                                ) : stats.visitors.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-8 text-gray-500">لا توجد بيانات استهلاك للزوار حتى الآن</td></tr>
                                ) : (
                                    stats.visitors.map((item: any, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-900 font-medium">{item.date}</td>
                                            <td className="px-6 py-4">
                                                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                                                    {item.agent === 'patient_assistant' ? 'المساعد الذكي للمريض' : item.agent}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono">{item.requests}</td>
                                            <td className="px-6 py-4 font-mono text-gray-600">{item.tokens}</td>
                                            <td className="px-6 py-4 font-mono text-gray-900">{item.users || 1}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

const AIConfigManager = () => {
    const [configs, setConfigs] = useState<AIAgentConfig[]>([]);
    const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<AIAgentConfig>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'settings' | 'stats'>('settings');

    useEffect(() => {
        setConfigs(aiService.getConfigs());
    }, []);

    const handleSelectAgent = (config: AIAgentConfig) => {
        setSelectedAgentId(config.id);
        setEditForm(config);
    };

    const handleSave = async () => {
        if (!selectedAgentId) return;
        setIsSaving(true);
        try {
            await aiService.updateConfig(selectedAgentId as any, editForm);
            setConfigs(aiService.getConfigs()); // Refresh
            alert('تم حفظ الإعدادات بنجاح');
        } catch (error) {
            alert('فشل حفظ الإعدادات');
        } finally {
            setIsSaving(false);
        }
    };

    const selectedAgent = configs.find(c => c.id === selectedAgentId);

    return (
        <div className="space-y-6">
            {/* Intro */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-1">إعدادات خدمات الذكاء الاصطناعي</h3>
                        <p className="text-purple-100 opacity-90 max-w-2xl">
                            قم بإعداد وتخصيص نماذج الذكاء الاصطناعي، ومراقبة استهلاك العيادات للخدمة.
                        </p>
                    </div>
                </div>

                <div className="flex gap-4 mt-6 border-t border-white/20 pt-4">
                    <button
                        onClick={() => setViewMode('settings')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'settings' ? 'bg-white text-purple-600 shadow-sm' : 'text-purple-100 hover:bg-white/10'}`}>
                        إعدادات النظام
                    </button>
                    <button
                        onClick={() => setViewMode('stats')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'stats' ? 'bg-white text-purple-600 shadow-sm' : 'text-purple-100 hover:bg-white/10'}`}>
                        إحصائيات الاستخدام
                    </button>
                </div>
            </div>

            {viewMode === 'stats' ? <AIStatsView /> : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Agent List */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-700 px-1">الوكلاء المتاحين (Agents)</h4>
                        {configs.map(config => (
                            <div
                                key={config.id}
                                onClick={() => handleSelectAgent(config)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAgentId === config.id
                                    ? 'bg-purple-50 border-purple-200 ring-2 ring-purple-100'
                                    : 'bg-white border-gray-100 hover:border-purple-100 hover:shadow-md'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`p-2 rounded-lg ${config.id === 'image_analysis' ? 'bg-blue-100 text-blue-600' :
                                        config.id === 'doctor_assistant' ? 'bg-emerald-100 text-emerald-600' :
                                            'bg-orange-100 text-orange-600'
                                        }`}>
                                        {config.id === 'image_analysis' ? <Eye className="w-5 h-5" /> :
                                            config.id === 'doctor_assistant' ? <Bot className="w-5 h-5" /> :
                                                <MessageSquare className="w-5 h-5" />}
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-xs font-bold ${config.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {config.isActive ? 'نشط' : 'معطل'}
                                    </div>
                                </div>
                                <h5 className="font-bold text-gray-900 text-sm mb-1">{config.name}</h5>
                                <p className="text-xs text-gray-500 line-clamp-2">{config.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Editor Settings */}
                    <div className="lg:col-span-2">
                        {selectedAgent ? (
                            <Card className="p-6 rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-4">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <Settings className="w-5 h-5 text-gray-400" />
                                            إعدادات: {selectedAgent.name}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                                            <span>تفعيل الخدمة</span>
                                            <div
                                                className={`relative w-11 h-6 transition-colors rounded-full ${editForm.isActive ? 'bg-green-500' : 'bg-gray-200'}`}
                                                onClick={() => setEditForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                                            >
                                                <span className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${editForm.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">مزود الخدمة (Provider)</label>
                                            <select
                                                value={editForm.provider}
                                                onChange={e => {
                                                    const provider = e.target.value as any;
                                                    let defaultModel = '';
                                                    if (provider === 'openai') defaultModel = 'gpt-4o';
                                                    if (provider === 'anthropic') defaultModel = 'claude-3-5-sonnet-20240620';
                                                    if (provider === 'google') defaultModel = 'gemini-1.5-pro';
                                                    if (provider === 'deepseek') defaultModel = 'deepseek-chat';

                                                    setEditForm(prev => ({ ...prev, provider, model: defaultModel }));
                                                }}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                            >
                                                <option value="openai">OpenAI</option>
                                                <option value="anthropic">Anthropic</option>
                                                <option value="google">Google</option>
                                                <option value="deepseek">DeepSeek</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">موديل الذكاء الاصطناعي</label>
                                            <select
                                                value={editForm.model}
                                                onChange={e => setEditForm(prev => ({ ...prev, model: e.target.value }))}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                            >
                                                {/* Dynamic Options based on Provider */}
                                                {editForm.provider === 'openai' && (
                                                    <>
                                                        <option value="gpt-4o">GPT-4o (Latest)</option>
                                                        <option value="gpt-4o-mini">GPT-4o mini</option>
                                                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                                    </>
                                                )}
                                                {editForm.provider === 'anthropic' && (
                                                    <>
                                                        <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                                                        <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                                                        <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                                                        <option value="claude-4">Claude 4 (Preview)</option>
                                                    </>
                                                )}
                                                {editForm.provider === 'google' && (
                                                    <>
                                                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                                        <option value="gemini-pro">Gemini Pro 1.0</option>
                                                    </>
                                                )}
                                                {editForm.provider === 'deepseek' && (
                                                    <>
                                                        <option value="deepseek-chat">DeepSeek V3 (Chat)</option>
                                                        <option value="deepseek-coder">DeepSeek Coder</option>
                                                    </>
                                                )}

                                                <option value="custom">مخصص (أخرى)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* API Key */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">مفتاح API (API Key)</label>
                                        <div className="relative">
                                            <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                                            <input
                                                type="password"
                                                value={editForm.apiKey || ''}
                                                onChange={e => setEditForm(prev => ({ ...prev, apiKey: e.target.value }))}
                                                placeholder="sk-..."
                                                className="w-full pr-10 pl-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-mono text-sm"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">يتم تخزين المفتاح بشكل مشفر محلياً.</p>
                                    </div>

                                    {/* System Rules - THE CONFIRMATION OF "Rules help guide behavior" */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            قواعد النظام (System Rules)
                                            <span className="text-xs text-purple-600 font-normal mr-2 bg-purple-50 px-2 py-0.5 rounded-full">هام جداً</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mb-2">تعليمات تحدد سلوك المساعد، طريقة حديثه، وما يجب عليه فعله أو تجنبه.</p>
                                        <textarea
                                            rows={8}
                                            value={editForm.systemRules}
                                            onChange={e => setEditForm(prev => ({ ...prev, systemRules: e.target.value }))}
                                            className="w-full p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                                            placeholder="You are a helpful assistant..."
                                        />
                                    </div>

                                    {/* Temperature */}
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-medium text-gray-700">درجة الإبداع (Temperature)</label>
                                            <span className="text-sm font-bold text-purple-600">{editForm.temperature}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={editForm.temperature}
                                            onChange={e => setEditForm(prev => ({ ...prev, temperature: Number(e.target.value) }))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>دقيق ومنطقي (0.0)</span>
                                            <span>إبداعي ومتنوع (1.0)</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                        <Button variant="outline" onClick={() => handleSelectAgent(configs.find(c => c.id === selectedAgentId)!)}>
                                            إلغاء التغييرات
                                        </Button>
                                        <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]">
                                            {isSaving ? 'جاري الحفظ...' : (
                                                <>
                                                    <Save className="w-4 h-4 ml-2" />
                                                    حفظ الإعدادات
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
                                <Brain className="w-16 h-16 mb-4 opacity-50" />
                                <p className="font-medium">اختر وكيلاً من القائمة لبدء الإعداد</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

import { ClinicDetailsModal } from '../components/ClinicDetailsModal'; // Add Import


const FeaturedClinicsManager = () => {
    const [autoFeature, setAutoFeature] = useState(true);
    const { clinics: allClinics, loading: clinicsLoading, updateSettings } = useAdminData();
    const [clinics, setClinics] = useState<any[]>([]);
    const [showClinicDetailsModal, setShowClinicDetailsModal] = useState(false);
    const [selectedClinicDetails, setSelectedClinicDetails] = useState<any>(null);

    useEffect(() => {
        const loadClinicsWithSubs = async () => {
            if (allClinics) {
                // 1. Get Owner IDs
                const ownerIds = allClinics.map(c => c.owner_id).filter(Boolean);

                // 2. Fetch Subscriptions
                const { data: subscriptions } = await supabase
                    .from('user_subscriptions')
                    .select(`
                        user_id,
                        plan_id,
                        status,
                        subscription_plans (name, name_en)
                    `)
                    .in('user_id', ownerIds)
                    .in('status', ['active', 'trialing']);

                // 3. Merge Data
                const mergedClinics = allClinics.map(clinic => {
                    const sub = subscriptions?.find(s => s.user_id === clinic.owner_id);
                    let planName = 'غير مشترك';

                    if (sub?.subscription_plans) {
                        const rawSp = sub.subscription_plans;
                        const sp: any = Array.isArray(rawSp) ? rawSp[0] : rawSp;

                        if (sp) {
                            planName = sp.name || sp.name_en || 'غير مشترك';
                        }
                    }

                    return {
                        ...clinic,
                        subscription_plan: planName // Override/Set the plan name directly
                    };
                });

                setClinics(mergedClinics);
            }
        };

        loadClinicsWithSubs();
    }, [allClinics]);

    const handleToggleFeatured = async (clinicId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('clinics')
                .update({ is_featured: !currentStatus })
                .eq('id', clinicId);

            if (error) throw error;

            // Optimistic Update
            setClinics(prev => prev.map(c => c.id === clinicId ? { ...c, is_featured: !currentStatus } : c));

            // Log Activity
            await supabase.from('activity_logs').insert({
                type: 'clinic_update',
                user_id: (await supabase.auth.getUser()).data.user?.id,
                details: `تم ${!currentStatus ? 'إضافة' : 'إزالة'} عيادة من المميزة`
            });

        } catch (error) {
            console.error('Error toggling featured:', error);
            alert('حدث خطأ أثناء التحديث');
        }
    };

    const handleViewDetails = (clinic: any) => {
        setSelectedClinicDetails(clinic);
        setShowClinicDetailsModal(true);
    };

    // Calculate Stats
    const featuredCount = clinics.filter(c => c.is_featured).length;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-purple-100 text-sm font-medium">العيادات المميزة</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <h3 className="text-3xl font-bold mb-1">{featuredCount}</h3>
                        <span className="text-purple-200 text-sm mb-2">عيادة</span>
                    </div>
                    <p className="text-purple-100 text-sm opacity-80 mt-2">تظهر في الصفحة الرئيسية بدعم من المنصة</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-[4rem] -mr-4 -mt-4 opacity-50"></div>

                    <div className="flex justify-between items-start mb-4 relative">
                        <div className="p-3 bg-blue-100 rounded-xl">
                            <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-gray-500 text-sm font-medium">إحصائيات التمييز</span>
                    </div>

                    <div className="space-y-4 relative">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">إجمالي العيادات</span>
                                <span className="font-bold text-gray-900">{clinics.length}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-green-600 font-medium">مميزة</span>
                                    <span className="font-bold">{featuredCount}</span>
                                </div>
                                <div className="w-full bg-green-100 rounded-full h-1.5">
                                    <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${clinics.length ? (featuredCount / clinics.length) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500 font-medium">عادية</span>
                                    <span className="font-bold">{clinics.length - featuredCount}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div className="bg-gray-400 h-1.5 rounded-full" style={{ width: `${clinics.length ? ((clinics.length - featuredCount) / clinics.length) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clinics List Table */}
            <Card className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">قائمة العيادات النشطة</h3>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
                            <input
                                type="text"
                                placeholder="بحث عن عيادة..."
                                className="pr-9 pl-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none w-64"
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                            <tr>
                                <th className="px-6 py-4">العيادة</th>
                                <th className="px-6 py-4">المالك</th>
                                <th className="px-6 py-4">الباقة</th>
                                <th className="px-6 py-4">المحافظة</th>
                                <th className="px-6 py-4">مميزة؟</th>
                                <th className="px-6 py-4">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {clinicsLoading ? (
                                <tr><td colSpan={6} className="text-center py-4">جاري التحميل...</td></tr>
                            ) : clinics.map((clinic, i) => (
                                <tr key={clinic.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{clinic.name}</div>
                                                <div className="text-xs text-gray-500">{clinic.name_en || ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{clinic.owner?.full_name || clinic.owner_name || 'غير محدد'}</div>
                                        <div className="text-xs text-gray-500" dir="ltr">{clinic.owner?.phone || clinic.phone_number || ''}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {(() => {
                                            // Handle various plan formats (string, object, relation)
                                            const planName = typeof clinic.subscription_plan === 'object'
                                                ? (clinic.subscription_plan?.name_ar || clinic.subscription_plan?.name || 'Basic')
                                                : (clinic.subscription_plan || 'Basic');

                                            const isPremium = planName?.toString().toLowerCase().includes('premium') || planName === 'باقة متقدمة';

                                            return (
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${isPremium ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                                    {planName}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3 text-gray-400" />
                                            {clinic.governorate && clinic.address ? `${clinic.governorate}، ${clinic.address}` : clinic.governorate || clinic.address || 'غير محدد'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleFeatured(clinic.id, clinic.is_featured)}
                                            className={`p-1.5 rounded-full transition-all ${clinic.is_featured ? 'bg-yellow-100 text-yellow-500' : 'bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-400'}`}
                                        >
                                            <Star className={`w-5 h-5 ${clinic.is_featured ? 'fill-current' : ''}`} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewDetails(clinic)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="عرض التفاصيل"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Clinic Details Modal */}
            <ClinicDetailsModal
                clinic={selectedClinicDetails}
                isOpen={showClinicDetailsModal}
                onClose={() => setShowClinicDetailsModal(false)}
                onToggleFeatured={handleToggleFeatured}
            />
        </div>
    );
};

const ArticlesManager = () => {
    const { articles, loading } = useArticles();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">مكتبة المقالات الطبية</h3>
                    <p className="text-gray-500 text-sm">إدارة المحتوى الطبي والمقالات التثقيفية</p>
                </div>
                <Button className="rounded-xl shadow-lg shadow-purple-200">
                    <Plus className="w-4 h-4 ml-2" />
                    مقالة جديدة
                </Button>
            </div>

            {/* Alert for preset articles */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mt-1">
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-blue-900">المحتوى الجاهز</h4>
                    <p className="text-sm text-blue-700 mt-1">
                        تم تحميل 30 مقالة طبية شاملة تغطي مختلف مواضيع طب الأسنان بشكل مسبق. يمكنك التعديل عليها أو إضافة المزيد.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.slice(0, 6).map((article) => (
                    <div key={article.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
                        <div className="h-48 overflow-hidden relative">
                            <img
                                src={article.image}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-purple-700 shadow-sm">
                                {article.category}
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{article.title}</h4>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{article.excerpt}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                <span className="text-xs text-gray-400">{article.date}</span>
                                <div className="flex gap-2">
                                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="معاينة">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="تعديل">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Related Content Suggestions Mockup within the card logic */}
                        <div className="bg-gray-50 p-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between items-center group-hover:bg-purple-50 transition-colors">
                            <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                3 عيادات مقترحة مرتبطة
                            </span>
                            <button className="text-purple-600 hover:underline">إدارة الروابط</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center pt-4">
                <Button variant="outline" className="rounded-xl text-gray-500 border-gray-200">
                    عرض المزيد من المقالات ({articles.length - 6} متبقي)
                </Button>
            </div>
        </div>
    );
};

const NearbySettings = () => {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    إعدادات العيادات القريبة
                </h3>

                <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                        <div>
                            <h4 className="font-medium text-gray-900">تفعيل الخدمة</h4>
                            <p className="text-sm text-gray-500">السماح للمستخدمين بالبحث عن العيادات القريبة</p>
                        </div>
                        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">نطاق البحث الافتراضي</label>
                            <span className="text-sm font-bold text-purple-600">5 كم</span>
                        </div>
                        <input type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" min="1" max="50" defaultValue="5" />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>1 كم</span>
                            <span>50 كم</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">معايير الترتيب التلقائي</label>
                        <div className="grid grid-cols-2 gap-3">
                            {['المسافة الأقرب', 'الأعلى تقييماً', 'الأكثر خبرة', 'العيادات المميزة أولاً'].map((opt) => (
                                <label key={opt} className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-purple-200 hover:bg-purple-50 transition-all">
                                    <input type="radio" name="sort" className="text-purple-600 focus:ring-purple-500" defaultChecked={opt === 'المسافة الأقرب'} />
                                    <span className="text-sm text-gray-600">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 text-right">
                    <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-purple-200">
                        حفظ الإعدادات
                    </Button>
                </div>
            </Card>
        </div>
    );
};

const EmergencyCentersManager = () => {
    const [centers, setCenters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hotline, setHotline] = useState('');
    const [isHotlineActive, setIsHotlineActive] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCenter, setEditingCenter] = useState<any>(null);
    const [formData, setFormData] = useState<any>({
        name: '',
        type: 'government',
        phone: '',
        address: '',
        governorate: 'بغداد',
        working_hours: '24 ساعة',
        is_24h: true,
        services: [],
        location: { lat: 33.3152, lng: 44.3661 } // Default Baghdad
    });

    const governorates = [
        'بغداد', 'البصرة', 'كربلاء', 'النجف', 'أربيل', 'السليمانية',
        'الموصل', 'كركوك', 'ديالي', 'بابل', 'ذي قار', 'القادسية',
        'الأنبار', 'ديالى', 'ميسان', 'المثنى', 'واسط', 'صلاح الدين'
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Centers
            const { data: centersData, error: centersError } = await supabase
                .from('emergency_centers')
                .select('*')
                .order('created_at', { ascending: false });

            if (centersError) throw centersError;
            setCenters(centersData || []);

            // Fetch Settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('emergency_settings')
                .select('value')
                .eq('key', 'hotline')
                .single();

            if (settingsData) {
                setHotline(settingsData.value.number);
                setIsHotlineActive(settingsData.value.is_active);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveHotline = async () => {
        try {
            const { error } = await supabase
                .from('emergency_settings')
                .upsert({
                    key: 'hotline',
                    value: { number: hotline, is_active: isHotlineActive },
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            alert('تم حفظ إعدادات الطوارئ بنجاح');
        } catch (error) {
            console.error('Error saving hotline:', error);
            alert('فشل حفظ الإعدادات');
        }
    };

    const handleOpenModal = (center: any = null) => {
        if (center) {
            setEditingCenter(center);
            setFormData({ ...center });
        } else {
            setEditingCenter(null);
            setFormData({
                name: '',
                type: 'government',
                phone: '',
                address: '',
                governorate: 'بغداد',
                working_hours: '24 ساعة',
                is_24h: true,
                services: [],
                location: { lat: 33.3152, lng: 44.3661 }
            });
        }
        setShowModal(true);
    };

    const handleSaveCenter = async () => {
        try {
            if (editingCenter) {
                const { error } = await supabase
                    .from('emergency_centers')
                    .update(formData)
                    .eq('id', editingCenter.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('emergency_centers')
                    .insert([formData]);
                if (error) throw error;
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving center:', error);
            alert('فشل حفظ بيانات المركز');
        }
    };

    const handleDeleteCenter = async (id: string) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المركز؟')) return;
        try {
            const { error } = await supabase
                .from('emergency_centers')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error deleting center:', error);
            alert('فشل حذف المركز');
        }
    };

    const handleArrayInput = (value: string, field: string) => {
        const array = value.split(',').map(item => item.trim()).filter(item => item);
        setFormData({ ...formData, [field]: array });
    };

    return (
        <div className="space-y-8 animate-in fade-in">
            {/* Hotline Settings */}
            <Card className="p-6 border border-red-100 shadow-sm bg-red-50/30">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-red-600" />
                    الخط الساخن للطوارئ (24 ساعة)
                </h3>
                <div className="flex flex-col md:flex-row items-end gap-4">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم الطوارئ الموحد</label>
                        <input
                            type="text"
                            value={hotline}
                            onChange={(e) => setHotline(e.target.value)}
                            className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                            placeholder="مثال: 07700000000"
                        />
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                            <span>تفعيل الخدمة</span>
                            <div
                                className={`relative w-11 h-6 transition-colors rounded-full ${isHotlineActive ? 'bg-green-500' : 'bg-gray-200'}`}
                                onClick={() => setIsHotlineActive(!isHotlineActive)}
                            >
                                <span className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isHotlineActive ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </label>
                    </div>
                    <Button onClick={handleSaveHotline} className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]">
                        <Save className="w-4 h-4 ml-2" />
                        حفظ
                    </Button>
                </div>
            </Card>

            {/* Centers Management */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">مراكز الطوارئ المسجلة</h3>
                    <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة مركز جديد
                    </Button>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase">
                                <tr>
                                    <th className="px-6 py-4">اسم المركز</th>
                                    <th className="px-6 py-4">النوع</th>
                                    <th className="px-6 py-4">الموقع</th>
                                    <th className="px-6 py-4">الهاتف</th>
                                    <th className="px-6 py-4">ساعات العمل</th>
                                    <th className="px-6 py-4">الحالة</th>
                                    <th className="px-6 py-4">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan={7} className="text-center py-8 text-gray-500">جاري التحميل...</td></tr>
                                ) : centers.length === 0 ? (
                                    <tr><td colSpan={7} className="text-center py-8 text-gray-500">لا توجد مراكز مسجلة</td></tr>
                                ) : (
                                    centers.map((center) => (
                                        <tr key={center.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-900">{center.name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${center.type === 'government' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                                                    {center.type === 'government' ? 'حكومي' : 'خاص'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{center.governorate} - {center.address}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600" dir="ltr">{center.phone}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{center.is_24h ? '24 ساعة' : center.working_hours}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${center.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {center.is_active ? 'نشط' : 'غير نشط'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleOpenModal(center)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteCenter(center.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit/Add Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingCenter ? 'تعديل بيانات المركز' : 'إضافة مركز جديد'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المركز</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع المركز</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="government">حكومي (مستشفى)</option>
                                        <option value="private">خاص (عيادة)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">المحافظة</label>
                                    <select
                                        value={formData.governorate}
                                        onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                                        className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        {governorates.map(gov => (
                                            <option key={gov} value={gov}>{gov}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان التفصيلي</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">ساعات العمل</label>
                                    <input
                                        type="text"
                                        value={formData.working_hours}
                                        onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                                        className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        disabled={formData.is_24h}
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_24h}
                                            onChange={(e) => setFormData({ ...formData, is_24h: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span>يعمل 24 ساعة</span>
                                    </label>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الخدمات المتوفرة (افصل بينها بفاصلة)</label>
                                    <input
                                        type="text"
                                        value={formData.services ? formData.services.join(', ') : ''}
                                        onChange={(e) => handleArrayInput(e.target.value, 'services')}
                                        className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="طوارئ, جراحة فم, أشعة..."
                                    />
                                </div>
                                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">احداثيات (Lat)</label>
                                        <input
                                            type="number"
                                            value={formData.location?.lat || ''}
                                            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, lat: parseFloat(e.target.value) } })}
                                            className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">احداثيات (Lng)</label>
                                        <input
                                            type="number"
                                            value={formData.location?.lng || ''}
                                            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, lng: parseFloat(e.target.value) } })}
                                            className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowModal(false)}>إلغاء</Button>
                            <Button onClick={handleSaveCenter} className="bg-blue-600 hover:bg-blue-700 text-white">حفظ البيانات</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
