import React, { useState } from 'react';
import { X, Calendar, Percent, MessageSquare } from 'lucide-react';
import { Button } from '../common/Button';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

interface PromotionRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
}

export const PromotionRequestModal: React.FC<PromotionRequestModalProps> = ({ isOpen, onClose, product }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        discount_percentage: 10,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: ''
    });

    if (!isOpen || !product) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Insert into deal_requests table
            // Assuming deal_requests schema: id, product_id, supplier_id, discount_percentage, start_date, end_date, status, notes
            const { error } = await supabase.from('deal_requests').insert([
                {
                    product_id: product.id,
                    supplier_id: product.supplier_id,
                    discount_percentage: formData.discount_percentage,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    notes: formData.notes,
                    status: 'pending'
                }
            ]);

            if (error) throw error;
            toast.success('تم إرسال طلب الترويج بنجاح');
            onClose();
        } catch (error) {
            console.error('Error requesting promotion:', error);
            toast.error('فشل إرسال الطلب');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-900">طلب ترويج منتج</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-xl border border-blue-100 mb-4">
                        <img
                            src={product.image || 'https://via.placeholder.com/100'}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-white"
                        />
                        <div>
                            <p className="font-bold text-gray-900 text-sm">{product.name}</p>
                            <p className="text-xs text-blue-600 font-bold">{product.price.toLocaleString()} د.ع</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نسبة الخصم المقترحة (%)</label>
                        <div className="relative">
                            <input
                                type="number"
                                min="1"
                                max="100"
                                required
                                value={formData.discount_percentage}
                                onChange={e => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                            <Percent className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ البداية</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                />
                                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    required
                                    value={formData.end_date}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                />
                                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات للمسؤول (اختياري)</label>
                        <div className="relative">
                            <textarea
                                rows={3}
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                                placeholder="أي تفاصيل إضافية حول العرض..."
                            />
                            <MessageSquare className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                            إلغاء
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700">
                            {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
