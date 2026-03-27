import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { isSameMonth, subMonths, format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useSupplierOrders } from './useSupplierOrders';

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
    const { orders: coreOrders, loading: ordersLoading } = useSupplierOrders();
    
    const [supplierId, setSupplierId] = useState<string | null>(null);
    const [commissionRate, setCommissionRate] = useState(2.5);
    const [dbPendingCommission, setDbPendingCommission] = useState(0);

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
    const [settlements, setSettlements] = useState<any[]>([]);
    const [realExpensesData, setRealExpensesData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch Supplier Settings (Commission rate)
    useEffect(() => {
        const fetchSupplierDetails = async () => {
            if (!user) return;
            try {
                if (user?.email === 'supplier.demo@smartdental.com') {
                    setSupplierId('c83cf236-1175-4181-8222-d60ca2f9327d');
                    return;
                }

                const { data: supplier } = await supabase
                    .from('suppliers')
                    .select('id, commission_percentage, pending_commission')
                    .or(`user_id.eq.${user.id},profile_id.eq.${user.id}`)
                    .maybeSingle();

                if (supplier) {
                    setSupplierId(supplier.id);
                    setCommissionRate(Number(supplier.commission_percentage) || 2.5);
                    setDbPendingCommission(Number(supplier.pending_commission) || 0);
                } else {
                    const { data: directMatch } = await supabase
                        .from('suppliers')
                        .select('id, commission_percentage, pending_commission')
                        .eq('id', user.id)
                        .maybeSingle();
                    
                    if (directMatch) {
                        setSupplierId(directMatch.id);
                        setCommissionRate(Number(directMatch.commission_percentage) || 2.5);
                        setDbPendingCommission(Number(directMatch.pending_commission) || 0);
                    } else {
                        setSupplierId(user.id);
                    }
                }
            } catch (err) {
                console.error('Error fetching supplier details:', err);
                setSupplierId(user.id);
            }
        };

        fetchSupplierDetails();
    }, [user]);

    // 2. Fetch Settlements & Expenses
    useEffect(() => {
        const fetchFinanceTables = async () => {
            const targetId = supplierId || user?.id;
            if (!targetId) return;

            try {
                const { data: settlementData } = await supabase
                    .from('financial_transactions')
                    .select('*')
                    .eq('supplier_id', targetId)
                    .eq('category', 'commission_clearance')
                    .order('transaction_date', { ascending: false });

                setSettlements(settlementData || []);

                const { data: expensesData } = await supabase
                    .from('supplier_expenses')
                    .select('*')
                    .eq('supplier_id', targetId);
                
                setRealExpensesData(expensesData || []);

            } catch (err) {
                console.error('Error fetching settlements/expenses:', err);
            }
        };

        if (supplierId || user?.id) {
            fetchFinanceTables();
        }
    }, [supplierId, user]);

    // 3. Process calculations when coreOrders or settlements load
    useEffect(() => {
        if (ordersLoading) return;

        // A. Process Order Transactions
        const realTransactions: Transaction[] = coreOrders.map((order) => {
            let type: Transaction['type'] = 'إيراد';
            let amount = order.totalAmount;
            let status: Transaction['status'] = 'معلق';

            if (['delivered', 'تم التسليم', 'مكتمل'].includes(order.status)) {
                status = 'مكتمل';
            } else if (['cancelled', 'ملغية', 'ملغى'].includes(order.status)) {
                amount = 0;
                status = 'مكتمل';
            } else if (['returned', 'مرتجعة', 'مرتجع'].includes(order.status)) {
                type = 'مرجعات';
                amount = -order.totalAmount;
                status = 'مُعاد';
            }

            return {
                id: order.id,
                type,
                description: `طلب #${order.id.slice(0, 8)}`,
                amount,
                date: order.createdAt,
                status,
                customer: order.customer?.name || 'عميل'
            };
        });

        // B. Fee Transactions (Virtual)
        const feeTransactions: Transaction[] = coreOrders
            .filter(o => ['delivered', 'تم التسليم', 'مكتمل'].includes(o.status))
            .map(o => {
                const isSettled = settlements.some(s => s.description?.includes(o.id.slice(0, 8)));
                return {
                    id: `fee-${o.id}`,
                    type: 'رسوم',
                    description: `رسوم المنصة - طلب #${o.id.slice(0, 8)}`,
                    amount: -(o.totalAmount * commissionRate / 100),
                    date: o.createdAt,
                    status: isSettled ? 'مكتمل' : 'معلق', // 'مكتمل' maps to completed, 'معلق' for pending yellow
                    customer: o.customer?.name || 'عميل'
                };
            });

        // C. Settlement Transactions
        const settlementTransactions: Transaction[] = settlements.map((tx: any) => ({
            id: tx.id,
            type: 'تسوية',
            description: tx.description || 'تسوية عمولة المنصة',
            amount: -Number(tx.amount),
            date: tx.transaction_date,
            status: 'مكتمل',
            customer: 'المنصة'
        }));

        const allTransactions = [...realTransactions, ...feeTransactions, ...settlementTransactions].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setTransactions(allTransactions);

        // Calculate Stats
        const deliveredOrders = coreOrders.filter(o => ['delivered', 'تم التسليم', 'مكتمل'].includes(o.status));
        const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0);

        const now = new Date();
        const monthlyRevenue = deliveredOrders
            .filter(o => isSameMonth(new Date(o.createdAt), now))
            .reduce((sum, o) => sum + o.totalAmount, 0);

        const returns = coreOrders
            .filter(o => ['returned', 'مرتجعة', 'مرتجع'].includes(o.status))
            .reduce((sum, o) => sum + o.totalAmount, 0);

        const platformFees = (totalRevenue * commissionRate) / 100;
        const realExpensesTotal = realExpensesData.reduce((sum, e) => sum + Number(e.amount), 0);
        const totalExpenses = platformFees + realExpensesTotal;

        const pendingPayments = coreOrders
            .filter(o => ['pending', 'processing', 'shipped', 'معلقة', 'قيد التجهيز', 'جاري التجهيز', 'تم الشحن'].includes(o.status))
            .reduce((sum, o) => sum + o.totalAmount, 0);

        const lastMonth = subMonths(now, 1);
        const lastMonthRevenue = deliveredOrders
            .filter(o => isSameMonth(new Date(o.createdAt), lastMonth))
            .reduce((sum, o) => sum + o.totalAmount, 1);

        const growth = monthlyRevenue > 0
            ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : 0;

        const totalSettled = settlements.reduce((sum, tx) => sum + Number(tx.amount), 0);
        const pendingFees = dbPendingCommission > 0 ? dbPendingCommission : (platformFees - totalSettled);

        setStats({
            totalRevenue,
            monthlyRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses - returns,
            pendingPayments,
            platformFees,
            returns,
            growth,
            totalSettled,
            pendingFees
        });

        // Revenue Chart Data
        const chartData: RevenueData[] = [];
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(now, i);
            const monthStr = format(date, 'MMM', { locale: ar });
            
            const monthOrders = deliveredOrders.filter(o => isSameMonth(new Date(o.createdAt), date));
            const amount = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

            chartData.push({
                month: monthStr,
                amount,
                orders: monthOrders.length
            });
        }
        setRevenueData(chartData);

        // Expenses Categories
        const categoryMap: Record<string, number> = {};
        realExpensesData.forEach(e => {
            const cat = e.category || 'أخرى';
            categoryMap[cat] = (categoryMap[cat] || 0) + Number(e.amount);
        });

        const categoryColors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'];
        const expenseItems: ExpenseData[] = Object.entries(categoryMap).map(([category, amount], index) => ({
            category,
            amount,
            percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
            color: categoryColors[index % categoryColors.length]
        }));

        if (platformFees > 0) {
            expenseItems.push({
                category: 'رسوم المنصة',
                amount: platformFees,
                percentage: totalExpenses > 0 ? Math.round((platformFees / totalExpenses) * 100) : 0,
                color: '#EC4899'
            });
        }

        setExpenses(expenseItems);
        setLoading(false);

    }, [coreOrders, settlements, realExpensesData, ordersLoading, commissionRate]);

    return {
        stats,
        revenueData,
        expenses,
        transactions,
        loading: ordersLoading || loading
    };
};
