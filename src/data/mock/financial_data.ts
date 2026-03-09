import { Transaction, Invoice } from '../../types/financial_types';

export const mockTransactions: Transaction[] = [
    { id: 't1', date: '2024-12-01', amount: 150000, type: 'income', category: 'treatment', description: 'Payment for Endo Session 1 - Ali Hassan', status: 'completed' },
    { id: 't2', date: '2024-12-02', amount: 50000, type: 'expense', category: 'inventory', description: 'Restocking Anesthetic Cartridges', status: 'completed' },
    { id: 't3', date: '2024-12-03', amount: 200000, type: 'income', category: 'treatment', description: 'Payment for Crown Prep - Sarah Ahmed', status: 'completed' },
    { id: 't4', date: '2024-12-05', amount: 1000000, type: 'expense', category: 'rent', description: 'December Clinic Rent', status: 'completed' },
    { id: 't5', date: '2024-12-06', amount: 75000, type: 'income', category: 'treatment', description: 'Consultation Fee - New Patient', status: 'completed' },
    { id: 't6', date: '2024-12-07', amount: 120000, type: 'expense', category: 'lab', description: 'Ceramic Crown Lab Fee', status: 'pending' },
    { id: 't7', date: '2024-12-08', amount: 300000, type: 'income', category: 'treatment', description: 'Implant Placement Deposit', status: 'completed' },
];

export const mockInvoices: Invoice[] = [
    {
        id: 'inv-001',
        patientId: 'p-1',
        patientName: 'Ali Hassan',
        doctorId: 'd-1',
        items: [
            { description: 'Root Canal Treatment - Molar', cost: 350000 },
            { description: 'Core Build-up', cost: 100000 }
        ],
        totalAmount: 450000,
        paidAmount: 150000,
        status: 'partially_paid',
        dueDate: '2024-12-15',
        createdAt: '2024-12-01'
    },
    {
        id: 'inv-002',
        patientId: 'p-2',
        patientName: 'Sarah Ahmed',
        doctorId: 'd-1',
        items: [
            { description: 'Zirconia Crown', cost: 250000 }
        ],
        totalAmount: 250000,
        paidAmount: 250000,
        status: 'paid',
        dueDate: '2024-12-03',
        createdAt: '2024-12-03'
    },
    {
        id: 'inv-003',
        patientId: 'p-3',
        patientName: 'Mohammed K.',
        doctorId: 'd-1',
        items: [
            { description: 'Dental Implant (Fixture Only)', cost: 800000 }
        ],
        totalAmount: 800000,
        paidAmount: 300000,
        status: 'partially_paid',
        dueDate: '2025-01-08',
        createdAt: '2024-12-08'
    },
    {
        id: 'inv-004',
        patientId: 'p-4',
        patientName: 'Layla M.',
        doctorId: 'd-1',
        items: [
            { description: 'Orthodontic Adjustment', cost: 50000 }
        ],
        totalAmount: 50000,
        paidAmount: 0,
        status: 'pending',
        dueDate: '2024-12-10',
        createdAt: '2024-12-08'
    }
];
