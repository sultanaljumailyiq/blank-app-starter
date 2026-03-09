import React, { useEffect } from 'react';
import { Card } from '../../../components/common/Card';
import { useAdminStore } from '../../../hooks/useAdminStore';
import {
    ShoppingBag, Users, DollarSign, Tag, Gift,
    CreditCard, Star, Percent, Briefcase
} from 'lucide-react';

export const StoreManagementDashboard: React.FC = () => {
    const { stats, loading, refresh } = useAdminStore();

    if (loading) return <div className="p-8 text-center text-gray-500">جاري تحميل إحصائيات المتجر...</div>;

    const statCards = [
        {
            title: 'طلبات المنتجات', // Product Orders
            value: stats.activeOrders,
            icon: ShoppingBag,
            color: 'blue'
        },
        {
            title: 'الموردين', // Suppliers
            value: stats.totalSuppliers,
            icon: Users,
            color: 'indigo'
        },
        {
            title: 'العمولات والمالية', // Commissions & Finance
            value: `${(stats.totalRevenue / 1000000).toFixed(1)}M`, // Mock formatting
            icon: DollarSign,
            color: 'green'
        },
        {
            title: 'العروض والصفقات', // Offers & Deals
            value: stats.activePromotions,
            icon: Tag,
            color: 'purple'
        },
        {
            title: 'البطاقات الترويجية', // Promotional Cards
            value: stats.activeCards,
            icon: CreditCard,
            color: 'orange'
        },
        {
            title: 'المنتجات المميزة', // Featured Products
            value: stats.products.active, // Using active count as proxy or specific featured count if added
            icon: Star,
            color: 'yellow'
        },
        {
            title: 'منتجات العروض', // Offer Products
            value: stats.activePromotions, // Proxy
            icon: Gift,
            color: 'pink'
        },
        {
            title: 'طلبات العروض', // Offer Requests
            value: stats.pendingDealRequests,
            icon: Briefcase,
            color: 'rose'
        },
        {
            title: 'قسائم التخفيض', // Discount Coupons
            value: stats.activeCoupons,
            icon: Percent,
            color: 'teal'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">إدارة المتجر والموردين</h2>
                <button onClick={refresh} className="text-sm text-blue-600 hover:text-blue-700">تحديث البيانات</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, idx) => (
                    <Card key={idx} className={`border-l-4 border-${stat.color}-500`}>
                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium mb-1">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                            <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-xl`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Detailed Tables could go here (Suppliers List, Recent Orders, etc.) */}
            {/* For now, just the stats grid as requested */}
        </div>
    );
};
