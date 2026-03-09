import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Share2, Calendar, FileText, Globe, Bookmark, ExternalLink } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useCommunity } from '../../hooks/useCommunity';
import { mockScientificResources } from '../../data/mock';

export const ResourceDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { resources } = useCommunity();

    // Find the source from the dynamic list
    const source = resources.find(s => s.id === id);

    // Derived Mock Resources (keep this logic for now as we don't have posts per source yet)
    // In a real app, we'd fetch posts filtered by source.id
    const sourceResources = mockScientificResources.filter(r => r.sourceId === (source?.id || 'mock-id'));

    if (!source) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>المصدر غير موجود</p>
                <Button onClick={() => navigate(-1)}>عودة</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-6">
            <div className="container mx-auto px-4 max-w-4xl">
                <Button variant="ghost" className="mb-4 text-gray-500" onClick={() => navigate(-1)}>
                    <ArrowRight className="w-4 h-4 ml-2" />
                    عودة للمصادر
                </Button>

                {/* Source Header */}
                <Card className="mb-8 overflow-hidden border-none shadow-md">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-right">
                        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm font-bold text-2xl">
                            {source.logo && source.logo.length < 5 ? source.logo : <BookOpen className="w-10 h-10" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{source.title || source.name}</h1>
                                    <div className="flex items-center gap-2 justify-center md:justify-start">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                            {source.type === 'journal' ? 'مجلة علمية' : source.type === 'website' ? 'موقع إلكتروني' : 'مدونة'}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mt-4 leading-relaxed max-w-2xl">{source.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white text-blue-600 font-bold rounded-xl shadow-sm hover:bg-blue-50 transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        زيارة الموقع
                                    </a>
                                    <Button className="bg-blue-600 text-white gap-2">
                                        <Bookmark className="w-4 h-4" />
                                        متابعة
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Resources Feed */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        المنشورات والمقالات
                    </h2>

                    {sourceResources.length > 0 ? (
                        sourceResources.map(resource => (
                            <Card key={resource.id} className="p-6 hover:shadow-md transition-shadow border border-gray-100">
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold text-blue-600 mb-2 block">{resource.category}</span>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {resource.date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Globe className="w-3 h-3" />
                                                    {source.name}
                                                </span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-600">
                                            <Share2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    <p className="text-gray-600 leading-relaxed text-sm">
                                        {resource.description}
                                    </p>

                                    <div className="pt-4 mt-2 border-t border-gray-50 flex justify-between items-center">
                                        <Button variant="outline" size="sm" className="text-xs">
                                            قراءة المزيد
                                        </Button>
                                        <span className="text-xs text-gray-400 italic">تم الجلب تلقائياً</span>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                            <p className="text-gray-500">لا توجد منشورات متاحة لهذا المصدر حالياً</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
