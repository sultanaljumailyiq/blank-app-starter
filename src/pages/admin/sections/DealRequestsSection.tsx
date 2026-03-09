import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Check, X, AlertCircle, Megaphone, Star, Tag, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { toast } from 'sonner';

interface ProductRequest {
    id: string;
    name: string;
    image_url: string;
    price: number;
    supplier: {
        id: string;
        name: string; // from profiles or suppliers table logic (might need join)
    };
    is_new_request: boolean;
    is_featured_request: boolean;
    is_offer_request: boolean;
    offer_request_percentage: number;
    created_at: string;
}

export const DealRequestsSection: React.FC = () => {
    const [requests, setRequests] = useState<ProductRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            // Fetch products that have ANY request flag set to true
            const { data, error } = await supabase
                .from('products')
                .select(`
          id, name, image_url, price, created_at,
          is_new_request, is_featured_request, is_offer_request, offer_request_percentage,
          supplier:suppliers(id, user_id)
        `)
                .or('is_new_request.eq.true,is_featured_request.eq.true,is_offer_request.eq.true');

            if (error) throw error;

            // We need to fetch Supplier Names manually if not linked perfectly in View
            // Or just display Supplier ID for now, effectively we need a join with profiles if possible
            // Let's assume we can get basic info or improved query later. 
            // For now, let's map what we have.

            const mappedRequests = data?.map((p: any) => ({
                ...p,
                supplier: {
                    id: p.supplier?.id,
                    name: 'مورد #' + p.supplier?.id?.slice(0, 5) // Placeholder until we join profiles
                }
            })) || [];

            setRequests(mappedRequests);
        } catch (err) {
            console.error('Error fetching requests:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (request: ProductRequest, type: 'new' | 'featured' | 'offer') => {
        try {
            let updates: any = {};

            if (type === 'new') {
                updates = { is_new: true, is_new_request: false };
            } else if (type === 'featured') {
                updates = { is_featured: true, is_featured_request: false };
            } else if (type === 'offer') {
                const discount = request.offer_request_percentage;
                updates = { discount: discount, is_offer_request: false, offer_request_percentage: 0 };
                // Ideally we keep offer_request_percentage as history/ref or clear it. Clearing it ensures no stale request.
            }

            const { error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', request.id);

            if (error) throw error;

            toast.success('تمت الموافقة بنجاح');
            fetchRequests();
        } catch (err) {
            console.error(err);
            toast.error('حدث خطأ أثناء الموافقة');
        }
    };

    const handleReject = async (request: ProductRequest, type: 'new' | 'featured' | 'offer') => {
        try {
            let updates: any = {};
            if (type === 'new') updates = { is_new_request: false };
            else if (type === 'featured') updates = { is_featured_request: false };
            else if (type === 'offer') updates = { is_offer_request: false }; // Keep percentage or clear? clearing is safer.

            const { error } = await supabase
                .from('products')
                .update(updates)
                .eq('id', request.id);

            if (error) throw error;

            toast.success('تم رفض الطلب');
            fetchRequests();
        } catch (err) {
            console.error(err);
            toast.error('حدث خطأ');
        }
    };

    if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">طلبات العروض والمنتجات المميزة</h2>
                    <p className="text-gray-600">الموافقة على طلبات الموردين لتمييز منتجاتهم</p>
                </div>
                <Button variant="outline" onClick={fetchRequests}>تحديث</Button>
            </div>

            {requests.length === 0 ? (
                <Card>
                    <div className="p-8 text-center text-gray-500">
                        <Check className="w-12 h-12 mx-auto mb-4 text-green-500 bg-green-50 p-2 rounded-full" />
                        <p>لا توجد طلبات معلقة حالياً</p>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {requests.map(req => (
                        <Card key={req.id} className="overflow-hidden">
                            <div className="p-6 md:flex items-start gap-6">
                                {/* Product Image */}
                                <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 border border-gray-200">
                                    <img src={req.image_url || 'https://via.placeholder.com/150'} className="w-full h-full object-contain" alt={req.name} />
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{req.name}</h3>
                                            <p className="text-sm text-gray-500 mb-2">المورد: {req.supplier.name}</p>
                                            <p className="text-blue-600 font-bold">{formatCurrency(req.price)}</p>
                                        </div>
                                        <p className="text-xs text-gray-400">{formatDate(req.created_at)}</p>
                                    </div>

                                    {/* Requests Flags */}
                                    <div className="mt-4 flex flex-wrap gap-4">
                                        {req.is_new_request && (
                                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center justify-between gap-4 min-w-[200px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                                                        <Star className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">منتج جديد</p>
                                                        <p className="text-xs text-gray-500">طلب إضافة شارة "جديد"</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleApprove(req, 'new')} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200" title="موافقة"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => handleReject(req, 'new')} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200" title="رفض"><X className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        )}

                                        {req.is_featured_request && (
                                            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-center justify-between gap-4 min-w-[200px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-full">
                                                        <Megaphone className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">منتج مميز</p>
                                                        <p className="text-xs text-gray-500">طلب الظهور في "مميز"</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleApprove(req, 'featured')} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200" title="موافقة"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => handleReject(req, 'featured')} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200" title="رفض"><X className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        )}

                                        {req.is_offer_request && (
                                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center justify-between gap-4 min-w-[200px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-red-100 text-red-600 rounded-full">
                                                        <Tag className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-900">عرض خصم {req.offer_request_percentage}%</p>
                                                        <p className="text-xs text-gray-500">السعر بعد الخصم: {formatCurrency(req.price * (1 - req.offer_request_percentage / 100))}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleApprove(req, 'offer')} className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200" title="موافقة"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => handleReject(req, 'offer')} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200" title="رفض"><X className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
