import React, { useState } from 'react';
import { BrandsManager } from '../../../components/admin/store/BrandsManager';

import { AdminTable, Column } from '../../../components/admin/AdminTable';
import { AdminModal, FormModal, ConfirmDeleteModal } from '../../../components/admin/AdminModal';
import { BentoStatCard } from '../../../components/dashboard/BentoStatCard';
import {
  Store,
  Users,
  Package,
  TrendingUp,
  Clock,
  Star,
  ShoppingCart,
  DollarSign,
  AlertOctagon
} from 'lucide-react';
import { useAdminSuppliers, Supplier } from '../../../hooks/useAdminSuppliers';
import { useAdminStore } from '../../../hooks/useAdminStore';
import { Button } from '../../../components/common/Button';
import { PromoCardsManager } from '../../../components/admin/campaigns/PromoCardsManager';
import { DealsManager } from '../../../components/admin/campaigns/DealsManager';
import { FeaturedManager } from '../../../components/admin/campaigns/FeaturedManager';
import { DealRequestsTable } from '../../../components/admin/campaigns/DealRequestsTable';
import { CouponsManager } from '../../../components/admin/campaigns/CouponsManager';
import { toast } from 'sonner';
import { SupplierDetailModal } from '../components/SupplierDetailModal';
import { supabase } from '../../../lib/supabase';

// --- Sub Components ---

const StoreOrdersTab = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await supabase.from('store_orders').select('*');
        setOrders(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="font-bold flex items-center gap-2">
        <Package className="w-5 h-5 text-blue-600" />
        طلبات المنتجات من العيادات
      </h3>
      <div className="overflow-hidden bg-white rounded-[2rem] border border-gray-100 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">رقم الطلب</th>
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">العيادة</th>
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">المورد</th>
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">المواد</th>
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">القيمة</th>
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">الحالة</th>
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">التاريخ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="text-center p-8">جاري التحميل...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-8 text-gray-500">لا توجد طلبات المنتجات</td></tr>
            ) : orders.map(order => (
              <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-6 font-mono text-xs text-gray-500">{order.id}</td>
                <td className="p-6 font-medium text-gray-900">{order.clinic_name}</td>
                <td className="p-6 text-sm text-gray-600">{order.supplier_name}</td>
                <td className="p-6 text-sm">
                  <div className="flex flex-col gap-1">
                    {order.items && order.items.map((item: any, idx: number) => (
                      <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded inline-block w-fit">
                        {item.name} (x{item.quantity})
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-6 font-bold text-gray-900">{order.total_amount?.toLocaleString()} د.ع</td>
                <td className="p-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                    {order.status === 'delivered' ? 'تم التوصيل' : order.status === 'approved' ? 'تم التأكيد' : 'قيد المعالجة'}
                  </span>
                </td>
                <td className="p-6 text-sm text-gray-400">
                  {new Date(order.order_date).toLocaleDateString('ar-IQ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DealsTabContent = () => {
  const [activeSubTab, setActiveSubTab] = useState('promo');

  const subTabs = [
    { id: 'promo', label: 'البطاقات الترويجية' },
    { id: 'featured', label: 'المنتجات المميزة' },
    { id: 'deals', label: 'منتجات العروض' },
    { id: 'requests', label: 'طلبات العروض' },
    { id: 'coupons', label: 'قسائم التخفيض' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm transition-colors relative whitespace-nowrap ${activeSubTab === tab.id ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label}
            {activeSubTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeSubTab === 'promo' && <PromoCardsManager />}
        {activeSubTab === 'featured' && <FeaturedManager />}
        {activeSubTab === 'deals' && <DealsManager />}
        {activeSubTab === 'requests' && <DealRequestsTable />}
        {activeSubTab === 'coupons' && <CouponsManager />}
      </div>
    </div>
  );
};

// --- Main Component ---

export const StoreSuppliersSection: React.FC = () => {
  const { suppliers, loading: suppliersLoading, updateCommissionRate, updateSupplierStatus, fetchSuppliers, clearCommission } = useAdminSuppliers();
  const { stats, loading: statsLoading } = useAdminStore();

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('orders');

  // Commission Modal State
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [newCommissionRate, setNewCommissionRate] = useState<number>(0);

  // Filtered lists
  const [supplierFilter, setSupplierFilter] = useState<'all' | 'approved' | 'suspended'>('all');

  const pendingSuppliers = suppliers.filter(s => s.status === 'pending');

  const filteredSuppliers = suppliers.filter(s => {
    if (s.status === 'pending') return false; // Handled separately
    if (supplierFilter === 'all') return ['approved', 'active', 'suspended', 'rejected'].includes(s.status);
    if (supplierFilter === 'approved') return ['approved', 'active'].includes(s.status);
    return s.status === supplierFilter;
  });

  // Columns Definitions
  const supplierRequestColumns: Column[] = [
    {
      key: 'companyName',
      title: 'اسم الشركة',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
            {record.logo ? (
              <img src={record.logo} alt={value} className="w-full h-full object-cover" />
            ) : (
              value.charAt(0)
            )}
          </div>
          <div>
            <div className="font-semibold">{value}</div>
            <div className="text-sm text-gray-500">{record.ownerName}</div>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      title: 'الفئة',
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {value}
        </span>
      )
    },
    {
      key: 'location',
      title: 'الموقع',
      sortable: true
    },
    {
      key: 'status',
      title: 'الحالة',
      sortable: true,
      render: (value) => {
        const config = { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'معلق' };
        return (
          <span className={`px-2 py-1 ${config.bg} ${config.text} rounded-full text-sm`}>
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'joinDate',
      title: 'تاريخ التقديم',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('ar-IQ')
    },
    {
      key: 'actions',
      title: 'إجراءات',
      render: (_, record) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedSupplier(record as Supplier)}
          className="text-blue-600 hover:bg-blue-50"
        >
          <span>عرض التفاصيل</span>
        </Button>
      )
    }
  ];

  // Real Stats from useAdminStore
  // Fallback to local filtering if stats not yet loaded, or if we want exact real-time from loaded suppliers
  const totalSuppliers = stats.totalSuppliers || suppliers.length;
  const pendingRequestsCount = stats.pendingDealRequests || 0;
  const totalProducts = stats.totalProducts;
  const activeCampaigns = stats.activePromotions;

  // Columns Definitions
  const performanceColumns: Column[] = [
    {
      key: 'companyName',
      title: 'اسم المورد',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
            {record.logo ? (
              <img src={record.logo} alt={value} className="w-full h-full object-cover" />
            ) : (
              value.charAt(0)
            )}
          </div>
          <div>
            <div className="font-semibold">{value}</div>
            <div className="text-sm text-gray-500">{record.category}</div>
          </div>
        </div>
      )
    },
    {
      key: 'rating',
      title: 'التقييم',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">{value}</span>
        </div>
      )
    },
    {
      key: 'totalSales',
      title: 'إجمالي المبيعات',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-green-600">
          {value.toLocaleString()} د.ع
        </span>
      )
    },
    {
      key: 'ordersCount',
      title: 'عدد الطلبات',
      sortable: true
    },
    {
      key: 'actions',
      title: 'إجراءات',
      render: (_, record) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedSupplier(record as Supplier)}
          className="text-blue-600 hover:bg-blue-50"
        >
          <div className="flex items-center gap-1">
            <Store className="w-4 h-4" />
            <span>عرض التفاصيل</span>
          </div>
        </Button>
      )
    }
  ];

  // Financial Columns
  const financialColumns: Column[] = [
    {
      key: 'companyName',
      title: 'المورد',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold overflow-hidden shadow-inner">
            {record.logo ? (
              <img src={record.logo} alt={value} className="w-full h-full object-cover" />
            ) : (
              value.charAt(0)
            )}
          </div>
          <span className="font-semibold">{value}</span>
        </div>
      )
    },
    {
      key: 'totalSales',
      title: 'المبيعات الكلية',
      sortable: true,
      render: (val) => `${val.toLocaleString()} د.ع`
    },
    {
      key: 'commissionPercentage',
      title: 'نسبة العمولة',
      sortable: true,
      render: (val) => <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-bold">{val}%</span>
    },
    {
      key: 'pendingCommission',
      title: 'عمولة المنصة',
      render: (_, record) => <span className="font-bold text-green-600">
        {((record.totalSales * record.commissionPercentage) / 100).toLocaleString()} د.ع
      </span>
    },
    {
      key: 'actions',
      title: 'الإجراءات',
      render: (_, record) => (
        <Button size="sm" variant="outline" onClick={() => openCommissionModal(record as Supplier)}>
          تعديل النسبة
        </Button>
      )
    }
  ];

  const campaignColumns: Column[] = [
    { key: 'title', title: 'عنوان الحملة', sortable: true },
    { key: 'discountPercentage', title: 'نسبة الخصم', sortable: true, render: (v) => <span className="text-red-600 font-bold">{v}%</span> },
    { key: 'startDate', title: 'البداية', sortable: true },
    { key: 'endDate', title: 'النهاية', sortable: true }
  ];

  const campaignFormFields = [
    { name: 'title', label: 'العنوان', type: 'text' as const, required: true },
    { name: 'discountPercentage', label: 'الخصم (%)', type: 'number' as const, required: true },
    { name: 'startDate', label: 'تاريخ البداية', type: 'date' as const, required: true },
    { name: 'endDate', label: 'تاريخ النهاية', type: 'date' as const, required: true }
  ];

  // Handlers
  const handleApproveSupplier = async (supplier: Supplier) => {
    await updateSupplierStatus(supplier.id, 'approved');
    setSelectedSupplier(null);
  };

  const handleRejectSupplier = async (supplier: Supplier) => {
    await updateSupplierStatus(supplier.id, 'rejected');
    setSelectedSupplier(null);
  };

  const handleUpdateCommission = async () => {
    if (selectedSupplier) {
      await updateCommissionRate(selectedSupplier.id, newCommissionRate);
      setShowCommissionModal(false);
      setSelectedSupplier(null);
    }
  };

  const openCommissionModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setNewCommissionRate(supplier.commissionPercentage);
    setShowCommissionModal(true);
  };

  const handleSubmitCampaign = (formData: any) => {
    setShowCampaignModal(false);
  };

  if (suppliersLoading || statsLoading) return <div className="p-8 text-center text-gray-500">جاري تحميل بيانات الموردين...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">إدارة المتجر والموردين</h2>
        <p className="text-gray-600">إدارة الموردين والمنتجات والعمولات المالية</p>
      </div>

      {/* Stats Grid - Expanded to include all user requested sections */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <BentoStatCard
          title="إجمالي الموردين"
          value={totalSuppliers}
          icon={Users}
          color="blue"
          trend="neutral"
          trendValue="المسجلين"
          delay={100}
        />
        <BentoStatCard
          title="طلبات العروض"
          value={pendingRequestsCount} // Offers Requests
          icon={Clock}
          color="orange"
          trend="up"
          trendValue="في الانتظار"
          delay={200}
        />
        <BentoStatCard
          title="المنتجات"
          value={totalProducts}
          icon={Package}
          color="green"
          trend="up"
          trendValue="نشط"
          delay={300}
        />
        <BentoStatCard
          title="العروض والصفقات"
          value={activeCampaigns}
          icon={TrendingUp}
          color="purple"
          trend="up"
          trendValue="نشط"
          delay={400}
        />
        {/* Additional Cards for "All Sections" compliance */}
        <BentoStatCard
          title="العمولات (الإيرادات)"
          value={`${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          color="emerald"
          trend="up"
          trendValue="د.ع"
          delay={500}
        />
        <BentoStatCard
          title="الطلبات النشطة"
          value={stats.activeOrders}
          icon={ShoppingCart}
          color="indigo"
          trend="neutral"
          trendValue="طلب"
          delay={600}
        />
        <BentoStatCard
          title="قسائم التخفيض"
          value={stats.activeCoupons}
          icon={Star} // Proxy icon
          color="red"
          trend="neutral"
          trendValue="نشط"
          delay={700}
        />
        <BentoStatCard
          title="البطاقات الترويجية"
          value={stats.activeCards}
          icon={Store}
          color="cyan"
          trend="up"
          trendValue="بنر"
          delay={800}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-2xl border border-gray-200 inline-flex">
        {[
          { id: 'orders', label: 'طلبات المنتجات', icon: Package },
          { id: 'performance', label: 'الموردين', icon: Users },
          { id: 'brands', label: 'العلامات التجارية', icon: Star },
          { id: 'financial', label: 'العمولات والمالية', icon: DollarSign },
          { id: 'campaigns', label: 'العروض والصفقات', icon: Store }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-2.5 px-6 rounded-xl font-medium text-sm transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'orders' && (
        <StoreOrdersTab />
      )}

      {activeTab === 'brands' && (
        <BrandsManager />
      )}

      {activeTab === 'performance' && (
        <div className="space-y-8">
          {pendingSuppliers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 border-r-4 border-yellow-400 pr-3">طلبات الانضمام الجديدة ({pendingSuppliers.length})</h3>
              <AdminTable
                columns={supplierRequestColumns}
                data={pendingSuppliers}
                actions={{
                  view: setSelectedSupplier
                }}
              />
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 border-r-4 border-green-400 pr-3">قائمة الموردين ({filteredSuppliers.length})</h3>

              <div className="flex bg-gray-100 rounded-lg p-1">
                {(['all', 'approved', 'suspended'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSupplierFilter(filter)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${supplierFilter === filter
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    {filter === 'all' ? 'الكل' : filter === 'approved' ? 'نشط' : 'معلق'}
                  </button>
                ))}
              </div>
            </div>

            <AdminTable
              columns={performanceColumns}
              data={filteredSuppliers}
              actions={{
                view: setSelectedSupplier
              }}
            />
          </div>
        </div>
      )}

      {activeTab === 'financial' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-purple-50 p-4 rounded-xl border border-purple-100">
            <div>
              <h3 className="font-bold text-purple-900">إدارة العمولات المالية</h3>
              <p className="text-sm text-purple-700">تحديد نسبة الربح للمنصة من كل مورد</p>
            </div>
            <Button onClick={() => fetchSuppliers()} size="sm">تحديث البيانات</Button>
          </div>

          <AdminTable
            columns={financialColumns}
            data={filteredSuppliers}
          />
        </div>
      )}

      {activeTab === 'campaigns' && (
        <DealsTabContent />
      )}

      {/* Supplier Modal */}
      <SupplierDetailModal
        supplier={selectedSupplier}
        isOpen={!!selectedSupplier && !showCampaignModal && !showCommissionModal}
        onClose={() => setSelectedSupplier(null)}
        onApprove={handleApproveSupplier}
        onReject={handleRejectSupplier}
        onUpdateStatus={async (id, status) => {
          await updateSupplierStatus(id, status);
          if (status === 'suspended') toast.success('تم تعليق حساب المورد');
          if (status === 'approved') toast.success('تم تفعيل حساب المورد');
          setSelectedSupplier(null);
        }}
        onClearCommission={async () => {
          if (selectedSupplier) {
            const success = await clearCommission(selectedSupplier.id);
            if (success) toast.success('تم تصفية العمولة بنجاح');
            else toast.error('فشل تصفية العمولة أو لا يوجد رصيد');
          }
        }}
      />

      {/* Commission Modal */}
      <AdminModal
        isOpen={showCommissionModal}
        onClose={() => setShowCommissionModal(false)}
        title="تعديل نسبة عمولة المنصة للمورد"
      >
        <div className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg flex gap-3">
            <AlertOctagon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-700">تغيير نسبة العمولة سيطبق على الطلبات الجديدة فقط.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نسبة العمولة (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              className="w-full p-2 border rounded-lg"
              value={newCommissionRate}
              onChange={(e) => setNewCommissionRate(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setShowCommissionModal(false)}>إلغاء</Button>
            <Button onClick={handleUpdateCommission}>حفظ التغييرات</Button>
          </div>
        </div>
      </AdminModal>

      {/* Campaign Form Modal */}
      <FormModal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        title={selectedCampaign ? 'تعديل الحملة' : 'إنشاء حملة جديدة'}
        fields={campaignFormFields}
        onSubmit={handleSubmitCampaign}
      />

      {/* Delete Confirmation */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          setShowDeleteModal(false);
          setSelectedCampaign(null);
        }}
        title="تأكيد الحذف"
        message="هل أنت متأكد من حذف هذه الحملة؟"
        itemName={selectedCampaign?.title}
      />
    </div>
  );
};