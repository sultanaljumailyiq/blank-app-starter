import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User, ShoppingBag, Heart, Settings,
    HelpCircle, Phone, FileText, LogOut,
    Package, Truck, CreditCard, Bell,
    ChevronLeft, LayoutGrid, Factory, Star, Calendar, MessageCircle, MapPin, Headphones
} from 'lucide-react';
import { BottomNavigation } from '../../components/layout/BottomNavigation';
import { useAuth } from '../../contexts/AuthContext';

export default function StoreMenuPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const menuItems = [
        {
            id: 'orders',
            title: 'طلباتي',
            subtitle: 'تتبع المشتريات والطلبات السابقة',
            icon: Package,
            color: 'bg-purple-100',
            textColor: 'text-purple-600',
            link: '/store/orders',
            colSpan: 'col-span-1',
            rowSpan: 'row-span-1'
        },
        {
            id: 'cart',
            title: 'سلة التسوق',
            subtitle: 'المنتجات المختارة',
            icon: ShoppingBag,
            color: 'bg-emerald-100',
            textColor: 'text-emerald-600',
            link: '/store/cart',
            colSpan: 'col-span-1',
            rowSpan: 'row-span-1'
        },
        {
            id: 'wishlist',
            title: 'المفضلة',
            subtitle: 'المنتجات المحفوظة',
            icon: Heart,
            color: 'bg-rose-100',
            textColor: 'text-rose-600',
            link: '/store/favorites',
            colSpan: 'col-span-1',
            rowSpan: 'row-span-2' // Tall card
        },

        {
            id: 'addresses',
            title: 'عناوين الشحن',
            subtitle: 'أماكن التوصيل والاستلام',
            icon: MapPin,
            color: 'bg-orange-100',
            textColor: 'text-orange-600',
            link: '/store/addresses',
            colSpan: 'col-span-1',
            rowSpan: 'row-span-1'
        },
        {
            id: 'messages',
            title: 'الرسائل',
            subtitle: 'المحادثات والتنبيهات',
            icon: MessageCircle,
            color: 'bg-violet-100',
            textColor: 'text-violet-600',
            link: '/store/messages',
            colSpan: 'col-span-1',
            rowSpan: 'row-span-1'
        },
        {
            id: 'support',
            title: 'الدعم الفني',
            subtitle: 'المساعدة والتواصل',
            icon: Headphones,
            color: 'bg-blue-100',
            textColor: 'text-blue-600',
            link: '/store/support',
            colSpan: 'col-span-2',
            rowSpan: 'row-span-1'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-24" dir="rtl">


            {/* Main Content - Bento Grid */}
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[160px]">

                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => navigate(item.link)}
                            className={`
                 ${item.colSpan} ${item.rowSpan}
                 relative overflow-hidden rounded-3xl p-6 cursor-pointer
                 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group
                 bg-white border border-slate-100
               `}
                        >
                            <div className={`
                   absolute top-0 right-0 w-full h-full opacity-0 group-hover:opacity-5 transition-opacity duration-300
                   ${item.color.replace('bg-', 'bg-')} 
                `}></div>

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.color} ${item.textColor}`}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <ChevronLeft className="w-5 h-5 text-slate-300 group-hover:-translate-x-1 transition-transform" />
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">{item.title}</h3>
                                    <p className="text-xs text-slate-500 line-clamp-2">{item.subtitle}</p>
                                </div>
                            </div>

                            {/* Decorative Icon Background */}
                            <item.icon className={`
                   absolute -bottom-4 -left-4 w-32 h-32 opacity-5 
                   rotate-12 transition-transform duration-500 
                   group-hover:scale-110 group-hover:rotate-6
                   text-slate-900
                `} />
                        </div>
                    ))}



                </div>
            </div>

            <BottomNavigation />
        </div>
    );
}

// Helper icon component since 'Headset' wasn't imported initially (my bad, fixing inline or assuming lucide has it)
const Headset = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        className={className}
    >
        <path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" />
    </svg>
);
