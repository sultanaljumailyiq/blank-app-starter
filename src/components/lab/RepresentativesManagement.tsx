import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Plus,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Clock,
  Package,
  Truck,
  Settings,
  Edit,
  Trash2,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { BentoStatCard } from '../dashboard/BentoStatCard';


type Representative = {
  representative_id: string;
  full_name: string;
  phone: string;
  email?: string;
  position?: string;
  representative_type: 'delivery' | 'technical' | 'administrative';
  status: 'available' | 'busy' | 'offline';
  current_assignments: number;
  max_assignments: number;
  total_deliveries: number;
  successful_deliveries: number;
  cancelled_deliveries: number;
  rating: number;
  vehicle_type?: string;
  working_hours?: any;
};

type DelegateOrder = {
  id: string;
  order_number: string;
  clinic_name: string;
  status: string;
  role: 'pickup' | 'delivery' | 'both' | 'legacy';
  date: string;
};

type RepresentativeStats = {
  total_representatives: number;
  active_representatives: number;
  available_representatives: number;
  busy_representatives: number;
  total_assignments: number;
  completion_rate: number;
};

export default function RepresentativesManagement() {
  const { user } = useAuth();
  // Removed explicit createClient, usage will be replaced by global supabase instance below

  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [stats, setStats] = useState<RepresentativeStats | null>(null);
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [labId, setLabId] = useState<string | null>(null);

  // Orders assigned to the selected representative
  const [repOrders, setRepOrders] = useState<DelegateOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // نموذج إضافة مندوب
  const [newRep, setNewRep] = useState({
    full_name: '',
    phone: '',
    email: '',
    position: '',
    representative_type: 'delivery' as const,
    max_assignments: 5,
    working_hours: JSON.stringify({
      sunday: { start: '08:00', end: '17:00' },
      monday: { start: '08:00', end: '17:00' },
      tuesday: { start: '08:00', end: '17:00' },
      wednesday: { start: '08:00', end: '17:00' },
      thursday: { start: '08:00', end: '17:00' },
      friday: { start: '08:00', end: '17:00' },
      saturday: { start: '08:00', end: '17:00' }
    })
  });

  // جلب المندوبين
  const fetchRepresentatives = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1. Get Lab ID from User ID
      const { data: labData, error: labError } = await supabase
        .from('dental_laboratories')
        .select('id')
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .maybeSingle();

      if (labError || !labData) {
        console.error('Lab not found for user:', user.id);
        return;
      }

      const realLabId = labData.id;
      setLabId(realLabId);

      // جلب إحصائيات
      const { data: statsData, error: statsError } = await supabase
        .from('dental_lab_representatives')
        .select('id, full_name, phone, email, position, representative_type, status, current_assignments, max_assignments, total_deliveries, successful_deliveries, cancelled_deliveries, rating, vehicle_type, working_hours, is_active')
        .eq('laboratory_id', realLabId)
        .eq('is_active', true);

      if (statsError) throw statsError;

      const reps: Representative[] = ((statsData as any[]) || []).map(rep => ({
        representative_id: rep.id,
        full_name: rep.full_name,
        phone: rep.phone,
        email: rep.email,
        position: rep.position,
        representative_type: rep.representative_type,
        status: rep.status,
        current_assignments: rep.current_assignments || 0,
        max_assignments: rep.max_assignments || 5,
        total_deliveries: rep.total_deliveries || 0,
        successful_deliveries: rep.successful_deliveries || 0,
        cancelled_deliveries: rep.cancelled_deliveries || 0,
        rating: rep.rating || 0,
        vehicle_type: rep.vehicle_type,
        working_hours: rep.working_hours
      }));

      setRepresentatives(reps);

      // حساب الإحصائيات
      const total = reps.length;
      const active = reps.filter(r => r.status !== 'offline').length;
      const available = reps.filter(r => r.status === 'available').length;
      const busy = reps.filter(r => r.status === 'busy').length;
      const totalAssignments = reps.reduce((sum, r) => sum + r.current_assignments, 0);
      const completionRate = reps.length > 0 ?
        reps.reduce((sum, r) => sum + (r.total_deliveries > 0 ? r.successful_deliveries / r.total_deliveries : 0), 0) / reps.length * 100 : 0;

      setStats({
        total_representatives: total,
        active_representatives: active,
        available_representatives: available,
        busy_representatives: busy,
        total_assignments: totalAssignments,
        completion_rate: completionRate
      });

    } catch (error) {
      console.error('Error fetching representatives:', error);
    } finally {
      setLoading(false);
    }
  };

  // إضافة مندوب جديد
  const addRepresentative = async () => {
    try {
      const { data, error } = await (supabase as any).rpc('add_representative', {
        p_laboratory_id: labId,
        p_user_id: null, // Don't link admin user as rep user by default
        p_full_name: newRep.full_name,
        p_phone: newRep.phone,
        p_email: newRep.email || null,
        p_position: newRep.position || null,
        p_representative_type: newRep.representative_type,
        p_max_assignments: newRep.max_assignments,
        p_working_hours: JSON.parse(newRep.working_hours)
      });

      if (error) throw error;

      setShowAddDialog(false);
      setNewRep({
        full_name: '',
        phone: '',
        email: '',
        position: '',
        representative_type: 'delivery',
        max_assignments: 5,
        working_hours: JSON.stringify({
          sunday: { start: '08:00', end: '17:00' },
          monday: { start: '08:00', end: '17:00' },
          tuesday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          thursday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '17:00' },
          saturday: { start: '08:00', end: '17:00' }
        })
      });

      fetchRepresentatives();
    } catch (error) {
      console.error('Error adding representative:', error);
    }
  };

  // تحديث حالة المندوب
  const updateStatus = async (repId: string, newStatus: 'available' | 'busy' | 'offline') => {
    try {
      const { error } = await (supabase as any).rpc('update_representative_status', {
        p_representative_id: repId,
        p_new_status: newStatus
      });

      if (error) throw error;
      fetchRepresentatives();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // تحديد المندوب
  const selectRepresentative = (rep: Representative) => {
    setSelectedRep(rep);
    setShowDetailsDialog(true);
  };

  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    if (user) {
      fetchRepresentatives();
    }
  }, [user]);

  // جلب طلبات المندوب المحدد
  useEffect(() => {
    const fetchRepOrders = async () => {
      if (!selectedRep || !showDetailsDialog) return;

      setLoadingOrders(true);
      try {
        const { data, error } = await supabase
          .from('dental_lab_orders')
          .select('id, order_number, clinic:clinics(name), status, created_at, delegate_id, pickup_delegate_id, delivery_delegate_id')
          .or(`delegate_id.eq.${selectedRep.representative_id},pickup_delegate_id.eq.${selectedRep.representative_id},delivery_delegate_id.eq.${selectedRep.representative_id}`)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        const mappedOrders: DelegateOrder[] = (data || []).map((o: any) => {
          let role: 'pickup' | 'delivery' | 'both' | 'legacy' = 'legacy';

          const isPickup = o.pickup_delegate_id === selectedRep.representative_id;
          const isDelivery = o.delivery_delegate_id === selectedRep.representative_id;
          const isLegacy = o.delegate_id === selectedRep.representative_id && !isPickup && !isDelivery;

          if (isPickup && isDelivery) role = 'both';
          else if (isPickup) role = 'pickup';
          else if (isDelivery) role = 'delivery';
          else if (isLegacy) role = 'legacy';

          return {
            id: o.id,
            order_number: o.order_number,
            clinic_name: o.clinic?.name || 'عيادة',
            status: o.status,
            role,
            date: o.created_at
          };
        });

        setRepOrders(mappedOrders);
      } catch (err) {
        console.error('Error fetching rep orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchRepOrders();
  }, [selectedRep, showDetailsDialog]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    const map: any = {
      'available': 'متوفر',
      'busy': 'مشغول',
      'offline': 'غير متصل',
      'pending': 'في الانتظار',
      'confirmed': 'تم التأكيد',
      'in_progress': 'جاري العمل',
      'ready_for_pickup': 'جاهز للاستلام',
      'collected': 'تم الاستلام',
      'in_lab': 'في المختبر',
      'ready_for_delivery': 'جاهز للتوصيل',
      'delivered': 'تم التوصيل',
      'completed': 'مكتمل',
      'returned': 'مرتجع',
      'cancelled': 'ملغي'
    };
    return map[status] || status;
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'delivery': return 'توصيل';
      case 'technical': return 'تقني';
      case 'administrative': return 'إداري';
      default: return 'غير محدد';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* الإحصائيات */}
      {/* إحصائيات المندوبين - Bento Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <BentoStatCard
            title="إجمالي المندوبين"
            value={stats.total_representatives}
            icon={Users}
            color="blue"
            delay={0}
          />
          <BentoStatCard
            title="متاح"
            value={stats.available_representatives}
            icon={UserCheck}
            color="emerald"
            delay={50}
            trend="up"
            trendValue="جاهز"
          />
          <BentoStatCard
            title="مشغول"
            value={stats.busy_representatives}
            icon={Clock}
            color="orange"
            delay={100}
            trend="neutral"
            trendValue="يعمل"
          />
          <BentoStatCard
            title="المهام الحالية"
            value={stats.total_assignments}
            icon={Package}
            color="indigo"
            delay={150}
          />
          <BentoStatCard
            title="معدل الإنجاز"
            value={`${stats.completion_rate.toFixed(1)}%`}
            icon={Truck}
            color="purple"
            delay={200}
            trend="up"
            trendValue="معدل عالي"
          />
          <BentoStatCard
            title="نشط"
            value={stats.active_representatives}
            icon={Settings}
            color="slate"
            delay={250}
          />
        </div>
      )}

      {/* قائمة المندوبين - Bento Style */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-row items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            المندوبين
          </h3>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                إضافة مندوب
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة مندوب جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات المندوب الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="الاسم الكامل"
                  value={newRep.full_name}
                  onChange={(e) => setNewRep(prev => ({ ...prev, full_name: e.target.value }))}
                />
                <Input
                  placeholder="رقم الهاتف"
                  value={newRep.phone}
                  onChange={(e) => setNewRep(prev => ({ ...prev, phone: e.target.value }))}
                />
                <Input
                  placeholder="البريد الإلكتروني (اختياري)"
                  value={newRep.email}
                  onChange={(e) => setNewRep(prev => ({ ...prev, email: e.target.value }))}
                />
                <Input
                  placeholder="المنصب (اختياري)"
                  value={newRep.position}
                  onChange={(e) => setNewRep(prev => ({ ...prev, position: e.target.value }))}
                />
                <Select
                  value={newRep.representative_type}
                  onValueChange={(value) => setNewRep(prev => ({ ...prev, representative_type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="نوع المندوب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">توصيل</SelectItem>
                    <SelectItem value="technical">تقني</SelectItem>
                    <SelectItem value="administrative">إداري</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="الحد الأقصى للمهام"
                  type="number"
                  value={newRep.max_assignments}
                  onChange={(e) => setNewRep(prev => ({ ...prev, max_assignments: parseInt(e.target.value) || 5 }))}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  إلغاء
                </Button>
                <Button onClick={addRepresentative} disabled={!newRep.full_name || !newRep.phone}>
                  إضافة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="p-6">
          <ScrollArea className="h-[500px]">
            {representatives.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>لا يوجد مندوبين مضافين حالياً</p>
                <p className="text-sm">ابدأ بإضافة مندوب جديد</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {representatives.map((rep) => (
                  <div key={rep.representative_id}
                    className="cursor-pointer hover:bg-gray-100 transition-all duration-200 bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
                    onClick={() => selectRepresentative(rep)}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border border-gray-200">
                            <AvatarImage src="/avatars/default.png" />
                            <AvatarFallback>
                              {rep.full_name?.[0] || 'D'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-gray-900">{rep.full_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {getTypeText(rep.representative_type)}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{rep.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(rep.status)}`}></div>
                              <span className="text-sm">{getStatusText(rep.status)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {rep.current_assignments}/{rep.max_assignments} مهمة
                            </p>
                            <p className="text-xs text-muted-foreground">
                              تقييم: {rep.rating.toFixed(1)} ⭐
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-white hover:bg-gray-50 border-gray-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(rep.representative_id,
                                  rep.status === 'available' ? 'busy' : 'available'
                                );
                              }}
                            >
                              {rep.status === 'available' ? (
                                <Clock className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* نافذة تفاصيل المندوب */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          {selectedRep && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/avatars/default.png" />
                    <AvatarFallback>
                      {selectedRep.full_name?.[0] || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  {selectedRep.full_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* البيانات الشخصية */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">رقم الهاتف</label>
                    <p className="mt-1">{selectedRep.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</label>
                    <p className="mt-1">{selectedRep.email || 'غير محدد'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">المنصب</label>
                    <p className="mt-1">{selectedRep.position || 'غير محدد'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">نوع المندوب</label>
                    <p className="mt-1">{getTypeText(selectedRep.representative_type)}</p>
                  </div>
                </div>

                {/* الإحصائيات */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{selectedRep.total_deliveries}</p>
                    <p className="text-sm text-muted-foreground">إجمالي التوصيلات</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedRep.successful_deliveries}</p>
                    <p className="text-sm text-muted-foreground">نجح</p>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <p className="text-2xl font-bold text-red-600">{selectedRep.cancelled_deliveries}</p>
                    <p className="text-sm text-muted-foreground">ملغي</p>
                  </div>
                </div>

                {/* حالة المندوب */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedRep.status)}`}></div>
                    <span className="font-medium">{getStatusText(selectedRep.status)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(selectedRep.representative_id, 'available')}
                      disabled={selectedRep.status === 'available'}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      متوفر
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(selectedRep.representative_id, 'busy')}
                      disabled={selectedRep.status === 'busy'}
                    >
                      <Clock className="h-4 w-4 mr-1" />
                      مشغول
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateStatus(selectedRep.representative_id, 'offline')}
                      disabled={selectedRep.status === 'offline'}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      غير متصل
                    </Button>
                  </div>
                </div>

                {/* الطلبات المسندة */}
                <div className="border-t pt-6">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-600" />
                    الطلبات المسندة حديثاً ({repOrders.length})
                  </h4>

                  {loadingOrders ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                  ) : repOrders.length === 0 ? (
                    <div className="text-center p-6 bg-gray-50 rounded-xl border border-dashed text-gray-500">
                      لا توجد طلبات مسندة لهذا المندوب حالياً
                    </div>
                  ) : (
                    <ScrollArea className="h-64 border rounded-xl bg-gray-50/50">
                      <div className="p-4 space-y-3">
                        {repOrders.map(order => (
                          <div key={order.id} className="bg-white p-3 rounded-lg border flex items-center justify-between hover:border-purple-200 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg flex-shrink-0 ${order.role === 'pickup' ? 'bg-purple-100 text-purple-700' :
                                  order.role === 'delivery' ? 'bg-cyan-100 text-cyan-700' :
                                    order.role === 'both' ? 'bg-indigo-100 text-indigo-700' :
                                      'bg-gray-100 text-gray-700'
                                }`}>
                                <Truck className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900">#{order.order_number}</span>
                                  <Badge variant="outline" className="text-xs bg-gray-50">
                                    {order.clinic_name}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  <span>دور المندوب: {
                                    order.role === 'pickup' ? 'استلام' :
                                      order.role === 'delivery' ? 'توصيل' :
                                        order.role === 'both' ? 'استلام وتوصيل' : 'عام'
                                  }</span>
                                  <span>•</span>
                                  <span>{new Date(order.date).toLocaleDateString('ar-IQ')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="whitespace-nowrap">
                              <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 font-normal">
                                {getStatusText(order.status)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  إغلاق
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div >
  );
}