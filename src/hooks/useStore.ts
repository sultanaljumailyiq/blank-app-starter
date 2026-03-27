import { useStoreContext } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import { sendNotification } from '../lib/notifications';

export function useStore() {
    const store = useStoreContext();

    const placeOrder = async (items: { id: string, quantity: number }[], shippingAddress: any, paymentMethod: string = 'cash') => {
        try {
            // Calculate Totals using current prices
            let totalAmount = 0;

            interface OrderItem {
                product_id: string;
                quantity: number;
                price_at_purchase: number;
                supplier_id: string;
                supplier_name: string;
                product_name: string;
            }

            const orderItems: OrderItem[] = [];
            let invalidCount = 0;

            for (const item of items) {
                const product = store.products.find(p => p.id === item.id);
                if (!product) {
                    invalidCount++;
                    continue;
                }

                const price = product.price;
                totalAmount += price * item.quantity;

                orderItems.push({
                    product_id: item.id,
                    quantity: item.quantity,
                    price_at_purchase: price,
                    supplier_id: product.supplierId,
                    supplier_name: product.supplierName,
                    product_name: product.name
                });
            }

            if (invalidCount > 0) {
                if (orderItems.length === 0) {
                    throw new Error('المنتجات في السلة غير متوفرة حالياً (قد تكون حذفت أو انتهت)');
                } else {
                    throw new Error('بعض المنتجات في السلة غير متوفرة، يرجى تحديث السلة');
                }
            }

            if (orderItems.length === 0) throw new Error('السلة فارغة');

            if (orderItems.length === 0) throw new Error('السلة فارغة');

            // Fix: Use random string for order number to prevent duplicates
            const orderNumber = `ORD-${Math.floor(Math.random() * 1000000000)}`;
            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id || '00000000-0000-0000-0000-000000000000';

            // Fetch generic profile info
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', userId)
                .single();

            const profileName = profile?.full_name || user?.user_metadata?.full_name;

            // Split Orders Logic
            const itemsBySupplier: Record<string, OrderItem[]> = {};

            orderItems.forEach(item => {
                if (!itemsBySupplier[item.supplier_id]) itemsBySupplier[item.supplier_id] = [];
                itemsBySupplier[item.supplier_id].push(item);
            });

            for (const supplierId of Object.keys(itemsBySupplier)) {
                const supplierItems = itemsBySupplier[supplierId];
                const supplierTotal = supplierItems.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0);
                const subOrderNumber = `${orderNumber}-${supplierId.slice(0, 4)}`;

                // Improved User Name Logic: Profile Name (Primary) + Clinic/Recipient Info
                let orderUserName = profileName || 'Guest User';

                // Append Shipping Context if available
                if (shippingAddress.clinicName) {
                    orderUserName += ` - ${shippingAddress.clinicName}`;
                } else if (shippingAddress.recipientName && shippingAddress.recipientName !== profileName) {
                    orderUserName += ` - ${shippingAddress.recipientName}`;
                }

                const orderNotes = `Phone: ${shippingAddress.phone}\nAddress: ${shippingAddress.address}${shippingAddress.backupPhone ? `\nBackup Phone: ${shippingAddress.backupPhone}` : ''}`;

                const { data: orderData, error: orderError } = await supabase
                    .from('store_orders')
                    .insert({
                        order_number: subOrderNumber,
                        user_id: userId,
                        user_name: orderUserName,
                        ordered_by: profileName,
                        supplier_id: supplierId,
                        total_amount: supplierTotal,
                        status: 'pending',
                        payment_status: paymentMethod === 'cash' ? 'pending' : 'paid',
                        shipping_address: shippingAddress,
                        notes: orderNotes,
                        created_at: new Date().toISOString()
                    })
                    .select()
                    .single();

                if (orderError) throw orderError;

                const itemsToInsert = supplierItems.map(item => ({
                    order_id: orderData.id,
                    product_id: item.product_id,
                    supplier_id: supplierId,
                    quantity: item.quantity,
                    price_at_purchase: item.price_at_purchase
                }));

                const { error: itemsError } = await supabase
                    .from('store_order_items')
                    .insert(itemsToInsert);

                if (itemsError) throw itemsError;

                // Notify Supplier
                await sendNotification({
                    target_user_id: supplierId,
                    type: 'order_update',
                    title: 'طلب جديد!',
                    message: `تم استلام طلب جديد #${subOrderNumber} بقيمة ${supplierTotal.toLocaleString()} د.ع`,
                    link: `/supplier/orders`,
                    priority: 'high'
                });
            }

            // Notify User (System Notification for record)
            await sendNotification({
                target_user_id: userId,
                type: 'order_update',
                title: 'تم استلام طلبك',
                message: `تم استلام طلبك #${orderNumber} بنجاح. سيتم التواصل معك قريباً.`,
                link: `/store/orders`
            });

            // Success
            return true;

        } catch (err: any) {
            console.error('Order placement failed:', err);
            // Re-throw to let UI handle the error (toast etc)
            throw new Error(err.message || 'فشل في إنشاء الطلب');
        }
    };

    return {
        ...store,
        cartCount: store.cart.reduce((acc, item) => acc + item.quantity, 0),
        placeOrder
    };
}
