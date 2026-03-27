import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../../../../components/common/Card';
import { Button } from '../../../../../components/common/Button';
import { Package, Plus, Search, Filter, Edit2, AlertCircle } from 'lucide-react';
import { useInventory } from '../../../../../hooks/useInventory';
import { useAuth } from '../../../../../contexts/AuthContext';
import { formatCurrency } from '../../../../../lib/utils';

export const AssetsInventory: React.FC = () => {
    const { user } = useAuth();
    const { clinicId } = useParams<{ clinicId: string }>();

    // Use the hook with clinic ID from URL params
    const { inventory, loading, addItem, updateItem } = useInventory(clinicId);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        category: 'مستهلكات',
        quantity: 0,
        unit: 'علبة',
        minStock: 10,
        unitPrice: 0
    });

    // Derived Expense State (Mock for now, should ideally useFinance hook if we want to sync expense)
    const [createExpense, setCreateExpense] = useState(false);

    const handleSave = async () => {
        if (!newItem.name || newItem.quantity < 0) return;

        // Add to Supabase
        await addItem({
            name: newItem.name,
            category: newItem.category,
            quantity: newItem.quantity,
            unit: newItem.unit,
            minStock: newItem.minStock,
            unitPrice: newItem.unitPrice,
            // Supplier/Location optional in UI for now
        });

        // If createExpense logic is needed, we should integrate useFinance hook here later.
        // For now, focusing on Inventory sync as requested.

        setShowModal(false);

        // Reset form
        setNewItem({
            name: '',
            category: 'مستهلكات',
            quantity: 0,
            unit: 'علبة',
            minStock: 10,
            unitPrice: 0
        });
        setCreateExpense(false);
    };

    const handleUpdateStock = async (id: string, currentQty: number, change: number) => {
        const newQty = Math.max(0, currentQty + change);
        await updateItem(id, { quantity: newQty });
    };

    return (
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">المخزون الحالي</h3>
                    <div className="flex gap-2">
                        <Button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Plus className="w-4 h-4 ml-2" />
                            إضافة مادة
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">جاري التحميل...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 text-right text-sm text-gray-500">
                                    <th className="pb-4 font-medium">اسم المادة</th>
                                    <th className="pb-4 font-medium">التصنيف</th>
                                    <th className="pb-4 font-medium">الكمية</th>
                                    <th className="pb-4 font-medium">الوحدة</th>
                                    <th className="pb-4 font-medium">سعر الشراء</th>
                                    <th className="pb-4 font-medium">الحالة</th>
                                    <th className="pb-4 font-medium">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {inventory.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="py-3 text-gray-900 font-medium">{item.name}</td>
                                        <td className="py-3 text-gray-500 text-sm">{item.category}</td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`font - bold ${item.quantity <= item.minStock ? 'text-red-600' : 'text-gray-900'} `}>
                                                    {item.quantity}
                                                </span>
                                                {/* Quick Stock Update Buttons */}
                                                <div className="flex gap-1 text-xs">
                                                    <button
                                                        onClick={() => handleUpdateStock(item.id, item.quantity, 1)}
                                                        className="px-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                                                    >+</button>
                                                    <button
                                                        onClick={() => handleUpdateStock(item.id, item.quantity, -1)}
                                                        className="px-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                                                    >-</button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 text-gray-500 text-sm">{item.unit}</td>
                                        <td className="py-3 text-gray-900">{formatCurrency(item.unitPrice)}</td>
                                        <td className="py-3">
                                            {item.quantity <= item.minStock ? (
                                                <span className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full w-fit">
                                                    <AlertCircle className="w-3 h-3" />
                                                    منخفض
                                                </span>
                                            ) : (
                                                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full w-fit">متوفر</span>
                                            )}
                                        </td>
                                        <td className="py-3">
                                            <Button variant="ghost" size="sm">
                                                <Edit2 className="w-4 h-4 text-gray-500" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {inventory.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-500">
                                            لا توجد مواد في المخزون
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add Item Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">إضافة مادة جديدة</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">اسم المادة</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2"
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">الكمية الأولية</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2"
                                            value={newItem.quantity}
                                            onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">سعر الشراء</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2"
                                            value={newItem.unitPrice}
                                            onChange={e => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">التصنيف</label>
                                    <select
                                        className="w-full border rounded-lg p-2"
                                        value={newItem.category}
                                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    >
                                        <option value="مستهلكات">مستهلكات</option>
                                        <option value="أدوات">أدوات</option>
                                        <option value="مواد حشوات">مواد حشوات</option>
                                        <option value="تخدير">تخدير</option>
                                    </select>
                                </div>

                                <div className="flex gap-2 mt-6 justify-end">
                                    <Button variant="ghost" onClick={() => setShowModal(false)}>إلغاء</Button>
                                    <Button onClick={handleSave} className="bg-blue-600 text-white">حفظ</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

