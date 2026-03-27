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
  DollarSign,
  AlertOctagon,
  Settings,
  Truck,
  ShoppingCart,
  Eye
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

const StoreOrdersTab = ({ onOpenSupplier }: { onOpenSupplier: (supplier: Supplier) => void }) => {
  const { suppliers, loading: suppliersLoading } = useAdminSuppliers();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchOrders = async () => {
      if (suppliersLoading) return;
      try {
        setLoading(true);
        const idList: string[] = [];
        const fetchPromises = suppliers.map(async (s) => {
          const ids = [s.id];
          if (s.user_id) ids.push(s.user_id);

          const { data, error } = await supabase
            .from('store_orders')
            .select(`
              *,
              items:store_order_items (
                id,
                product_id,
                quantity,
                price_at_purchase,
                item_status,
                return_requested,
                return_reason,
                product:products(name, image_url)
              )
            `)
            .or(`supplier_id.eq.${s.id}${s.user_id ? `,supplier_id.eq.${s.user_id}` : ''}`)
            .order('created_at', { ascending: false });

          if (error) {
            console.error(`Error fetching for supplier ${s.companyName}:`, error);
            return [];
          }

          return (data || []).map((o: any) => ({
            ...o,
            clinic_name: o.user_name || 'زاير',
            supplier_name: s.companyName,
            items: o.items?.map((item: any) => ({
              name: item.product?.name || 'منتج',
              quantity: item.quantity
            }))
          }));
        });

        const results = await Promise.all(fetchPromises);
        setOrders(results.flat().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [suppliers, suppliersLoading]);

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
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">المورد</th>
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">رقم الطلب</th>
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">العيادة</th>
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">القيمة</th>
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">الحالة</th>
              <th className="p-6 text-right text-sm font-bold text-gray-600 bg-gray-50/30">التاريخ</th>
              <th className="p-6 text-center text-sm font-bold text-gray-600 bg-gray-50/30">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="text-center p-8">جاري التحميل...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-8 text-gray-500">لا توجد طلبات المنتجات</td></tr>
            ) : orders.map(order => (
              <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-6 text-sm text-gray-600">{order.supplier_name}</td>
                <td className="p-6 font-mono text-xs text-gray-500">{order.order_number || order.id.split('-')[0]}</td>
                <td className="p-6 font-medium text-gray-900">{order.clinic_name}</td>
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
                  {new Date(order.created_at).toLocaleDateString('ar-IQ')}
                </td>
                <td className="p-6 text-center">
                  <button 
                    onClick={() => {
                      const orig = suppliers?.find(s => s.id === order.supplier_id);
                      if (orig) onOpenSupplier(orig);
                    }}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
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

const StoreSettingsTab = () => {
  const [allowMultiSupplier, setAllowMultiSupplier] = useState(
    localStorage.getItem('allow_multi_supplier') === 'true'
  );

  const toggleMultiSupplier = () => {
    const newState = !allowMultiSupplier;
    setAllowMultiSupplier(newState);
    localStorage.setItem('allow_multi_supplier', String(newState));
    toast.success(newState ? 'تم تفعيل الطلب من موردين مختلفين' : 'تم تعطيل الطلب من موردين مختلفين');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">إعدادات الشراء وسلة التسوق</h3>
          <p className="text-gray-500 mb-6">التحكم بخيارات وإمكانيات العملاء في متجر المنصة</p>
          
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900">تفعيل طلب منتجات من موردين مختلفين</h4>
              <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">يسمح للعيادات بإضافة منتجات من عدة موردين في سلة واحدة وإتمامها كطلب واحد، حيث سيقوم النظام بفصلها تلقائياً إلى طلبات فرعية لكل مورد.</p>
            </div>
            <button
              onClick={toggleMultiSupplier}
              className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${allowMultiSupplier ? 'bg-blue-600' : 'bg-gray-200'}`}
              role="switch"
              dir="ltr"
              aria-checked={allowMultiSupplier}
            >
              <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${allowMultiSupplier ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-900">إدارة توصيل الطلبات</h3>
            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">تحت التطوير</span>
          </div>
          <p className="text-gray-500 mb-6">التحكم في الجهة المسؤولة عن تسليم الطلبات للعيادات</p>
          
          <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100 cursor-not-allowed">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-600" />
                  اعتماد المنصة كمسؤول عن توصيل المنتجات
                </h4>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-2xl opacity-80">
                  في حال تفعيل هذا الخيار، سيتم إلغاء مسؤولية المورد عن توصيل المنتجات، وستقوم إدارة المنصة أو شركة توصيل معتمدة من قبلها باستلام المنتجات من المخازن وتوصيلها للعيادات المعنية. 
                  سيتم إضافة نظام مناديب متكامل لتتبع حركة الاستلام والتسليم قريباً.
                </p>
              </div>
              <button
                disabled
                className="relative inline-flex h-7 w-14 flex-shrink-0 cursor-not-allowed rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out opacity-50"
                role="switch"
                dir="ltr"
                aria-checked="false"
              >
                <span className="pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-0" />
              </button>
            </div>
          </div>
        </div>
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
      key: 'ordersCount',
      title: 'عدد الطلبات',
      sortable: true
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
      key: 'pendingCommission',
      title: 'العمولة المستحقة',
      sortable: true,
      render: (value) => (
        <span className="font-semibold text-orange-600">
          {value.toLocaleString()} د.ع
        </span>
      )
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
      title: 'العمولة المستحقة',
      render: (v) => <span className="font-bold text-green-600">
        {Number(v).toLocaleString()} د.ع
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
      <div className="bg-white p-1 rounded-2xl border border-gray-200 flex flex-wrap gap-1">
        {[
          { id: 'orders', label: 'طلبات المنتجات', icon: Package },
          { id: 'performance', label: 'الموردين', icon: Users },
          { id: 'brands', label: 'العلامات التجارية', icon: Star },
          { id: 'financial', label: 'العمولات والمالية', icon: DollarSign },
          { id: 'campaigns', label: 'العروض والصفقات', icon: Store },
          { id: 'settings', label: 'إعدادات المتجر', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-2.5 px-6 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap
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
        <StoreOrdersTab onOpenSupplier={setSelectedSupplier} />
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

      {activeTab === 'settings' && (
        <StoreSettingsTab />
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
        onClearCommission={async (id, amount) => {
          if (selectedSupplier) {
            const success = await clearCommission(selectedSupplier.id, amount);
            if (success) {
              toast.success('تم تصفية العمولة بنجاح');
              return true;
            } else {
              toast.error('فشل تصفية العمولة أو لا يوجد رصيد');
              return false;
            }
          }
          return false;
        }}
        onUpdateCommission={async (id, rate) => {
          try {
            await updateCommissionRate(id, rate);
            toast.success('تم تحديث نسبة العمولة بنجاح');
            return true;
          } catch (err: any) {
            toast.error('فشل تحديث نسبة العمولة');
            return false;
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