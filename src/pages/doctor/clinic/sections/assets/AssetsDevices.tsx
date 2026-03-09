import React, { useState } from 'react';
import { Card } from '../../../../../components/common/Card';
import { Button } from '../../../../../components/common/Button';
import { Monitor, Plus, Calendar, AlertCircle, Edit2, Trash2, Box } from 'lucide-react';
import { formatCurrency, formatDate } from '../../../../../lib/utils';
import { useAssets, Asset } from '../../../../../hooks/useAssets';

interface AssetsDevicesProps {
    clinicId?: string;
}

export const AssetsDevices: React.FC<AssetsDevicesProps> = ({ clinicId }) => {
    const { assets, loading, addAsset, deleteAsset } = useAssets(clinicId);

    // Filter for devices specifically (or show all fixed assets?)
    // User asked for "Fixed Assets (Devices / Furniture)"
    // So we show equipment, furniture, electronics, etc.
    const deviceAssets = assets.filter(a => ['equipment', 'furniture', 'electronics', 'other'].includes(a.category));

    const [showModal, setShowModal] = useState(false);
    const [newAsset, setNewAsset] = useState<Partial<Asset>>({
        name: '',
        category: 'equipment',
        status: 'active',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseCost: 0,
        usefulLifeYears: 5,
        salvageValue: 0
    });

    const handleSave = async () => {
        if (!newAsset.name || !newAsset.purchaseCost) return;

        try {
            await addAsset({
                clinicId: clinicId || '0',
                name: newAsset.name,
                category: newAsset.category as any,
                purchaseDate: newAsset.purchaseDate || new Date().toISOString(),
                purchaseCost: Number(newAsset.purchaseCost),
                currency: 'IQD',
                usefulLifeYears: Number(newAsset.usefulLifeYears) || 5,
                salvageValue: Number(newAsset.salvageValue) || 0,
                status: newAsset.status as any || 'active',
                description: newAsset.description || '',
                location: newAsset.location || '',
                serialNumber: newAsset.serialNumber || '',
                supplier: newAsset.supplier || '',
                warrantyExpiry: newAsset.warrantyExpiry || ''
            });
            setShowModal(false);
            setNewAsset({
                name: '',
                category: 'equipment',
                status: 'active',
                purchaseDate: new Date().toISOString().split('T')[0],
                purchaseCost: 0
            });
        } catch (e) {
            console.error(e);
            alert('حدث خطأ أثناء الحفظ');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الأصل؟')) {
            await deleteAsset(id);
        }
    };

    if (loading) return <div>جاري التحميل...</div>;

    return (
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">الأصول الثابتة (أجهزة / أثاث)</h3>
                    <Button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="w-4 h-4 ml-2" />
                        إضافة أصل جديد
                    </Button>
                </div>

                {deviceAssets.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <Box className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">لا توجد أصول مسجلة</p>
                        <p className="text-xs text-gray-400 mt-1">يمكنك إضافة أجهزة، أثاث، ومعدات من هنا أو من قسم المالية</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {deviceAssets.map(asset => (
                            <div key={asset.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button onClick={() => handleDelete(asset.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-lg ${asset.category === 'equipment' ? 'bg-blue-50 text-blue-600' :
                                            asset.category === 'furniture' ? 'bg-amber-50 text-amber-600' :
                                                'bg-purple-50 text-purple-600'
                                        }`}>
                                        {asset.category === 'furniture' ? <Box className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs ${asset.status === 'active' ? 'bg-green-100 text-green-700' :
                                        asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {asset.status === 'active' ? 'يعمل' :
                                            asset.status === 'maintenance' ? 'صيانة' : 'خارج الخدمة'}
                                    </span>
                                </div>

                                <h4 className="font-bold text-gray-900 mb-1">{asset.name}</h4>
                                <p className="text-sm text-gray-500 mb-4">{formatCurrency(asset.purchaseCost)}</p>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        <span>شراء: {formatDate(asset.purchaseDate)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>القيمة الحالية: {formatCurrency(asset.currentValue || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Add Asset Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">إضافة أصل جديد</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">اسم الأصل</label>
                                    <input
                                        type="text"
                                        className="w-full border rounded-lg p-2"
                                        value={newAsset.name}
                                        onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                                        placeholder="مثال: كرسي أسنان، لابتوب..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">الفئة</label>
                                        <select
                                            className="w-full border rounded-lg p-2"
                                            value={newAsset.category}
                                            onChange={e => setNewAsset({ ...newAsset, category: e.target.value as any })}
                                        >
                                            <option value="equipment">أجهزة ومعدات</option>
                                            <option value="furniture">أثاث</option>
                                            <option value="electronics">إلكترونيات</option>
                                            <option value="other">أخرى</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">السعر (د.ع)</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2"
                                            value={newAsset.purchaseCost}
                                            onChange={e => setNewAsset({ ...newAsset, purchaseCost: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">تاريخ الشراء</label>
                                        <input
                                            type="date"
                                            className="w-full border rounded-lg p-2"
                                            value={newAsset.purchaseDate}
                                            onChange={e => setNewAsset({ ...newAsset, purchaseDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">العمر الافتراضي (سنوات)</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2"
                                            value={newAsset.usefulLifeYears}
                                            onChange={e => setNewAsset({ ...newAsset, usefulLifeYears: Number(e.target.value) })}
                                        />
                                    </div>
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
