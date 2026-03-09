import React, { useState, useEffect } from 'react';
import { Button } from '../../common/Button';
import { Plus, Edit2, Trash2, Check, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

interface PromotionalCard {
    id: string;
    title: string;
    description: string;
    image?: string;
    button_text?: string;
    link?: string;
    active: boolean;
    section?: string;
    badge_text?: string;
}

export const PromoCardsManager: React.FC = () => {
    const [cards, setCards] = useState<PromotionalCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCard, setEditingCard] = useState<PromotionalCard | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('promotional_cards')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching cards:', error);
            toast.error('فشل تحميل البطاقات');
        } else {
            setCards(data || []);
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCard) return;

        const cardData = {
            title: editingCard.title,
            description: editingCard.description,
            image: editingCard.image,
            button_text: editingCard.button_text || 'تسوق الآن',
            link: editingCard.link || '/store/deals',
            active: editingCard.active,
            section: 'home_hero',
            badge_text: editingCard.badge_text || '✨ عروض مميزة'
        };

        try {
            if (editingCard.id === 'new') {
                const { error } = await supabase.from('promotional_cards').insert([cardData]);
                if (error) throw error;
                toast.success('تمت إضافة العرض بنجاح');
            } else {
                const { error } = await supabase.from('promotional_cards').update(cardData).eq('id', editingCard.id);
                if (error) throw error;
                toast.success('تم تحديث العرض بنجاح');
            }
            setIsFormOpen(false);
            setEditingCard(null);
            fetchCards();
        } catch (error) {
            console.error('Error saving card:', error);
            toast.error('حدث خطأ أثناء الحفظ');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;
        try {
            const { error } = await supabase.from('promotional_cards').delete().eq('id', id);
            if (error) throw error;
            toast.success('تم حذف العرض');
            fetchCards();
        } catch (error) {
            toast.error('فشل الحذف');
        }
    };

    const toggleActive = async (card: PromotionalCard) => {
        try {
            const { error } = await supabase.from('promotional_cards').update({ active: !card.active }).eq('id', card.id);
            if (error) throw error;
            fetchCards();
            toast.success(card.active ? 'تم تعطيل العرض' : 'تم تفعيل العرض');
        } catch (error) {
            toast.error('فشل تحديث الحالة');
        }
    };

    const seedDefaultCards = async () => {
        setLoading(true);
        const defaultCards = [
            {
                title: 'تجهيزات العيادات الحديثة',
                description: 'خصم يصل إلى 20% على كراسي الأسنان',
                image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&auto=format&fit=crop&q=80',
                button_text: 'تصفح العروض',
                link: '/store',
                active: true,
                section: 'home_hero',
                badge_text: '✨ عروض مميزة'
            },
            {
                title: 'مستلزمات التعقيم',
                description: 'أفضل أجهزة التعقيم لضمان سلامة مرضاك',
                image: 'https://images.unsplash.com/photo-1588776813186-6f4d5c6f4c8a?w=1600&auto=format&fit=crop&q=80',
                button_text: 'تصفح العروض',
                link: '/store',
                active: true,
                section: 'home_hero',
                badge_text: 'مستلزمات التعقيم'
            },
            {
                title: 'عروض أدوات تقويم الأسنان',
                description: 'اشترِ مجموعة واحصل على خصم إضافي',
                image: 'https://images.unsplash.com/photo-1598256989494-02630f6dc069?w=1600&auto=format&fit=crop&q=80',
                button_text: 'تصفح العروض',
                link: '/store',
                active: true,
                section: 'home_hero',
                badge_text: '✨ عروض مميزة'
            }
        ];

        try {
            const { error } = await supabase.from('promotional_cards').insert(defaultCards);
            if (error) throw error;
            toast.success('تم استعادة العروض الافتراضية');
            fetchCards();
        } catch (error: any) {
            console.error('Error seeding cards:', error);
            toast.error(`فشل استعادة البيانات: ${error.message || 'خطأ غير معروف'}`);
        } finally {
            setLoading(false);
        }
    };

    // Filter for home page hero section
    const homeCards = cards.filter(c => c.section === 'home_hero' || !c.section);

    return (
        <div className="space-y-6">
            {/* Home Hero Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">البطاقة الترويجية في الصفحة العامة للمتجر</h3>
                        <p className="text-gray-500 text-sm mt-1">إدارة العروض التي تظهر في الشريط المتحرك الرئيسي في المتجر</p>
                    </div>
                    <Button onClick={() => {
                        setEditingCard({ id: 'new', title: '', description: '', active: true, button_text: 'تسوق الآن', section: 'home_hero', badge_text: '✨ عروض مميزة' });
                        setIsFormOpen(true);
                    }}>
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة عرض
                    </Button>
                </div>

                {loading ? <p className="text-center text-gray-500 py-8">جاري التحميل...</p> : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {homeCards.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">لا توجد عروض حالياً</p>
                                <p className="text-gray-400 text-sm mt-1 mb-4">يمكنك إضافة عرض جديد أو استعادة العروض الافتراضية</p>
                                <Button onClick={seedDefaultCards} className="bg-blue-600 text-white hover:bg-blue-700">
                                    استعادة العروض الافتراضية للواجهة
                                </Button>
                            </div>
                        ) : (
                            homeCards.map(card => (
                                <div key={card.id} className="group relative bg-white rounded-3xl border border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col">
                                    {/* Image Section */}
                                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                                        {card.image ? (
                                            <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                                                <ImageIcon className="w-10 h-10 opacity-50" />
                                            </div>
                                        )}

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                        {/* Status Badge */}
                                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm border ${card.active
                                                ? 'bg-green-500/90 text-white border-green-400/50'
                                                : 'bg-gray-500/90 text-white border-gray-400/50'}`}>
                                                {card.active ? 'نشط' : 'معطل'}
                                            </span>
                                        </div>

                                        {/* Promo Badge */}
                                        {card.badge_text && (
                                            <div className="absolute top-4 left-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-purple-500/90 text-white border border-purple-400/50 shadow-sm">
                                                    {card.badge_text}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-5 flex-1 flex flex-col relative">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-purple-600 transition-colors">{card.title}</h4>
                                            {/* Actions */}
                                            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => toggleActive(card)} className={`p-2 rounded-xl transition-all duration-200 ${card.active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`} title={card.active ? 'تعطيل' : 'تفعيل'}>
                                                    {card.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                </button>
                                                <button onClick={() => { setEditingCard(card); setIsFormOpen(true); }} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-200" title="تعديل">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(card.id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-200" title="حذف">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed flex-1">{card.description}</p>

                                        {/* Footer Meta */}
                                        <div className="flex items-center gap-3 pt-4 border-t border-gray-50 bg-gray-50/50 -mx-5 -mb-5 p-4 mt-auto">
                                            <div className="flex-1 flex items-center gap-2 min-w-0">
                                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                                <span className="text-xs text-gray-500 truncate font-mono" dir="ltr">{card.link}</span>
                                            </div>
                                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold border border-purple-200">
                                                {card.button_text}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {isFormOpen && editingCard && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold text-gray-900">{editingCard.id === 'new' ? 'إضافة عرض جديد' : 'تعديل العرض'}</h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان العرض</label>
                                <input type="text" required value={editingCard.title} onChange={e => setEditingCard({ ...editingCard, title: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="مثال: خصم 50% على..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">وصف العرض</label>
                                <textarea required rows={3} value={editingCard.description} onChange={e => setEditingCard({ ...editingCard, description: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none" placeholder="اكتب وصفاً مختصراً للعرض..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">رابط الصورة (URL)</label>
                                <div className="flex gap-2">
                                    <input type="url" required value={editingCard.image || ''} onChange={e => setEditingCard({ ...editingCard, image: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dir-ltr" placeholder="https://..." />
                                </div>
                                {editingCard.image && (
                                    <div className="mt-2 h-24 w-full bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                                        <img src={editingCard.image} className="w-full h-full object-cover" alt="Preview" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                    </div>
                                )}
                            </div>

                            {/* Badge Text Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">نص الشارة (مثال: ✨ عروض مميزة)</label>
                                <input type="text" value={editingCard.badge_text || ''} onChange={e => setEditingCard({ ...editingCard, badge_text: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="✨ عروض مميزة" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">نص الزر</label>
                                    <input type="text" value={editingCard.button_text || ''} onChange={e => setEditingCard({ ...editingCard, button_text: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500" placeholder="مثال: تسوق الآن" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">الرابط عند النقر</label>
                                    <input type="text" value={editingCard.link || ''} onChange={e => setEditingCard({ ...editingCard, link: e.target.value })} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dir-ltr" placeholder="/store/..." />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                                <Button variant="ghost" onClick={() => setIsFormOpen(false)} type="button" className="flex-1">إلغاء</Button>
                                <Button type="submit" variant="primary" className="flex-1 bg-purple-600 hover:bg-purple-700">حفظ العرض</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
