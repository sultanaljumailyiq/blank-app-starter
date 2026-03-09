import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { RefreshCw, Calendar, Shield, Zap, Star, ChevronRight } from 'lucide-react';
import { LoadingState } from '../../components/common/LoadingState';

interface Update {
    id: string;
    title: string;
    content: string;
    version: string;
    release_date: string;
    type: 'major' | 'minor' | 'patch' | 'security';
    is_published: boolean;
}

export const UpdatesPage: React.FC = () => {
    const [updates, setUpdates] = useState<Update[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUpdates();
    }, []);

    const fetchUpdates = async () => {
        try {
            const { data, error } = await supabase
                .from('system_updates')
                .select('*')
                .eq('is_published', true)
                .order('release_date', { ascending: false });

            if (error) throw error;
            setUpdates(data || []);
        } catch (error) {
            console.error('Error fetching updates:', error);
        } finally {
            setLoading(false);
        }
    };

    const getUpdateIcon = (type: Update['type']) => {
        switch (type) {
            case 'major':
                return <Star className="w-6 h-6 text-purple-600" />;
            case 'security':
                return <Shield className="w-6 h-6 text-green-600" />;
            case 'minor':
            case 'patch':
            default:
                return <Zap className="w-6 h-6 text-blue-600" />;
        }
    };

    const getUpdateColor = (type: Update['type']) => {
        switch (type) {
            case 'major':
                return 'bg-purple-100 border-purple-200';
            case 'security':
                return 'bg-green-100 border-green-200';
            default:
                return 'bg-blue-100 border-blue-200';
        }
    };

    if (loading) return <LoadingState />;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl text-white shadow-lg">
                        <RefreshCw className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">مركز التحديثات</h1>
                        <p className="text-gray-500">آخر الأخبار والتحديثات في منصة سمارت دينتال</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {updates.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">لا توجد تحديثات حالياً</p>
                        </div>
                    ) : (
                        updates.map((update, index) => (
                            <div
                                key={update.id}
                                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
                            >
                                {/* Decorative background element */}
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${update.type === 'major' ? 'bg-purple-500' :
                                        update.type === 'security' ? 'bg-green-500' : 'bg-blue-500'
                                    }`} />

                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-shrink-0">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getUpdateColor(update.type)}`}>
                                            {getUpdateIcon(update.type)}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h2 className="text-xl font-bold text-gray-900">{update.title}</h2>
                                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-mono font-medium">v{update.version}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(update.release_date).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs ${update.type === 'major' ? 'bg-purple-50 text-purple-700' :
                                                            update.type === 'security' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                                                        }`}>
                                                        {update.type === 'major' ? 'تحديث رئيسي' : update.type === 'security' ? 'أمني' : 'تحسينات'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="prose prose-sm max-w-none text-gray-600 mt-4 whitespace-pre-wrap leading-relaxed">
                                            {update.content}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
