
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { sendNotification } from '../lib/notifications';

export interface LabOrder {
    id: string;
    order_number: string;
    clinic_id: string;
    laboratory_id?: string; // Optional (Platform Lab)
    custom_lab_id?: string; // Optional (Manual Lab)
    custom_lab_name?: string;
    patient_id?: string;
    doctor_id?: string;
    patient_name: string;
    doctor_name?: string;
    clinic_name?: string;
    lab_name?: string;
    service_name: string;
    tooth_number?: number;
    tooth_numbers?: number[];
    status: 'pending' | 'waiting_for_representative' | 'representative_dispatched' | 'in_progress' | 'completed' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled' | 'rejected' | 'modification_requested';
    delegate_id?: string;
    delegate_name?: string;
    pickup_delegate_id?: string;
    pickup_delegate_name?: string;
    pickup_delegate_phone?: string;
    delivery_delegate_id?: string;
    delivery_delegate_name?: string;
    delivery_delegate_phone?: string;
    return_reason?: string;
    is_return_cycle?: boolean;
    order_date: string;
    final_amount: number;
    priority: 'low' | 'normal' | 'high' | 'urgent'; // Typed
    paid_amount?: number;
    expected_delivery_date?: string;
    rating?: number;
    review_note?: string;
    modification_note?: string;
    notes?: string;
    paymentStatus?: 'paid' | 'unpaid' | 'waiting_approval' | 'partial';
}

export const useLabOrders = (options?: { clinicId?: string, laboratoryId?: string }) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<LabOrder[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        if (!user) return;
        try {
            setLoading(true);

            let query = supabase
                .from('dental_lab_orders')
                .select(`
                    *,
                    laboratory:dental_laboratories(name, phone),
                    clinic:clinics(name),
                    staff:staff_record_id(full_name)
                `)
                .order('created_at', { ascending: false });

            // Apply filters
            console.log('Fetching orders with options:', options, 'User Role:', user.role);
            if (options?.clinicId && options.clinicId !== 'all') {
                console.log('Filtering strictly by clinicId:', options.clinicId);
                // Handle possible string/number mismatch by not assuming type, or forcing one if DB is strictly INT
                // But PostgREST handles matching "1" to 1.
                query = query.eq('clinic_id', options.clinicId);
            } else if (user.role === 'doctor') {
                // Fallback: Find ALL clinics associated with user (Owned OR Member)
                const { data: ownedClinics } = await supabase.from('clinics').select('id').eq('owner_id', user.id);
                const { data: memberClinics } = await supabase.from('clinic_members').select('clinic_id').eq('user_id', user.id);

                const allClinicIds = [
                    ...(ownedClinics?.map(c => c.id) || []),
                    ...(memberClinics?.map(m => m.clinic_id) || [])
                ];

                // Remove duplicates and Ensure we have IDs
                const uniqueIds = [...new Set(allClinicIds)];

                if (uniqueIds.length > 0) {
                    console.log('Filtering by user clinics:', uniqueIds);
                    query = query.in('clinic_id', uniqueIds);
                }
            } else if (user.role === 'laboratory') {
                // Fallback: Find lab associated with user - try all possible link columns
                const { data: lab } = await supabase.from('dental_laboratories').select('id').or(`id.eq.${user.id},user_id.eq.${user.id}`).maybeSingle();
                if (lab) {
                    console.log('Filtering by user-owned lab:', lab.id);
                    query = query.eq('laboratory_id', lab.id);
                } else {
                    console.warn('User is laboratory role but no lab record found.');
                }
            }

            if (options?.laboratoryId) {
                query = query.eq('laboratory_id', options.laboratoryId);
            }

            const { data, error } = await query;
            if (error) throw error;
            console.log('Orders fetch result count:', data?.length);

            // Now fetch delegate phones separately to bypass missing FK constraints
            const delegateIds = new Set<string>();
            data?.forEach(o => {
                if (o.pickup_delegate_id) delegateIds.add(o.pickup_delegate_id);
                if (o.delivery_delegate_id) delegateIds.add(o.delivery_delegate_id);
            });

            let delegatesMap: Record<string, string> = {};
            if (delegateIds.size > 0) {
                const { data: delegatesData } = await supabase
                    .from('dental_lab_representatives')
                    .select('id, phone')
                    .in('id', Array.from(delegateIds));

                if (delegatesData) {
                    delegatesMap = delegatesData.reduce((acc, d) => ({ ...acc, [d.id]: d.phone }), {});
                }
                console.log('Map of fetched delegate phones:', delegatesMap);
            }

            const mappedOrders: LabOrder[] = (data || []).map((o: any) => ({
                id: o.id,
                order_number: o.order_number,
                clinic_id: o.clinic_id,
                laboratory_id: o.laboratory_id,
                patient_id: o.patient_id,
                // Unified: Use staff_id instead of doctor_id
                doctor_id: o.staff_id?.toString(),

                // Snake Case (DB / Hook Internal)
                patient_name: o.patient_name,
                service_name: o.service_name,
                tooth_number: o.tooth_number,
                tooth_numbers: o.tooth_numbers,
                doctor_name: o.doctor_name || o.staff?.full_name, // Use joined staff name

                // Camel Case (UI Compatibility)
                patientName: o.patient_name,
                doctorName: o.doctor_name || o.staff?.full_name,
                testType: o.service_name,
                labName: o.laboratory?.name || o.custom_lab_name || 'مختبر خارجي',
                lab_phone: o.laboratory?.phone, // Mapped lab phone
                createdAt: o.created_at?.split('T')[0],
                expectedDelivery: o.expected_delivery_date,

                clinic_name: o.clinic?.name,
                lab_name: o.laboratory?.name || o.custom_lab_name || 'مختبر خارجي',
                status: o.status,
                order_date: o.created_at,
                final_amount: o.final_amount,
                priority: o.priority,
                delegate_id: o.delegate_id,
                delegate_name: o.delegate_name,
                pickup_delegate_id: o.pickup_delegate_id,
                pickup_delegate_name: o.pickup_delegate_name,
                pickup_delegate_phone: delegatesMap[o.pickup_delegate_id] || undefined,
                delivery_delegate_id: o.delivery_delegate_id,
                delivery_delegate_name: o.delivery_delegate_name,
                delivery_delegate_phone: delegatesMap[o.delivery_delegate_id] || undefined,
                return_reason: o.return_reason,
                is_return_cycle: o.is_return_cycle,
                paid_amount: o.paid_amount,
                expected_delivery_date: o.expected_delivery_date,
                rating: o.rating,
                review_note: o.review_note,
                notes: o.notes,
                modification_note: o.modification_note,
                paymentStatus: o.payment_status || 'unpaid',

                price: o.price || o.final_amount // Compatibility
            }));

            setOrders(mappedOrders);

        } catch (error) {
            console.error('Error fetching lab orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const submitOrder = async (orderData: any) => {
        try {
            setLoading(true);

            // Prepare payload for direct insert
            const clinicIdNum = Number(orderData.clinic_id);
            if (isNaN(clinicIdNum) || clinicIdNum === 0) {
                throw new Error(`Invalid Clinic ID: ${orderData.clinic_id}`);
            }

            const payload = {
                clinic_id: clinicIdNum,
                laboratory_id: orderData.laboratory_id || null,
                // custom_lab_id: orderData.custom_lab_id || null, // Removed as column missing
                custom_lab_name: orderData.custom_lab_name || null,
                patient_name: orderData.patient_name,
                patient_id: orderData.patient_id ? Number(orderData.patient_id) : null,

                doctor_id: orderData.doctor_id ? String(orderData.doctor_id) : null,

                doctor_name: orderData.doctor_name || null,
                service_name: orderData.service_name,
                final_amount: orderData.price || orderData.final_amount || 0,
                priority: orderData.priority || 'normal',
                expected_delivery_date: orderData.expected_date || orderData.expected_delivery_date,

                notes: orderData.notes, // Fixed mapping
                order_number: `ORD-${Date.now().toString().slice(-6)}`, // Generate Order Numberhttps://127.0.0.1:21939/static/artifacts/75a91a56-0dcf-40db-aead-6642fd08cd02/verify_dropdown_fix_1771727406120.webp?csrf=7aaa7bd1-a321-4590-aaac-c9c269011456&t=1771727547281
                status: 'pending',
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('dental_lab_orders')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;

            toast.success('تم إرسال الطلب بنجاح');
            fetchOrders();

            // Send Notification (Commented out for debug)
            /*
            if (orderData.laboratory_id) {
                await sendNotification({
                    laboratory_id: orderData.laboratory_id,
                    type: 'appointment',
                    title: 'طلب عمل جديد',
                    message: `لديك طلب جديد بانتظار الموافقة`,
                    link: '/lab/orders',
                    priority: 'normal'
                });
            }
            */

            return data;
        } catch (error: any) {
            console.error('Submit Error:', error);
            toast.error(error.message || 'فشل إرسال الطلب');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, status: string, additionalUpdates: any = {}) => {
        try {
            // Prepare DB updates (map camelCase to snake_case if needed)
            const dbUpdates = { ...additionalUpdates };
            if (additionalUpdates.paymentStatus) {
                dbUpdates.payment_status = additionalUpdates.paymentStatus;
                delete dbUpdates.paymentStatus;
            }

            const { error } = await supabase
                .from('dental_lab_orders')
                .update({ status, ...dbUpdates })
                .eq('id', orderId)
                .select()
                .single();

            if (error) throw error;

            // Update local state
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as any, ...additionalUpdates } : o));
            toast.success('تم تحديث حالة الطلب');

            // Send Notification to Clinic
            const order = orders.find(o => o.id === orderId);
            if (order && order.clinic_id) {
                await sendNotification({
                    target_user_id: order.doctor_id,
                    clinic_id: order.clinic_id,
                    type: 'order_update',
                    title: `تحديث حالة الطلب #${order.order_number}`,
                    message: `تم تغيير حالة الطلب للمريض ${order.patient_name} إلى: ${getStatusLabel(status)}`,
                    link: `/clinic/labs`,
                    priority: 'normal'
                });
            }

        } catch (err) {
            console.error(err);
            toast.error('فشل تحديث الحالة');
        }
    };

    // Helper to get Arabic label 
    const getStatusLabel = (s: string) => {
        const map: any = {
            pending: 'في انتظار الموافقة',
            waiting_for_representative: 'بانتظار المندوب',
            representative_dispatched: 'تم إرسال المندوب',
            in_progress: 'قيد العمل',
            completed: 'مكتمل',
            out_for_delivery: 'جارِ التوصيل',
            delivered: 'تم التسليم',
            returned: 'مسترجع',
            rejected: 'مرفوض',
            cancelled: 'ملغي',
            modification_requested: 'طلب تعديل'
        };
        return map[s] || s;
    };

    const deleteOrder = async (orderId: string) => {
        try {
            // 1. Fetch order details for notification
            const orderToDelete = orders.find(o => o.id === orderId);

            // 2. Perform Delete and check if actually deleted
            const { data, error } = await supabase
                .from('dental_lab_orders')
                .delete()
                .eq('id', orderId)
                .select();

            if (error) throw error;
            if (!data || data.length === 0) throw new Error("لا تملك صلاحية لحذف هذا الطلب، تأكد من شروط الحذف.");

            // 3. Update Local State
            setOrders(prev => prev.filter(o => o.id !== orderId));
            toast.success('تم حذف الطلب بنجاح');

            // 4. Send Notification (Best Effort)
            if (orderToDelete) {
                // If Doctor is deleting, notify Lab
                if (user?.role === 'doctor' && orderToDelete.laboratory_id) {
                    // Note: You need a system to notify Lab User ID derived from Lab ID
                    // For now, we skip complex lookup since we don't have direct LabUserID in local state always
                    // But if we have it, do it. Use 'lab_orders' channel or Messages potentially.
                }
                // If Lab is deleting, notify Clinic (stored in clinic_id)
                // Since Notification system relies on DB tables that might trigger off Insert,
                // Deleting the source order might make links invalid.
                // Safest is to just rely on Realtime (already implemented) to remove it from their screen.
            }

        } catch (err) {
            console.error('Error deleting order:', err);
            toast.error('فشل حذف الطلب');
            throw err;
        }
    };

    useEffect(() => {
        if (!user) return;

        fetchOrders();

        // Realtime Subscription
        const channel = supabase
            .channel('lab_orders_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'dental_lab_orders'
                },
                (payload) => {
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, options?.clinicId, options?.laboratoryId]);

    return {
        orders,
        loading,
        refresh: fetchOrders,
        fetchOrders,
        createOrder: submitOrder,
        updateOrderStatus,
        deleteOrder
    };
};
