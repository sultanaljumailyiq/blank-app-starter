import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { startOfMonth, isSameMonth, subMonths, format } from 'date-fns';
import { ar } from 'date-fns/locale';

export interface FinanceStats {
    totalRevenue: number;
    monthlyRevenue: number;
    totalExpenses: number;
    netProfit: number;
    pendingPayments: number;
    platformFees: number;
    returns: number;
    growth: number;
    totalSettled: number;
    pendingFees: number;
}

export interface RevenueData {
    month: string;
    amount: number;
    orders: number;
}

export interface ExpenseData {
    category: string;
    amount: number;
    percentage: number;
    color: string;
}

export interface Transaction {
    id: string;
    type: 'إيراد' | 'رسوم' | 'مرجعات' | 'تسوية';
    description: string;
    amount: number;
    date: string;
    status: 'مكتمل' | 'معلق' | 'مخصوم' | 'مُعاد';
    customer: string;
}

export const useSupplierFinance = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<FinanceStats>({
        totalRevenue: 0,
        monthlyRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        pendingPayments: 0,
        platformFees: 0,
        returns: 0,
        growth: 0,
        totalSettled: 0,
        pendingFees: 0
    });
    const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
    const [expenses, setExpenses] = useState<ExpenseData[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFinanceData = async () => {
        if (!user) return;
        try {
            setLoading(true);

            // 0. Get Supplier ID
            let supplierId = '';
            if (user?.email === 'supplier.demo@smartdental.com') {
                supplierId = 'c83cf236-1175-4181-8222-d60ca2f9327d';
            } else {
                const { data: supplier } = await supabase.from('suppliers').select('id').eq('user_id', user.id).maybeSingle();
                if (supplier) supplierId = supplier.id;
            }

            if (!supplierId) {
                setLoading(false);
                return;
            }

            // Fetch Orders
            const { data: orders, error } = await supabase
                .from('store_orders')
                .select('*')
                .eq('supplier_id', supplierId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!orders) {
                setLoading(false);
                return;
            }

            // Fetch Real Expenses
            const { data: realExpensesData } = await supabase
                .from('supplier_expenses')
                .select('*')
                .eq('supplier_id', supplierId);

            // Fetch Real Settlements (Commission Clearance)
            const { data: settlements } = await supabase
                .from('financial_transactions')
                .select('*')
                .eq('supplier_id', supplierId)
                .eq('category', 'commission_clearance')
                .order('transaction_date', { ascending: false });

            // 1. Calculate Transactions
            // A. Real Order Revenue
            const realTransactions: Transaction[] = orders.map((order: any) => {
                let type: Transaction['type'] = 'إيراد';
                let amount = order.total_amount;
                let status: Transaction['status'] = 'معلق';

                if (order.status === 'delivered') {
                    status = 'مكتمل';
                } else if (order.status === 'cancelled') {
                    amount = 0; // No revenue
                    status = 'مكتمل';
                } else if (order.status === 'returned') {
                    type = 'مرجعات';
                    amount = -order.total_amount;
                    status = 'مُعاد';
                }

                return {
                    id: order.id,
                    type,
                    description: `طلب #${order.order_number || order.id.slice(0, 8)}`,
                    amount,
                    date: order.created_at,
                    status,
                    customer: order.user_name || 'عميل'
                };
            });

            // B. Fee Transactions (Virtual)
            const feeTransactions: Transaction[] = orders
                .filter((o: any) => o.status === 'delivered')
                .map((o: any) => ({
                    id: `fee-${o.id}`,
                    type: 'رسوم',
                    description: `رسوم المنصة - طلب #${o.order_number || o.id.slice(0, 8)}`,
                    amount: -(o.total_amount * 0.025),
                    date: o.created_at,
                    status: 'مخصوم',
                    customer: 'Smart Dental'
                }));

            // C. Settlement Transactions
            const settlementTransactions: Transaction[] = (settlements || []).map((tx: any) => ({
                id: tx.id,
                type: 'تسوية',
                description: tx.description || 'تسوية عمولة المنصة',
                amount: -Number(tx.amount),
                date: tx.transaction_date,
                status: 'مكتمل',
                customer: 'المنصة'
            }));

            // Merge all Transactions
            const allTransactions = [...realTransactions, ...feeTransactions, ...settlementTransactions].sort((a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            );

            setTransactions(allTransactions);

            // 2. Calculate Stats
            const deliveredOrders = orders.filter((o: any) => o.status === 'delivered');
            const totalRevenue = deliveredOrders.reduce((sum: number, o: any) => sum + o.total_amount, 0);

            const now = new Date();
            const monthlyRevenue = deliveredOrders
                .filter((o: any) => isSameMonth(new Date(o.created_at), now))
                .reduce((sum: number, o: any) => sum + o.total_amount, 0);

            const returns = orders
                .filter((o: any) => o.status === 'returned')
                .reduce((sum: number, o: any) => sum + o.total_amount, 0);

            const platformFees = totalRevenue * 0.025;

            const realExpensesTotal = (realExpensesData || []).reduce((sum, e) => sum + Number(e.amount), 0);
            const totalExpenses = platformFees + realExpensesTotal;
            const netProfit = totalRevenue - totalExpenses - returns;

            const pendingPayments = orders
                .filter((o: any) => ['pending', 'processing', 'shipped'].includes(o.status))
                .reduce((sum: number, o: any) => sum + o.total_amount, 0);

            // Growth
            const lastMonth = subMonths(now, 1);
            const lastMonthRevenue = deliveredOrders
                .filter((o: any) => isSameMonth(new Date(o.created_at), lastMonth))
                .reduce((sum: number, o: any) => sum + o.total_amount, 1);

            const growth = monthlyRevenue > 0
                ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
                : 0;

            const totalSettled = (settlements || []).reduce((sum, tx) => sum + Number(tx.amount), 0);

            // Pending Fees Calculation
            const { data: supplierData } = await supabase.from('suppliers').select('pending_commission').eq('id', supplierId).single();
            const pendingFees = supplierData?.pending_commission || (platformFees - totalSettled);

            setStats({
                totalRevenue,
                monthlyRevenue,
                totalExpenses,
                netProfit,
                pendingPayments: pendingPayments, // Pending Revenue
                platformFees,
                returns,
                growth,
                totalSettled,
                pendingFees
            });

            // 3. Revenue Chart Data
            const chartData: RevenueData[] = [];
            for (let i = 5; i >= 0; i--) {
                const date = subMonths(now, i);
                const monthName = format(date, 'MMMM', { locale: ar });
                const monthOrders = deliveredOrders.filter((o: any) => isSameMonth(new Date(o.created_at), date));
                const amount = monthOrders.reduce((sum: number, o: any) => sum + o.total_amount, 0);

                chartData.push({
                    month: monthName,
                    amount,
                    orders: monthOrders.length
                });
            }
            setRevenueData(chartData);

            // 4. Expenses Breakdown
            const expenseCategories = (realExpensesData || []).reduce((acc: any, curr: any) => {
                acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
                return acc;
            }, {});

            const mappedExpenses: ExpenseData[] = [
                { category: 'رسوم المنصة', amount: platformFees, percentage: totalExpenses > 0 ? Math.round((platformFees / totalExpenses) * 100) : 0, color: 'bg-blue-500' },
                ...Object.entries(expenseCategories).map(([cat, amount]: any, index) => ({
                    category: cat,
                    amount: amount,
                    percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
                    color: ['bg-orange-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'][index % 4]
                }))
            ];
            setExpenses(mappedExpenses);

        } catch (error) {
            console.error('Error fetching finance data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinanceData();
    }, [user]);

    return {
        stats,
        revenueData,
        expenses,
        transactions,
        loading,
        refresh: fetchFinanceData
    };
};
