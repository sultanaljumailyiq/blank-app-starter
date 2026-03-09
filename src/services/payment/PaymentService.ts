import { supabase } from '../../lib/supabase';
import { Transaction } from '../../types';

export type PaymentMethod = 'zaincash' | 'mastercard' | 'visacard';

export interface PaymentRequest {
    amount: number;
    currency: 'IQD' | 'USD';
    method: PaymentMethod;
    description: string;
    metadata?: any;
}

export interface PaymentResponse {
    success: boolean;
    transactionId?: string;
    message: string;
    receiptUrl?: string; // For simulation
}

class PaymentService {
    private static DELAY_MS = 2000; // Simulate network delay

    /**
     * Initiate a payment transaction
     */
    static async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
        console.log(`Processing payment of ${request.amount} ${request.currency} via ${request.method}...`);

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, this.DELAY_MS));

        // Simulate Success/Failure (90% success rate for demo)
        const isSuccess = Math.random() > 0.1;

        if (!isSuccess) {
            return {
                success: false,
                message: 'فشلت عملية الدفع: رصيد غير كافٍ أو خطأ في الاتصال.'
            };
        }

        const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        // Log to Supabase (Real or Mock)
        try {
            await this.logTransaction(request, transactionId);
        } catch (err) {
            console.warn('Failed to log transaction to DB, but payment succeeded:', err);
        }

        return {
            success: true,
            transactionId,
            message: 'تمت عملية الدفع بنجاح!',
            receiptUrl: `https://smartdental.iq/receipts/${transactionId}`
        };
    }

    /**
     * Log successfully processed transaction to Supabase
     */
    private static async logTransaction(request: PaymentRequest, txnId: string) {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        // Insert into financial_transactions table
        // Note: We need to map this to the schema. 
        // Assuming 'financial_transactions' table exists and has compatible fields.
        const { error } = await supabase.from('financial_transactions').insert({
            amount: request.amount,
            type: 'expense', // From user perspective provided usually
            category: 'subscription', // Defaulting to subscription or extracting from metadata
            description: request.description,
            payment_method: request.method,
            transaction_date: new Date().toISOString(),
            status: 'completed',
            // metadata: { txnId, ...request.metadata } // if we had a metadata column
        });

        if (error) throw error;
    }
}

export const paymentService = PaymentService;
