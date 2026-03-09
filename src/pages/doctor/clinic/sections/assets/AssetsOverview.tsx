import React from 'react';
import { Card } from '../../../../../components/common/Card';
import { BentoStatCard } from '../../../../../components/dashboard/BentoStatCard';
import { Briefcase, TrendingUp, PieChart, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../../../../lib/utils';

export const AssetsOverview: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <BentoStatCard
                    title="قيمة الأصول الثابتة"
                    value="45,200,000"
                    icon={Briefcase}
                    color="blue"
                    delay={100}
                />
                <BentoStatCard
                    title="عائد الخدمات (السنوي)"
                    value={formatCurrency(66500000)}
                    icon={TrendingUp}
                    color="green"
                    trend="up"
                    trendValue="12.5%"
                    delay={200}
                />
                <BentoStatCard
                    title="متوسط هامش الربح"
                    value="65.2%"
                    icon={PieChart}
                    color="purple"
                    trend="up"
                    trendValue="4.1%"
                    delay={300}
                />
                <BentoStatCard
                    title="الأصول المتعطلة"
                    value="1"
                    icon={AlertCircle}
                    color="red"
                    trend="down"
                    trendValue="حالة واحدة"
                    delay={400}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">أعلى الخدمات إيراداً</h3>
                        <div className="space-y-4">
                            {/* Mock list */}
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span>زراعة سنية (كاملة)</span>
                                <span className="font-bold text-emerald-600">{formatCurrency(30000000)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span>تركيب تاج زركون</span>
                                <span className="font-bold text-emerald-600">{formatCurrency(17500000)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span>حشوة ضوئية</span>
                                <span className="font-bold text-emerald-600">{formatCurrency(12000000)}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">تنبيهات المخزون</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                                <span>مخدر موضعي - كمية منخفضة (5 أمبولات متبقية)</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-yellow-50 text-yellow-700 rounded-lg">
                                <AlertCircle className="w-5 h-5" />
                                <span>قفازات طبية (L) - اقتراب نفاد الكمية</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
