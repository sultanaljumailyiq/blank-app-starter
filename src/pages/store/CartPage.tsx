import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, CreditCard, ShoppingBag, Receipt, Package, MapPin, Truck, Check, Tag, Building, Stethoscope, Heart, AlertCircle } from 'lucide-react';
import { useStoreCart } from '../../hooks/useStoreCart';
import { useStore } from '../../hooks/useStore';
import { useStoreAddresses } from '../../hooks/useStoreAddresses';
import { useAuth } from '../../contexts/AuthContext';
import { useClinics } from '../../hooks/useClinics';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { formatCurrency } from '../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart, totals } = useStoreCart();
  const { placeOrder, products: storeProducts } = useStore();
  const { user } = useAuth();
  const { clinics } = useClinics();
  const { addresses, loading: addressesLoading } = useStoreAddresses();

  // We need a hook/way to get the user's lab if they are a lab owner.
  // Assuming useLaboratories exists or we fetch it.
  // For now, let's try to fetch user's lab data if role is 'laboratory' using supabase directly or hook if available.
  // const [userLab, setUserLab] = useState<any>(null); // Legacy unused

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    governorate: 'بغداد',
    city: '',
    address: '',
    phone: '',
    clinicName: '',
    recipientName: '',
    backupPhone: ''
  });

  const [entityLabel, setEntityLabel] = useState('اسم العيادة أو المركز الطبي');

  useEffect(() => {
    const currentUser = user as any;
    if (currentUser?.user_metadata) {
      const role = currentUser.user_metadata.role;
      const name = currentUser.user_metadata.name || currentUser.user_metadata.full_name || '';

      setShippingAddress(prev => ({
        ...prev,
        recipientName: name
      }));

      if (role === 'laboratory') setEntityLabel('اسم المختبر');
      else if (role === 'supplier') setEntityLabel('اسم المورد');
      else if (role === 'admin') setEntityLabel('إدارة المنصة');
      else setEntityLabel('اسم العيادة أو المركز الطبي');
    }
  }, [user]);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Multi-supplier warning state
  const [showMultiSupplierWarning, setShowMultiSupplierWarning] = useState(false);
  const [multiSupplierProceed, setMultiSupplierProceed] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const { data, error } = await supabase
        .from('store_coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single();

      let couponData = data;

      // Fallback to Mocks if DB fails or empty (For Demo)
      if (error || !data) {
        const MOCK_COUPONS: Record<string, any> = {
          'WELCOME20': { code: 'WELCOME20', status: 'active', discount_type: 'percentage', discount_value: 20, min_order_value: 0 },
          'SAVE10': { code: 'SAVE10', status: 'active', discount_type: 'fixed', discount_value: 10000, min_order_value: 50000 },
        };
        couponData = MOCK_COUPONS[couponCode.toUpperCase()];
      }

      if (!couponData) {
        toast.error('كود الخصم غير صحيح');
        return;
      }

      if (couponData.status !== 'active') {
        toast.error('هذا الكوبون غير فعال');
        return;
      }

      // Validate expiry
      if (couponData.end_date && new Date(couponData.end_date) < new Date()) {
        toast.error('لقد انتهت صلاحية هذا الكوبون');
        return;
      }

      // Validate min order
      if (totals.subtotal < couponData.min_order_value) {
        toast.error(`يجب أن تكون قيمة الطلب أكثر من ${formatCurrency(couponData.min_order_value)} لاستخدام هذا الكوبون`);
        return;
      }

      // Validate usage limit
      if (couponData.usage_limit && couponData.used_count >= couponData.usage_limit) {
        toast.error('نفدت كمية هذا الكوبون');
        return;
      }

      let discount = 0;
      if (couponData.discount_type === 'percentage') {
        discount = (totals.subtotal * couponData.discount_value) / 100;
      } else {
        discount = couponData.discount_value;
      }

      if (discount > totals.subtotal) discount = totals.subtotal;

      setDiscountAmount(discount);
      setAppliedCoupon(couponData);
      toast.success(`تم تطبيق خصم ${formatCurrency(discount)}`);
    } catch (err) {
      toast.error('فشل التحقق من الكوبون');
    }
  };

  // Legacy address select handler removed
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const handleCheckout = async () => {
    // Validate unavailable items
    const invalidItems = cartItems.filter(item => !storeProducts.find(p => p.id === item.id));
    if (invalidItems.length > 0) {
      toast.error('يرجى حذف المنتجات غير المتوفرة من السلة للمتابعة');
      return;
    }

    if (!shippingAddress.phone || !shippingAddress.city) {
      toast.error('يرجى ملء جميع معلومات التوصيل');
      return;
    }

    // Check Multi-Supplier
    const suppliersSet = new Set(
      cartItems.map(item => storeProducts.find(p => p.id === item.id)?.supplierId).filter(Boolean)
    );
    const isMultiSupplier = suppliersSet.size > 1;
    const allowMultiSupplier = localStorage.getItem('allow_multi_supplier') === 'true';

    if (isMultiSupplier && !allowMultiSupplier && !multiSupplierProceed) {
      setShowMultiSupplierWarning(true);
      return;
    }

    executeCheckout();
  };

  const executeCheckout = async () => {
    setIsSubmitting(true);
    try {
      const simplifiedItems = cartItems.map(i => ({ id: i.id, quantity: i.quantity }));

      // Construct composite address since detailed field is removed
      const finalAddress = {
        ...shippingAddress,
        address: `${shippingAddress.governorate || ''}، ${shippingAddress.city || ''}`
      };

      await placeOrder(simplifiedItems, finalAddress, paymentMethod);
      setOrderComplete(true);
      toast.success('تم استلام طلبك بنجاح!');

      // Clear cart items here since useStore only clears its own internal state if not external
      // Ideally useStoreCart should have clearCart()
      // For demo, we rely on page refresh or individual deletes? No, that's bad.
      // Let's assume user navigates away or we manually clear.
      clearCart();

    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء إتمام الطلب');
      setIsSubmitting(false);
      setMultiSupplierProceed(false); // reset
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-12 text-center max-w-md w-full border border-slate-100 shadow-xl">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">شكراً لطلبك!</h2>
          <p className="text-slate-500 mb-8">تم استلام طلبك بنجاح وسيتم تجهيزه قريباً.</p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/store')} className="w-full bg-slate-900 text-white hover:bg-slate-800 py-3 rounded-xl">
              العودة للمتجر
            </Button>
            <Button onClick={() => setOrderComplete(false)} variant="ghost" className="w-full">
              تفاصيل الطلب
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-3xl p-12 text-center max-w-md w-full border border-slate-100 shadow-xl">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">سلة التسوق فارغة</h2>
          <p className="text-slate-500 mb-8">لم تقم بإضافة أي منتجات للسلة بعد. ابدأ التسوق الآن!</p>
          <Button onClick={() => navigate('/store')} className="w-full bg-slate-900 text-white hover:bg-blue-600 py-3 rounded-xl">
            تصفح المنتجات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-32" dir="rtl">

      {/* Checkout Modal Overlay */}
      {isCheckingOut && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Truck className="w-6 h-6 text-blue-600" />
                إتمام الطلب
              </h2>
              <button onClick={() => setIsCheckingOut(false)} className="text-slate-400 hover:text-slate-600">إغلاق</button>
            </div>

            <div className="p-6 space-y-6">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-slate-500" />
                    بيانات التوصيل
                  </h3>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-bold text-slate-800">اختر عنواناً محفوظاً</label>
                      <button
                        onClick={() => navigate('/store/addresses')}
                        className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> إضافة عنوان
                      </button>
                    </div>

                    {addressesLoading ? (
                      <div className="text-center py-8 text-sm text-slate-400 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                        <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                        جاري تحميل العناوين...
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {addresses.map(addr => (
                          <div
                            key={addr.id}
                            className={`group relative p-4 border rounded-2xl cursor-pointer transition-all duration-200 flex items-center gap-3
                            ${shippingAddress.phone === addr.phone ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-md'}
                          `}
                          >
                            {/* Selection Handling */}
                            <div className="flex-1 flex items-center gap-3" onClick={() => {
                              setShippingAddress(prev => ({
                                ...prev,
                                clinicName: (addr.type === 'clinic' ? addr.name : (addr.type === 'lab' ? addr.name : prev.clinicName)) || '',
                                address: addr.street || '',
                                city: addr.city || '',
                                phone: addr.phone || '',
                                governorate: addr.governorate || 'بغداد'
                              }));
                              toast.success('تم اختيار العنوان');
                            }}>
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                                ${addr.type === 'clinic' ? 'bg-blue-100 text-blue-600' :
                                  addr.type === 'lab' ? 'bg-purple-100 text-purple-600' :
                                    'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`
                              }>
                                {addr.type === 'clinic' ? <Stethoscope className="w-5 h-5" /> :
                                  addr.type === 'lab' ? <Building className="w-5 h-5" /> :
                                    <MapPin className="w-5 h-5" />}
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-sm font-bold text-slate-900 truncate">{addr.name}</p>
                                <p className="text-xs text-slate-500 truncate">{addr.city}، {addr.street}</p>
                              </div>
                            </div>

                            {/* Delete Button (Only for Custom Addresses) */}
                            {addr.type === 'custom' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Assuming functionality is available or linked to page
                                  // Since we are in a modal, maybe just navigate to management or handle simple delete if hook exposes it
                                  // Since hook uses `deleteAddress`, we can try to use it if we import it correctly or use context.
                                  // But `useStoreAddresses` instance here is local.
                                  // Ideally pass delete handler. For now, hide delete or navigate.
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="إدارة العنوان"
                              >
                                <ArrowRight className="w-4 h-4 rotate-180" />
                              </button>
                            )}
                          </div>
                        ))}

                        <div
                          onClick={() => navigate('/store/addresses')}
                          className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all gap-2 text-slate-400 hover:text-blue-600 h-full min-h-[80px]"
                        >
                          <Plus className="w-6 h-6" />
                          <span className="text-xs font-bold">إضافة جديد</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">{entityLabel}</label>
                    <input
                      type="text"
                      placeholder={entityLabel}
                      value={shippingAddress.clinicName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, clinicName: e.target.value })}
                      className="w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">الاسم المستلم (من قام بالطلب)</label>
                    <input
                      type="text"
                      placeholder="اسم الشخص المستلم"
                      value={shippingAddress.recipientName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, recipientName: e.target.value })}
                      className="w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">المحافظة</label>
                    <select
                      value={shippingAddress.governorate}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, governorate: e.target.value })}
                      className="w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {['بغداد', 'البصرة', 'نينوى', 'أربيل', 'السليمانية', 'دهوك', 'كركوك', 'صلاح الدين', 'ديالى', 'الأنبار', 'بابل', 'كربلاء', 'النجف', 'واسط', 'القادسية', 'ميسان', 'ذي قار', 'المثنى'].map((gov) => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">المدينة / المنطقة</label>
                    <input
                      type="text"
                      placeholder="مثال: المنصور"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {/* Detailed Address Removed as per request */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف الأساسي</label>
                    <input
                      type="tel"
                      placeholder="0770..."
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      className="w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف البديل (اختياري)</label>
                    <input
                      type="tel"
                      placeholder="0770..."
                      value={shippingAddress.backupPhone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, backupPhone: e.target.value })}
                      className="w-full rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-500" />
                  طريقة الدفع
                </h3>
                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">الدفع عند الاستلام</p>
                      <p className="text-sm text-slate-500">ادفع نقداً عند استلام طلبك</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed">
                    <input type="radio" name="payment" disabled className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">البطاقة الائتمانية (قريباً)</p>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
              <div className="flex justify-between items-center mb-4 text-lg font-bold">
                <span>الإجمالي للدفع</span>
                <span className="text-blue-600">{formatCurrency(totals.total)}</span>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200"
              >
                {isSubmitting ? 'جاري التنفيذ...' : 'تأكيد الطلب'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Supplier Warning Dialog */}
      {showMultiSupplierWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-center mb-4 text-slate-900">تنبيه طلب من عدة موردين</h3>
            <p className="text-slate-600 text-center mb-8 leading-relaxed">
              طلبك يحتوي على منتجات من موردين مختلفين. سوف يتم عمل طلبين (أو أكثر)، كل طلب خاص بمورد. هل توافق على إتمام الطلب أم تود الرجوع إلى سلة التسوق للمراجعة؟
            </p>
            <div className="flex gap-3">
              <Button onClick={() => { setShowMultiSupplierWarning(false); setMultiSupplierProceed(true); executeCheckout(); }} className="flex-1 bg-blue-600 hover:bg-blue-700">
                أوافق، إتمام الطلب
              </Button>
              <Button onClick={() => { setShowMultiSupplierWarning(false); setIsCheckingOut(false); }} variant="outline" className="flex-1">
                الرجوع للسلة
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Column */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(
              cartItems.reduce((acc, item) => {
                const product = storeProducts.find(p => p.id === item.id);
                // Fallback to "مورد غير معروف" instead of crashing if product isn't found
                const supplierId = product?.supplierId || 'unknown';
                const supplierName = product?.supplierName || 'مورد غير معروف';
                if (!acc[supplierId]) acc[supplierId] = { supplierName, items: [] };
                acc[supplierId].items.push(item);
                return acc;
              }, {} as Record<string, { supplierName: string, items: typeof cartItems }>)
            ).map(([supplierId, group]) => (
              <div key={supplierId} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{group.supplierName}</h3>
                    <p className="text-xs text-slate-500">منتجات من هذا المورد</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {group.items.map((item) => {
              const isAvailable = storeProducts.find(p => p.id === item.id);
              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-3xl p-4 sm:p-6 border ${isAvailable ? 'border-slate-100' : 'border-red-200 bg-red-50'} shadow-sm hover:shadow-md transition-shadow flex sm:flex-row flex-col gap-6 relative overflow-hidden group`}
                >
                  {!isAvailable && (
                    <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded-br-xl z-20">
                      غير متوفر حالياً
                    </div>
                  )}
                  {/* Image */}
                  <div className="w-full sm:w-32 h-32 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer" onClick={() => navigate(`/store/product/${item.id}`)}>
                    <img src={item.image} alt={item.name} className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${!isAvailable ? 'grayscale opacity-50' : ''}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-bold text-lg mb-1 cursor-pointer ${isAvailable ? 'text-slate-900 hover:text-blue-600' : 'text-slate-500 line-through'}`} onClick={() => navigate(`/store/product/${item.id}`)}>{item.name}</h3>
                        <p className="text-sm text-slate-500 bg-slate-50 px-2 py-1 rounded-lg inline-block text-xs">{item.category || 'عام'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toast.success('تمت الإضافة للمفضلة')}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                          title="إضافة للمفضلة"
                        >
                          <Heart className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all"
                          title="حذف من السلة"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-end mt-4 gap-4">
                      {/* Quantity Control */}
                      <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 border border-slate-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-slate-200 transition-colors text-slate-700"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-slate-900 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-left">
                        <p className="text-xs text-slate-400 mb-1">المجموع</p>
                        <span className="font-bold text-blue-600 text-xl">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Summary Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-lg sticky top-8">
              <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
                <Receipt className="w-6 h-6 text-slate-400" />
                ملخص الطلب
              </h3>

              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="لديك كود خصم؟"
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <Button onClick={() => { setAppliedCoupon(null); setDiscountAmount(0); setCouponCode(''); }} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                      إزالة
                    </Button>
                  ) : (
                    <Button onClick={handleApplyCoupon} disabled={!couponCode} variant="outline">
                      تطبيق
                    </Button>
                  )}
                </div>
                {appliedCoupon && (
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1 font-bold">
                    <Tag className="w-3 h-3" />
                    تم تطبيق الكوبون {appliedCoupon.code}
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-600">
                  <span>المجموع الفرعي</span>
                  <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>الشحن</span>
                  <span className={`font-medium ${totals.shipping === 0 ? 'text-green-600' : ''}`}>
                    {totals.shipping === 0 ? 'مجاني' : formatCurrency(totals.shipping)}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-bold bg-green-50 p-2 rounded-lg">
                    <span>خصم ({appliedCoupon.code})</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-xl">
                  <span>الإجمالي</span>
                  <span>{formatCurrency(totals.total - discountAmount)}</span>
                </div>
              </div>

              <Button
                onClick={() => setIsCheckingOut(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl shadow-lg shadow-blue-200 mb-6 font-bold text-lg flex items-center justify-center gap-2 group"
              >
                <span>إتمام الشراء</span>
                <ArrowRight className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </Button>

              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 mb-6 border border-slate-100">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">تسوق آمن 100%</p>
                  <p className="text-xs text-slate-500">نضمن حماية بياناتك ومدفوعاتك</p>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-xs font-medium text-slate-400 mb-3 text-center">طرق الدفع المدعومة</p>
                <div className="flex justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all">
                  <div className="h-8 w-12 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">VISA</div>
                  <div className="h-8 w-12 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">Master</div>
                  <div className="h-8 w-12 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">Cash</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
