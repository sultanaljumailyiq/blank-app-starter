import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export const useDemoData = () => {
    const { user } = useAuth();
    const [seeding, setSeeding] = useState(false);

    const generateDemoData = async () => {
        if (!user) return;
        try {
            setSeeding(true);

            // 1. Ensure Supplier Profile Exists
            const { error: profileError } = await supabase
                .from('suppliers')
                .upsert({
                    id: user.id,
                    user_id: user.id,
                    company_name: 'شركة اللوازم الطبية الحديثة',
                    contact_name: user.email?.split('@')[0] || 'المورد',
                    phone: '07700000000',
                    email: user.email,
                    address: 'بغداد، المنصور',
                    is_verified: true,
                    rating: 4.8
                });

            if (profileError) throw profileError;

            // 2. Add Demo Products
            const products = [
                {
                    name: 'حشوة ضوئية 3M Premium',
                    description: 'حشوة ضوئية عالية الجودة مع ثباتية ممتازة',
                    price: 45000,
                    original_price: 50000,
                    stock: 150,
                    category: 'المواد الاستهلاكية',
                    image_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=200',
                    supplier_id: user.id,
                },
                {
                    name: 'طقم أدوات فحص ستانلس ستيل',
                    description: 'طقم متكامل من 4 قطع، مقاوم للصدأ',
                    price: 25000,
                    stock: 50,
                    category: 'الأدوات',
                    image_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=200',
                    supplier_id: user.id,
                },
                {
                    name: 'قفازات طبية (علبة 100 قطعة)',
                    description: 'قفازات لاتكس معقمة، مقاس متوسط',
                    price: 5000,
                    stock: 500,
                    category: 'المواد الاستهلاكية',
                    image_url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&q=80&w=200',
                    supplier_id: user.id,
                }
            ];

            const { data: insertedProducts, error: productsError } = await supabase
                .from('supplier_products')
                .insert(products)
                .select();

            if (productsError) throw productsError;

            // 3. Create Orders from "Fake" Clinics
            if (insertedProducts && insertedProducts.length > 0) {
                const demoOrders = [
                    {
                        order_number: `ORD-${Date.now()}-1`,
                        supplier_id: user.id,
                        user_id: user.id, // For demo, self-assigned or use a dummy ID if possible. Linking to self allows seeing it in "My Orders" too if acting as clinic.
                        user_name: 'عيادة الشفاء - د. أحمد',
                        total_amount: 90000,
                        status: 'pending',
                        payment_status: 'unpaid',
                        shipping_address: { address: 'الكرادة، شارع 62', phone: '07901111111' },
                        items: [
                            { product_id: insertedProducts[0].id, quantity: 2, price_at_purchase: 45000 }
                        ]
                    },
                    {
                        order_number: `ORD-${Date.now()}-2`,
                        supplier_id: user.id,
                        user_id: user.id,
                        user_name: 'مركز النور لطب الأسنان',
                        total_amount: 55000,
                        status: 'processing',
                        payment_status: 'paid',
                        shipping_address: { address: 'المنصور، قرب المول', phone: '07802222222' },
                        items: [
                            { product_id: insertedProducts[0].id, quantity: 1, price_at_purchase: 45000 },
                            { product_id: insertedProducts[2].id, quantity: 2, price_at_purchase: 5000 }
                        ]
                    }
                ];

                for (const order of demoOrders) {
                    const { data: orderData, error: orderError } = await supabase
                        .from('orders')
                        .insert({
                            order_number: order.order_number,
                            supplier_id: order.supplier_id,
                            user_id: order.user_id,
                            user_name: order.user_name,
                            total_amount: order.total_amount,
                            status: order.status,
                            payment_status: order.payment_status,
                            shipping_address: order.shipping_address,
                            created_at: new Date().toISOString()
                        })
                        .select()
                        .single();

                    if (orderError) throw orderError;

                    const items = order.items.map(item => ({
                        order_id: orderData.id,
                        product_id: item.product_id,
                        quantity: item.quantity,
                        price_at_purchase: item.price_at_purchase
                    }));

                    await supabase.from('order_items').insert(items);
                }
            }

            toast.success('تم توليد بيانات تجريبية بنجاح! قم بتحديث الصفحة.');
            window.location.reload();
        } catch (err: any) {
            console.error('Demo data error:', err);
            toast.error('فشل توليد البيانات: ' + err.message);
        } finally {
            setSeeding(false);
        }
    };

    return { generateDemoData, seeding };
};
