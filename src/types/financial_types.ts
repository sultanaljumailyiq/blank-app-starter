export interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: 'income' | 'expense';
    category: 'treatment' | 'salary' | 'inventory' | 'lab' | 'rent' | 'other';
    description: string;
    referenceId?: string; // Links to InvoiceID, StaffID, or InventoryID
    status: 'completed' | 'pending' | 'cancelled';
}

export interface Invoice {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    items: {
        description: string;
        cost: number;
        relatedSessionId?: string;
    }[];
    totalAmount: number;
    paidAmount: number;
    status: 'paid' | 'pending' | 'partially_paid' | 'overdue';
    dueDate: string;
    createdAt: string;
}
