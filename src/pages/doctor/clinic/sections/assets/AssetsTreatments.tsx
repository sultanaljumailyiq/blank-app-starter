import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../../../../components/common/Card';
import { Button } from '../../../../../components/common/Button';
import { Settings, Activity, Plus, Edit2, Lock, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../../../../lib/utils';
import { useTreatments } from '../../../../../hooks/useTreatments';
import { useAuth } from '../../../../../contexts/AuthContext';

export const AssetsTreatments: React.FC = () => {
    const { user } = useAuth();
    const { clinicId } = useParams<{ clinicId: string }>();

    // Use real hook with clinic ID from URL params
    const { treatments, loading, addTreatment, updateTreatment, deleteTreatment } = useTreatments(clinicId);

    // Force re-render (less needed with real hook state but kept for safety if needed)
    const [lastUpdate, setLastUpdate] = useState(Date.now());

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [newService, setNewService] = useState<{
        id?: string;
        name: string;
        category: string;
        basePrice: number;
        costEstimate: number;
        profitMargin: number;
        popularity: number;
        totalRevenue: number;
        expectedSessions: number;
        isActive: boolean;
        isComplex: boolean;
        scope: 'tooth' | 'general' | 'both';
    }>({
        name: '',
        category: 'عام',
        basePrice: 0,
        costEstimate: 0,
        profitMargin: 0,
        popularity: 50,
        totalRevenue: 0,
        expectedSessions: 1,
        isActive: true,
        isComplex: false,
        scope: 'general' as 'general' | 'tooth' | 'both'
    });

    const handleEdit = (treatment: any) => {
        setNewService({
            id: treatment.id,
            name: treatment.name,
            category: treatment.category,
            basePrice: treatment.basePrice,
            costEstimate: treatment.costEstimate,
            profitMargin: treatment.profitMargin,
            popularity: treatment.popularity,
            totalRevenue: treatment.totalRevenue,
            expectedSessions: treatment.expectedSessions,
            isActive: treatment.isActive,
            isComplex: treatment.isComplex || false,
            scope: treatment.scope || 'general'
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!newService.name || newService.basePrice <= 0) return;

        // Calculate profit margin automatically
        const margin = newService.basePrice > 0
            ? Math.round(((newService.basePrice - newService.costEstimate) / newService.basePrice) * 100)
            : 0;

        if (newService.id) {
            // Update existing
            await updateTreatment(newService.id, {
                ...newService,
                profitMargin: margin
            });
        } else {
            // Create new
            await addTreatment({
                name: newService.name,
                category: newService.category,
                basePrice: newService.basePrice,
                costEstimate: newService.costEstimate,
                profitMargin: margin,
                expectedSessions: newService.expectedSessions,
                isActive: newService.isActive,
                isComplex: newService.isComplex || false, // Can set default phases if needed
                scope: newService.scope
            });
        }

        setShowModal(false);
        setLastUpdate(Date.now());

        // Reset
        setNewService({
            name: '',
            category: 'عام',
            basePrice: 0,
            costEstimate: 0,
            profitMargin: 0,
            popularity: 50,
            totalRevenue: 0,
            expectedSessions: 1,
            isActive: true,
            isComplex: false,
            scope: 'general'
        });
    };

    return (
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900">لائحة العلاجات والخدمات</h3>
                    <Button onClick={() => {
                        setNewService({
                            name: '',
                            category: 'عام',
                            basePrice: 0,
                            costEstimate: 0,
                            profitMargin: 0,
                            popularity: 50,
                            totalRevenue: 0,
                            expectedSessions: 1,
                            isActive: true,
                            isComplex: false,
                            scope: 'general'
                        });
                        setShowModal(true);
                    }} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="w-5 h-5 ml-2" />
                        إضافة علاج جديد
                    </Button>
                </div>

                {loading ? (
                    <div className="text-center py-8">جاري التحميل...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-right border-b border-gray-100">
                                    <th className="pb-4 font-medium text-gray-500">اسم الخدمة</th>
                                    <th className="pb-4 font-medium text-gray-500">التصنيف</th>
                                    <th className="pb-4 font-medium text-gray-500">السعر</th>
                                    <th className="pb-4 font-medium text-gray-500">التكلفة التقديرية</th>
                                    <th className="pb-4 font-medium">هامش الربح</th>
                                    <th className="pb-4 font-medium">الشعبية</th>
                                    <th className="pb-4 font-medium">النوع</th>
                                    <th className="pb-4 font-medium">نطاق العلاج</th>
                                    <th className="pb-4 font-medium">الحالة</th>
                                    <th className="pb-4 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {treatments.map(t => (
                                    <tr key={t.id} className="group hover:bg-gray-50/50">
                                        <td className="py-4 font-medium text-gray-900">{t.name}</td>
                                        <td className="py-4 text-sm text-gray-500">{t.category}</td>
                                        <td className="py-4 font-medium">{formatCurrency(t.basePrice)}</td>
                                        <td className="py-4 text-sm text-gray-500">{formatCurrency(t.costEstimate)}</td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold ${t.profitMargin > 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                                                    {t.profitMargin}%
                                                </span>
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${t.profitMargin > 70 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${t.profitMargin}%` }}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                                <Activity className="w-4 h-4 text-blue-500" />
                                                {t.popularity}/100
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.isComplex ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
                                                {t.isComplex ? 'معقد (جلسات)' : 'بسيط (جلسة)'}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${t.scope === 'tooth' ? 'bg-indigo-50 text-indigo-700' :
                                                t.scope === 'both' ? 'bg-purple-50 text-purple-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                {t.scope === 'tooth' ? 'سن محدد' : t.scope === 'both' ? 'عام + سن' : 'عام'}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div
                                                onClick={async () => {
                                                    try {
                                                        await updateTreatment(t.id, { isActive: !t.isActive });
                                                    } catch (error) {
                                                        console.error("Failed to toggle active status", error);
                                                    }
                                                }}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${t.isActive ? 'bg-emerald-500' : 'bg-gray-200'}`}
                                            >
                                                <span
                                                    className={`${t.isActive ? 'translate-x-1' : 'translate-x-6'
                                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                                />
                                            </div>
                                        </td>
                                        <td className="py-4 text-left">
                                            <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(t)} title="تعديل">
                                                    <Edit2 className="w-4 h-4 text-gray-500" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => {
                                                    if (window.confirm('هل أنت متأكد من حذف هذا العلاج؟')) {
                                                        deleteTreatment(t.id);
                                                    }
                                                }} className="text-red-500 hover:text-red-700 hover:bg-red-50" title="حذف">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add/Edit Service Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h3 className="text-xl font-bold mb-4">
                                {newService.id ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">اسم الخدمة</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className={`w-full border rounded-lg p-2 ${newService.id && newService.isComplex ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                            value={newService.name}
                                            onChange={e => setNewService({ ...newService, name: e.target.value })}
                                            disabled={!!(newService.id && newService.isComplex)}
                                        />
                                        {newService.id && newService.isComplex && <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />}
                                    </div>
                                    {newService.id && newService.isComplex && <p className="text-xs text-amber-600 mt-1">لا يمكن تعديل اسم العلاج المعقد (نظامي)</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">السعر الأساسي</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2"
                                            value={newService.basePrice}
                                            onChange={e => setNewService({ ...newService, basePrice: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">التكلفة التقديرية</label>
                                        <input
                                            type="number"
                                            className="w-full border rounded-lg p-2"
                                            value={newService.costEstimate}
                                            onChange={e => setNewService({ ...newService, costEstimate: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">التصنيف</label>
                                    <select
                                        className={`w-full border rounded-lg p-2 ${newService.id && newService.isComplex ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                                        value={newService.category}
                                        onChange={e => setNewService({ ...newService, category: e.target.value })}
                                        disabled={!!(newService.id && newService.isComplex)}
                                    >
                                        <option value="عام">عام</option>
                                        <option value="وقائي">وقائي</option>
                                        <option value="ترميمي">ترميمي</option>
                                        <option value="علاج جذور">علاج جذور</option>
                                        <option value="جراحة">جراحة</option>
                                        <option value="تعويضات">تعويضات</option>
                                        <option value="تجميل">تجميل</option>
                                    </select>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium mb-2">نطاق العلاج</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 flex-1">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 rounded"
                                                checked={newService.scope === 'general' || newService.scope === 'both'}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    const isTooth = newService.scope === 'tooth' || newService.scope === 'both';

                                                    let newScope: 'general' | 'tooth' | 'both' = 'general';
                                                    if (isChecked && isTooth) newScope = 'both';
                                                    else if (isChecked) newScope = 'general';
                                                    else if (isTooth) newScope = 'tooth';
                                                    else newScope = 'general'; // Prevent unchecking both, default to general or handle as validation error? For now default to general if trying to uncheck last one.

                                                    setNewService({ ...newService, scope: newScope });
                                                }}
                                            />
                                            <span className="text-sm">عام (General)</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-gray-50 flex-1">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 rounded"
                                                checked={newService.scope === 'tooth' || newService.scope === 'both'}
                                                onChange={(e) => {
                                                    const isChecked = e.target.checked;
                                                    const isGeneral = newService.scope === 'general' || newService.scope === 'both';

                                                    let newScope: 'general' | 'tooth' | 'both' = 'tooth';
                                                    if (isChecked && isGeneral) newScope = 'both';
                                                    else if (isChecked) newScope = 'tooth';
                                                    else if (isGeneral) newScope = 'general';
                                                    else newScope = 'tooth'; // Prevent unchecking both

                                                    setNewService({ ...newService, scope: newScope });
                                                }}
                                            />
                                            <span className="text-sm">سن محدد (Tooth Specific)</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-6 justify-end">
                                    <Button variant="ghost" onClick={() => setShowModal(false)}>إلغاء</Button>
                                    <Button onClick={handleSave} className="bg-blue-600 text-white">حفظ التغييرات</Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

// Modal states

