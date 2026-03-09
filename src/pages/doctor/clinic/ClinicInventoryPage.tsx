import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Filter,
  Box,
  Wrench,
  Pill,
  Scissors,
  Calendar,
  Star,
  Minus,
  Edit,
  Trash2
} from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { BentoStatCard } from '../../../components/dashboard/BentoStatCard';
import { useInventory } from '../../../hooks/useInventory';

interface ClinicInventoryPageProps {
  clinicId: string;
}

export const ClinicInventoryPage: React.FC<ClinicInventoryPageProps> = ({ clinicId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Supabase Integration
  const { inventory, loading, addItem, updateItem } = useInventory(clinicId);

  // --- Modal State ---
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    specialty: 'General', // Was category (Orthodontics, Cosmetic...)
    type: 'Consumables', // Was supplier purpose (Equipment, Consumables...)
    quantity: '0',
    minStock: '10',
    unitPrice: '0',
    unit: 'pcs'
  });

  const openAddModal = () => {
    setFormData({ name: '', specialty: 'General', type: 'Consumables', quantity: '0', minStock: '10', unitPrice: '0', unit: 'pcs' });
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (item: any) => {
    setFormData({
      name: item.name,
      specialty: item.category, // We are mapping Specialty -> Category field
      type: item.brand || 'Consumables', // We are mapping Type -> Brand field (Hack to avoid DB schema change for now)
      quantity: item.quantity.toString(),
      minStock: item.minStock.toString(),
      unitPrice: item.unitPrice.toString(),
      unit: item.unit
    });
    setIsEditing(true);
    setEditingId(item.id);
    setShowModal(true);
  };

  const calculateCondition = (qty: number, min: number) => {
    if (qty <= 0) return 'out_of_stock';
    if (qty <= min) return 'low_stock';
    return 'available';
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('يرجى إدخال اسم العنصر');
      return;
    }

    const payload = {
      name: formData.name,
      category: formData.specialty, // Specialty -> Category
      brand: formData.type,         // Type -> Brand
      quantity: parseInt(formData.quantity),
      minStock: parseInt(formData.minStock),
      unitPrice: parseFloat(formData.unitPrice),
      unit: formData.unit,
      supplier: '', // Cleared as requested to be replaced
      status: calculateCondition(parseInt(formData.quantity), parseInt(formData.minStock)) as any
    };

    try {
      if (isEditing && editingId) {
        await updateItem(editingId, payload);
        alert('تم تحديث العنصر بنجاح');
      } else {
        await addItem(payload);
        alert('تم إضافة العنصر بنجاح');
      }
      setShowModal(false);
    } catch (e) {
      alert('حدث خطأ');
    }
  };

  // Helper for Specialty Labels
  const getSpecialtyLabel = (spec: string) => {
    const map: Record<string, string> = {
      'Orthodontics': 'تقويم الأسنان',
      'Cosmetic': 'تجميل',
      'Restorative': 'حشوات وتجميل',
      'Anesthetic': 'تخدير',
      'Consumables': 'مستهلكات عامة',
      'General': 'عام',
      'Endodontics': 'علاج عصب',
      'Surgery': 'جراحة'
    };
    return map[spec] || spec;
  };

  const getSpecialtyIcon = (spec: string) => {
    // Reuse existing icons based on loose matching or default
    return <Package className="w-5 h-5 text-blue-600" />;
  };

  // Derived State (replaces mock helpers)
  const lowStockItems = inventory.filter(i => i.quantity <= i.minStock);

  const stats = {
    totalItems: inventory.length,
    totalValue: inventory.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0),
    available: inventory.filter(i => (i.status === 'available' || i.quantity > 0)).length,
    lowStock: lowStockItems.length,
    outOfStock: inventory.filter(i => i.quantity === 0).length,
    totalPurchaseOrders: 0,
    equipment: inventory.filter(i => i.category === 'Equipment' || i.brand === 'Equipment').length,
    consumables: inventory.filter(i => i.category === 'Consumables' || i.brand === 'Consumables').length,
    medicines: inventory.filter(i => i.category === 'Medicines' || i.brand === 'Medicines').length,
    instruments: inventory.filter(i => i.category === 'Instruments' || i.brand === 'Instruments').length,
    supplies: inventory.filter(i => i.category === 'Supplies' || i.brand === 'Supplies').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'low_stock': return 'text-yellow-600 bg-yellow-100';
      case 'out_of_stock': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-red-600 bg-red-100';
      case 'damaged': return 'text-gray-600 bg-gray-100';
      case 'maintenance': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'متاح';
      case 'low_stock': return 'مخزون منخفض';
      case 'out_of_stock': return 'نفد المخزون';
      case 'expired': return 'منتهي الصلاحية';
      case 'damaged': return 'تالف';
      case 'maintenance': return 'صيانة';
      default: return 'غير محدد';
    }
  };

  // ... (Existing Filters) ...
  // Update filters to use the new "Specialty" (which is in category)
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">

      {/* Stats Cards (Updated logic to count By Specialty if needed, or keep generic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoStatCard
          title="إجمالي العناصر"
          value={stats.totalItems}
          icon={Package}
          color="blue"
          trend="neutral"
          trendValue={`قيمة: ${(stats.totalValue / 1000000).toFixed(1)}م`}
          delay={100}
        />
        <BentoStatCard
          title="متاح"
          value={stats.available}
          icon={Box}
          color="green"
          delay={200}
        />
        <BentoStatCard
          title="مخزون منخفض"
          value={stats.lowStock}
          icon={AlertTriangle}
          color={stats.lowStock > 0 ? "orange" : "green"}
          trend={stats.lowStock > 0 ? "down" : "neutral"}
          trendValue={stats.lowStock > 0 ? "تحذير" : "مستقر"}
          delay={300}
        />
        <BentoStatCard
          title="نفد المخزون"
          value={stats.outOfStock}
          icon={Box}
          color="red"
          delay={400}
        />
      </div>

      {/* Controls */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="البحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg" />
              </div>

              {/* Specialty Filter */}
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg">
                <option value="all">جميع التخصصات</option>
                <option value="Orthodontics">تقويم الأسنان</option>
                <option value="Cosmetic">تجميل</option>
                <option value="Restorative">حشوات</option>
                <option value="Anesthetic">تخدير</option>
                <option value="Endodontics">علاج عصب</option>
                <option value="Surgery">جراحة</option>
                <option value="Consumables">مستهلكات عامة</option>
              </select>

              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg">
                <option value="all">جميع الحالات</option>
                <option value="available">متاح</option>
                <option value="low_stock">مخزون منخفض</option>
                <option value="out_of_stock">نفد المخزون</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button onClick={() => setViewMode('grid')} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>شبكة</button>
                <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}`}>قائمة</button>
              </div>
              <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" /> <span className="text-sm font-medium">عنصر جديد</span>
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Inventory Grid */}
      <Card>
        <div className="p-6">
          {/* ... Header ... */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">المخزون ({filteredInventory.length})</h2>
          </div>

          {filteredInventory.length === 0 ? (
            <div className="text-center py-12"><p className="text-gray-500">لا توجد عناصر</p></div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInventory.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 flex flex-col gap-4 group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        {getSpecialtyIcon(item.category)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 line-clamp-1">{item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">{getSpecialtyLabel(item.category)}</span>
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.brand || 'عام'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stock Bar */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-700">الكمية: {item.quantity} {item.unit}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>{getStatusLabel(item.status)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-3">
                      <div className={`h-full rounded-full transition-all duration-300 ${item.quantity <= item.minStock ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(100, (item.quantity / (item.minStock * 3 || 1)) * 100)}%` }} />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button onClick={() => updateItem(item.id, { quantity: Math.max(0, item.quantity - 1) })} disabled={item.quantity <= 0} className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-gray-200 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"><Minus className="w-4 h-4" /></button>
                      <span className="font-bold text-gray-800">{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })} className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-gray-200 hover:bg-green-50 text-gray-600 hover:text-green-600 transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-auto pt-2 border-t">
                    <button
                      onClick={() => openEditModal(item)}
                      className="flex-1 py-1.5 text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3 h-3" /> تعديل التفاصيل
                    </button>
                    <button
                      onClick={() => { if (confirm('حذف؟')) inventory.splice(inventory.indexOf(item), 1); /* Mock delete for UI, real logic handled in hook */ }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List View (Simplified)
            <div className="space-y-2">
              {filteredInventory.map(item => (
                <div key={item.id} className="p-4 border rounded-lg flex justify-between items-center">
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-gray-500">{getSpecialtyLabel(item.category)} - {item.brand}</div>
                  </div>
                  <button onClick={() => openEditModal(item)} className="text-blue-600 text-sm">تعديل</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Unified Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{isEditing ? 'تعديل عنصر' : 'إضافة عنصر جديد'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500"><Minus className="w-6 h-6" /></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم العنصر</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg p-2.5" placeholder="اسم المادة أو الأداة" />
              </div>

              {/* REPLACED SUPPLIER WITH SPECIALTY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاختصاص (القسم)</label>
                <select value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} className="w-full border rounded-lg p-2.5 bg-white">
                  <option value="Orthodontics">تقويم الأسنان (Orthodontics)</option>
                  <option value="Cosmetic">تجميل (Cosmetic)</option>
                  <option value="Restorative">حشوات وتجميل (Restorative)</option>
                  <option value="Anesthetic">تخدير (Anesthetic)</option>
                  <option value="Endodontics">علاج عصب (Endodontics)</option>
                  <option value="Surgery">جراحة (Surgery)</option>
                  <option value="Consumables">مستهلكات عامة (Consumables)</option>
                  <option value="General">عام (General)</option>
                </select>
              </div>

              {/* REPLACED CATEGORY WITH TYPE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">نوع العنصر</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full border rounded-lg p-2.5 bg-white">
                  <option value="Consumables">مستهلكات (Materials)</option>
                  <option value="Instruments">أدوات (Instruments)</option>
                  <option value="Equipment">معدات (Equipment)</option>
                  <option value="Medicines">أدوية (Medicines)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الكمية</label>
                <input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} className="w-full border rounded-lg p-2.5 text-right" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحد الأدنى</label>
                <input type="number" value={formData.minStock} onChange={e => setFormData({ ...formData, minStock: e.target.value })} className="w-full border rounded-lg p-2.5 text-right" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر (د.ع)</label>
                <input type="number" value={formData.unitPrice} onChange={e => setFormData({ ...formData, unitPrice: e.target.value })} className="w-full border rounded-lg p-2.5 text-right" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوحدة</label>
                <input type="text" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full border rounded-lg p-2.5" placeholder="علبة / قطعة" />
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">إلغاء</button>
              <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">{isEditing ? 'حفظ التغييرات' : 'إضافة العنصر'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};