import React, { useState } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, Link, Package, Briefcase } from 'lucide-react';
import { Button } from '../common/Button';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    type?: 'income' | 'expense';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    type = 'expense'
}) => {
    const [formData, setFormData] = useState({
        type: type,
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        linkedItem: '' // For Inventory/Asset linking
    });

    if (!isOpen) return null;

    const expenseCategories = [
        { id: 'salaries', label: 'رواتب وأجور' },
        { id: 'maintenance', label: 'صيانة وإصلاحات' },
        { id: 'lab_fees', label: 'رسوم المختبر' },
        { id: 'inventory', label: 'مخزون ومواد' },
        { id: 'assets', label: 'أصول ومعدات' },
        { id: 'rent', label: 'إيجار' },
        { id: 'utilities', label: 'كهرباء وماء' },
        { id: 'marketing', label: 'تسويق وإعلان' },
        { id: 'other', label: 'مصروفات أخرى' }
    ];

    const incomeCategories = [
        { id: 'consultation', label: 'كشف واستشارة' },
        { id: 'treatment', label: 'علاجات' },
        { id: 'xray', label: 'أشعة' },
        { id: 'other', label: 'إيرادات أخرى' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const showLinkingField = formData.category === 'inventory' || formData.category === 'assets';
    const linkLabel = formData.category === 'inventory' ? 'رابط عنصر المخزون' : 'رابط الأصل';
    const LinkIcon = formData.category === 'inventory' ? Package : Briefcase;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">
                        {formData.type === 'income' ? 'تسجيل إيراد جديد' : 'تسجيل مصروف جديد'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
                        <div className="relative">
                            <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="number"
                                required
                                className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Фئة المعاملة</label>
                        <div className="relative">
                            <Tag className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                required
                            >
                                <option value="">اختر الفئة</option>
                                {(formData.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Dynamic Linking Field */}
                    {showLinkingField && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-medium text-blue-800 mb-1 flex items-center gap-2">
                                <LinkIcon className="w-4 h-4" />
                                {linkLabel}
                            </label>
                            <div className="relative">
                                <Link className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4" />
                                <input
                                    type="text"
                                    className="w-full pr-10 pl-4 py-2 border border-blue-200 bg-blue-50 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder-blue-300"
                                    placeholder={`بحث في ${formData.category === 'inventory' ? 'المخزون' : 'الأصول'}...`}
                                    value={formData.linkedItem}
                                    onChange={e => setFormData({ ...formData, linkedItem: e.target.value })}
                                />
                            </div>
                            <p className="text-xs text-blue-600 mt-1">سيتم ربط هذا المصروف تلقائياً بسجل {formData.category === 'inventory' ? 'المخزون' : 'الأصول'} المختار.</p>
                        </div>
                    )}

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                        <div className="relative">
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="date"
                                required
                                className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف / ملاحظات</label>
                        <div className="relative">
                            <FileText className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                            <textarea
                                className="w-full pr-10 pl-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                rows={3}
                                placeholder="تفاصيل إضافية..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-50">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            إلغاء
                        </Button>
                        <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            حفظ المعاملة
                        </Button>
                    </div>

                </form>
            </div>
        </div>
    );
};
