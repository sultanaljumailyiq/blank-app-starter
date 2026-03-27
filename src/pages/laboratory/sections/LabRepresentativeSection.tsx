import React, { useState, useEffect } from 'react';
import {
  User, MapPin, Phone, Mail, Clock, CheckCircle, XCircle,
  Truck, AlertTriangle, Star, Edit, Plus, Eye,
  Building2, Receipt, Navigation, Users
} from 'lucide-react';
import { Modal } from '../../../components/common/Modal';
import { supabase } from '../../../lib/supabase';
import { formatCurrency } from '../../../lib/utils';

interface Representative {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'onRoute' | 'offline';
  specialties: string[];
  avatar?: string;
  lastUpdate: string;
  currentLocation?: string;
  totalDeliveries: number;
  rating: number;
  joinDate: string;
  workingHours: {
    start: string;
    end: string;
    days: string[];
  };
  performanceMetrics: {
    totalDeliveries: number;
    onTimeDeliveries: number;
    customerRating: number;
    monthlyTargets: number;
    completedTargets: number;
  };
  commissionRate: number;
  region: string;
  type?: 'driver' | 'technician' | 'manager' | 'other';
  position?: string;
}

interface DeliveryTask {
  id: string;
  orderNumber: string;
  clinicName: string;
  patientName: string;
  address: string;
  priority: 'عاجلة' | 'عالية' | 'عادية';
  status: 'assigned' | 'inTransit' | 'delivered' | 'failed';
  estimatedTime: string;
  actualTime?: string;
  cost: number;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export const LabRepresentativeSection: React.FC = () => {
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [deliveryTasks, setDeliveryTasks] = useState<DeliveryTask[]>([]);
  const [selectedRepresentative, setSelectedRepresentative] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRepresentative, setEditingRepresentative] = useState<Representative | null>(null);

  useEffect(() => {
    fetchRepresentativeData();
  }, []);

  const fetchRepresentativeData = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // بيانات افتراضية للمندوبين
        const mockRepresentatives: Representative[] = [
          {
            id: '1',
            name: 'محمد أحمد علي',
            phone: '+964123456789',
            email: 'mohammed@lab.iq',
            status: 'available',
            specialties: ['تسليم الأشعة', 'استلام العينات'],
            currentLocation: 'المقر الرئيسي - بغداد',
            lastUpdate: '2025-11-16 10:30',
            totalDeliveries: 245,
            rating: 4.8,
            joinDate: '2024-03-15',
            workingHours: {
              start: '08:00',
              end: '18:00',
              days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
            },
            performanceMetrics: {
              totalDeliveries: 245,
              onTimeDeliveries: 232,
              customerRating: 4.8,
              monthlyTargets: 50,
              completedTargets: 43
            },
            commissionRate: 8.5,
            region: 'بغداد - الكرادة'
          },
          {
            id: '2',
            name: 'علي حسن محمود',
            phone: '+964987654321',
            email: 'ali@lab.iq',
            status: 'onRoute',
            specialties: ['تسليم التقارير', 'خدمة العملاء'],
            currentLocation: 'حي الكرادة - بغداد',
            lastUpdate: '2025-11-16 11:15',
            totalDeliveries: 189,
            rating: 4.6,
            joinDate: '2024-06-01',
            workingHours: {
              start: '09:00',
              end: '17:00',
              days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
            },
            performanceMetrics: {
              totalDeliveries: 189,
              onTimeDeliveries: 175,
              customerRating: 4.6,
              monthlyTargets: 45,
              completedTargets: 38
            },
            commissionRate: 7.8,
            region: 'بغداد - الأعظمية'
          },
          {
            id: '3',
            name: 'سارة محمد عبد الله',
            phone: '+964778888999',
            email: 'sara@lab.iq',
            status: 'busy',
            specialties: ['تركيبات سريعة', 'ترميمات عاجلة'],
            currentLocation: 'شارع فلسطين - بغداد',
            lastUpdate: '2025-11-16 10:45',
            totalDeliveries: 312,
            rating: 4.9,
            joinDate: '2024-01-10',
            workingHours: {
              start: '07:00',
              end: '19:00',
              days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'السبت']
            },
            performanceMetrics: {
              totalDeliveries: 312,
              onTimeDeliveries: 298,
              customerRating: 4.9,
              monthlyTargets: 60,
              completedTargets: 52
            },
            commissionRate: 9.2,
            region: 'بغداد - الكاظمية'
          }
        ];

        const mockTasks: DeliveryTask[] = [
          {
            id: '1',
            orderNumber: 'LAB-2024-001',
            clinicName: 'عيادة د. سارة أحمد',
            patientName: 'أحمد محمد العلي',
            address: 'شارع حيفا، الكرادة، بغداد',
            priority: 'عادية',
            status: 'assigned',
            estimatedTime: '30 دقيقة',
            cost: 15000,
            createdAt: '2025-11-16 10:00'
          },
          {
            id: '2',
            orderNumber: 'LAB-2024-002',
            clinicName: 'عيادة د. محمد السبعاوي',
            patientName: 'فاطمة حسن إبراهيم',
            address: 'شارع فلسطين، الأعظمية، بغداد',
            priority: 'عالية',
            status: 'inTransit',
            estimatedTime: '45 دقيقة',
            cost: 20000,
            createdAt: '2025-11-16 09:30',
            notes: 'تسليم عاجل - اتصال مسبق مطلوب'
          },
          {
            id: '3',
            orderNumber: 'LAB-2024-003',
            clinicName: 'عيادة د. علي النجار',
            patientName: 'خالد أحمد محمود',
            address: 'شارع النضال، الكاظمية، بغداد',
            priority: 'عادية',
            status: 'delivered',
            estimatedTime: '60 دقيقة',
            actualTime: '55 دقيقة',
            cost: 18000,
            createdAt: '2025-11-15 14:00',
            completedAt: '2025-11-15 14:55'
          }
        ];

        setRepresentatives(mockRepresentatives);
        setDeliveryTasks(mockTasks);
        setSelectedRepresentative(mockRepresentatives[0].id);
        return;
      }

      // Fetch Real Data
      // 1. Get Lab ID
      const { data: labData, error: labError } = await supabase
        .from('dental_laboratories')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (labError) throw labError;
      if (!labData) return; // No lab profile found

      // 2. Fetch Representatives
      const { data: repsData, error: repsError } = await supabase
        .from('dental_lab_representatives')
        .select('*')
        .eq('lab_id', labData.id);

      if (repsError) throw repsError;

      if (repsData) {
        setRepresentatives(repsData.map(rep => ({
          id: rep.id,
          name: rep.name,
          phone: rep.phone,
          email: rep.email,
          status: rep.status || 'offline',
          specialties: rep.specialties || [],
          avatar: rep.avatar,
          currentLocation: rep.region || 'غير محدد', // Map region to location for now
          lastUpdate: rep.updated_at || new Date().toISOString(),
          totalDeliveries: rep.total_deliveries || 0,
          rating: rep.rating || 5.0,
          joinDate: rep.created_at,
          workingHours: rep.working_hours || { start: '09:00', end: '17:00', days: [] },
          performanceMetrics: {
            totalDeliveries: rep.total_deliveries || 0,
            onTimeDeliveries: 0, // Mock or fetch detailed stats if available
            customerRating: rep.rating || 5.0,
            monthlyTargets: 0,
            completedTargets: 0
          },
          commissionRate: rep.commission_rate || 0,
          region: rep.region,
          type: rep.type,
          position: rep.position
        })));
      }

      // 3. Fetch Tasks (Optional for now, keep mock or empty)
      // setDeliveryTasks([]);

    } catch (error) {
      console.error('خطأ في جلب بيانات المندوبين:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'bg-green-100 text-green-700 hover:bg-green-200',
      busy: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      onRoute: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      offline: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    };
    return colors[status as keyof typeof colors] || colors.offline;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-3 h-3" />;
      case 'busy':
        return <Clock className="w-3 h-3" />;
      case 'onRoute':
        return <Truck className="w-3 h-3" />;
      case 'offline':
        return <XCircle className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getStatusText = (status: string) => {
    const texts = {
      available: 'متوفر',
      busy: 'مشغول',
      onRoute: 'في الطريق',
      offline: 'غير متصل'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getTaskStatusColor = (status: string) => {
    const colors = {
      assigned: 'bg-yellow-100 text-yellow-700',
      inTransit: 'bg-blue-100 text-blue-700',
      delivered: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700'
    };
    return colors[status as keyof typeof colors] || colors.assigned;
  };

  const getTaskStatusText = (status: string) => {
    const texts = {
      assigned: 'مُسندة',
      inTransit: 'في النقل',
      delivered: 'تم التسليم',
      failed: 'فشل في التسليم'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'عاجلة':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'عالية':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };



  // دوال إدارة تعديل المندوبين
  const handleEditRepresentative = (rep: Representative) => {
    setEditingRepresentative(rep);
    setShowEditModal(true);
  };

  const handleDeleteRepresentative = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المندوب؟ لا يمكن التراجع عن هذا الإجراء.')) {
      try {
        const { error } = await supabase
          .from('dental_lab_representatives')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setRepresentatives(prev => prev.filter(r => r.id !== id));
        setEditingRepresentative(null);
        setShowEditModal(false);
      } catch (err) {
        console.error('Error deleting representative:', err);
        // Optional: Add toast error here
      }
    }
  };

  const handleSaveRepresentative = async (updatedRep: Partial<Representative>) => {
    if (editingRepresentative) {
      try {
        setLoading(true);
        // Prepare DB payload
        const updates: any = {
          name: updatedRep.name,
          phone: updatedRep.phone,
          email: updatedRep.email,
          status: updatedRep.status,
          avatar: updatedRep.avatar,
          type: updatedRep.type,
          position: updatedRep.position,
          region: updatedRep.region,
          specialties: updatedRep.specialties,
          commission_rate: updatedRep.commissionRate,
          // working_hours: updatedRep.workingHours // If DB supports JSON
        };

        const { error } = await supabase
          .from('dental_lab_representatives')
          .update(updates)
          .eq('id', editingRepresentative.id);

        if (error) throw error;

        setRepresentatives(prev => prev.map(rep =>
          rep.id === editingRepresentative.id
            ? {
              ...rep,
              ...updatedRep,
              rating: updatedRep.performanceMetrics?.customerRating || rep.rating,
              joinDate: rep.joinDate,
              lastUpdate: new Date().toISOString().replace('T', ' ').split('.')[0],
              totalDeliveries: updatedRep.performanceMetrics?.totalDeliveries || rep.totalDeliveries
            }
            : rep
        ));

        // Update selected rep if it was the one edited
        if (selectedRepresentative === editingRepresentative.id) {
          // Force refresh or just rely on state sync
        }

      } catch (err) {
        console.error('Error updating representative:', err);
        alert('حدث خطأ أثناء حفظ التغييرات');
      } finally {
        setLoading(false);
        setShowEditModal(false);
        setEditingRepresentative(null);
      }
    }
  };

  const calculateStats = () => {
    const totalTasks = deliveryTasks.length;
    const completedTasks = deliveryTasks.filter(t => t.status === 'delivered').length;
    const activeTasks = deliveryTasks.filter(t => t.status === 'assigned' || t.status === 'inTransit').length;
    const totalRevenue = deliveryTasks
      .filter(t => t.status === 'delivered')
      .reduce((sum, t) => sum + t.cost, 0);

    return {
      totalTasks,
      completedTasks,
      activeTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      totalRevenue
    };
  };

  const stats = calculateStats();
  const selectedRep = representatives.find(r => r.id === selectedRepresentative);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-24 -mb-24 transition-transform group-hover:scale-125 duration-700 blur-xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/10 group-hover:rotate-6 transition-transform duration-300">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 tracking-tight">إدارة المندوبين</h1>
              <p className="text-purple-100 text-lg opacity-90 max-w-2xl leading-relaxed">
                إدارة فريق التوصيل والتسليم، تتبع المهام، وإدارة حالة المندوبين لضمان أفضل خدمة
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-lg">
            <div className="text-center border-l border-white/20 pl-6">
              <div className="text-3xl font-bold mb-1">{representatives.length}</div>
              <div className="text-purple-100 text-sm font-medium">مندوب نشط</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">{representatives.filter(r => r.status === 'available').length}</div>
              <div className="text-purple-100 text-sm font-medium">متاح للطلب</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'إجمالي المهام', value: stats.totalTasks, icon: Receipt, color: 'indigo' },
          { label: 'مهام مكتملة', value: stats.completedTasks, icon: CheckCircle, color: 'green' },
          { label: 'مهام نشطة', value: stats.activeTasks, icon: Truck, color: 'blue' },
          { label: 'معدل الإنجاز', value: `${stats.completionRate}%`, icon: Navigation, color: 'purple' },
          { label: 'إجمالي الإيرادات', value: formatCurrency(stats.totalRevenue), icon: Receipt, color: 'orange' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group duration-300 hover:-translate-y-1`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`text-${stat.color}-600 bg-${stat.color}-50 px-3 py-1 rounded-full text-xs font-bold`}>
                {stat.label}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Representatives List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  المندوبين
                </h3>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all text-sm font-bold shadow-md hover:shadow-lg active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  إضافة
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[600px]">
              {representatives.map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => setSelectedRepresentative(rep.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all group ${selectedRepresentative === rep.id
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm transition-transform group-hover:scale-105 ${selectedRepresentative === rep.id ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                        {rep.name.charAt(0)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${rep.status === 'available' ? 'bg-green-500' : rep.status === 'busy' ? 'bg-orange-500' : rep.status === 'onRoute' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-gray-900 truncate text-base">{rep.name}</h4>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${getStatusColor(rep.status)}`}>
                          {getStatusIcon(rep.status)}
                          <span>{getStatusText(rep.status)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-lg">
                          <Star className="w-3 h-3 fill-current" />
                          {rep.rating}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[150px]">
                          {rep.currentLocation || 'غير محدد'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Representative Details & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRep ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Representative Profile */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-gray-50 to-gray-100"></div>
                <div className="relative flex flex-col md:flex-row gap-8 items-start">
                  <div className="w-24 h-24 bg-white p-1 rounded-[2rem] shadow-lg -mt-4 mx-auto md:mx-0">
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-indigo-100 rounded-[1.8rem] flex items-center justify-center text-3xl font-bold text-purple-600">
                      {selectedRep.name.charAt(0)}
                    </div>
                  </div>

                  <div className="flex-1 w-full text-center md:text-right pt-2 md:pt-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedRep.name}</h3>
                        <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${getStatusColor(selectedRep.status)}`}>
                            {getStatusIcon(selectedRep.status)}
                            <span>{getStatusText(selectedRep.status)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl">
                            <Star className="w-4 h-4 fill-current" />
                            <span>{selectedRep.rating} تقييم عام</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleEditRepresentative(selectedRep)}
                        className="flex items-center gap-2 px-6 py-2.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors font-bold self-center md:self-start"
                      >
                        <Edit className="w-4 h-4" />
                        تعديل الملف
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          معلومات الاتصال
                        </h4>
                        <div className="bg-gray-50 rounded-2xl p-4 space-y-3 border border-gray-100">
                          <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="font-medium font-numeric text-sm" dir="ltr">{selectedRep.phone}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                              <Mail className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="font-medium text-sm">{selectedRep.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-gray-600">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                              <MapPin className="w-4 h-4 text-gray-400" />
                            </div>
                            <span className="font-medium text-sm">{selectedRep.currentLocation || 'غير محدد'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                          <Receipt className="w-4 h-4" />
                          الأداء الشهري
                        </h4>
                        <div className="bg-gray-50 rounded-2xl p-4 space-y-4 border border-gray-100">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-600">الهدف الشهري</span>
                              <span className="font-bold text-purple-600">
                                {selectedRep.performanceMetrics.completedTargets}/{selectedRep.performanceMetrics.monthlyTargets}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500 relative"
                                style={{
                                  width: `${Math.min((selectedRep.performanceMetrics.completedTargets / selectedRep.performanceMetrics.monthlyTargets) * 100, 100)}%`
                                }}
                              >
                                <div className="absolute top-0 right-0 bottom-0 w-full animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-white p-3 rounded-xl text-center shadow-sm">
                              <div className="text-xs text-gray-500 mb-1">نسبة الالتزام</div>
                              <div className="font-bold text-green-600">
                                {Math.round((selectedRep.performanceMetrics.onTimeDeliveries / selectedRep.totalDeliveries) * 100)}%
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded-xl text-center shadow-sm">
                              <div className="text-xs text-gray-500 mb-1">تسليمات ناجحة</div>
                              <div className="font-bold text-blue-600">
                                {selectedRep.performanceMetrics.onTimeDeliveries}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        التخصصات والمهارات
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRep.specialties.map((specialty, index) => (
                          <span key={index} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium shadow-sm hover:border-purple-300 hover:text-purple-600 transition-colors">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Tasks */}
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5 text-indigo-600" />
                    </div>
                    المهام والطلبات الحالية
                  </h3>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all text-sm font-bold shadow-md hover:shadow-lg active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    مهمة جديدة
                  </button>
                </div>

                <div className="space-y-4">
                  {deliveryTasks
                    .filter(task => task.status === 'assigned' || task.status === 'inTransit')
                    .map((task) => (
                      <div key={task.id} className="group border border-gray-100 bg-gray-50/30 rounded-2xl p-5 hover:bg-white hover:border-purple-100 hover:shadow-md transition-all duration-300">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="font-bold text-gray-900 text-lg">{task.orderNumber}</h4>
                              <div className="flex items-center gap-1.5 bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm">
                                {getPriorityIcon(task.priority)}
                                <span className="text-xs font-bold text-gray-600">{task.priority}</span>
                              </div>
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getTaskStatusColor(task.status)}`}>
                                {getTaskStatusText(task.status)}
                              </span>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{task.clinicName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{task.patientName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="font-medium">{task.address}</span>
                              </div>
                            </div>

                            {task.notes && (
                              <div className="flex items-start gap-2 text-sm text-orange-800 bg-orange-50 p-3 rounded-xl border border-orange-100/50">
                                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span className="font-medium">{task.notes}</span>
                              </div>
                            )}
                          </div>

                          <div className="text-right flex flex-col items-end min-w-[120px]">
                            <div className="text-xl font-bold text-purple-600 mb-1">{formatCurrency(task.cost)}</div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-lg border border-gray-100 shadow-sm mb-4">
                              <Clock className="w-3.5 h-3.5" />
                              {task.estimatedTime}
                            </div>

                            <div className="flex gap-2 w-full md:w-auto mt-auto">
                              <button className="p-2 text-gray-400 hover:text-purple-600 bg-white hover:bg-purple-50 rounded-xl border border-gray-200 hover:border-purple-200 transition-all shadow-sm">
                                <Eye className="w-5 h-5" />
                              </button>
                              {task.status === 'assigned' && (
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold text-sm shadow-md">
                                  <Truck className="w-4 h-4" />
                                  بدء النقل
                                </button>
                              )}
                              {task.status === 'inTransit' && (
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-bold text-sm shadow-md">
                                  <CheckCircle className="w-4 h-4" />
                                  تأكيد التسليم
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {deliveryTasks.filter(task => task.status === 'assigned' || task.status === 'inTransit').length === 0 && (
                  <div className="text-center py-16 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Truck className="w-10 h-10 text-gray-300" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">لا توجد مهام حالياً</h4>
                    <p className="text-gray-500 font-medium">جميع المهام مكتملة أو لا توجد مهام مسندة لهذا المندوب</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-white rounded-[2rem] border border-gray-200 border-dashed p-12 text-center">
              <div>
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">اختر مندوباً للعرض</h3>
                <p className="text-gray-500 max-w-sm mx-auto">قم باختيار أحد المندوبين من القائمة الجانبية لعرض التفاصيل الكاملة والمهام المسندة إليه.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Representative Modal */}
      {editingRepresentative && (
        <EditRepresentativeModal
          representative={editingRepresentative}
          onSave={handleSaveRepresentative}
          onDelete={handleDeleteRepresentative}
          onClose={() => {
            setShowEditModal(false);
            setEditingRepresentative(null);
          }}
        />
      )}
    </div>
  );
};

// مكون موديل تعديل المندوب
interface EditRepresentativeModalProps {
  representative: Representative;
  onSave: (rep: Partial<Representative>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const EditRepresentativeModal: React.FC<EditRepresentativeModalProps> = ({
  representative,
  onSave,
  onDelete,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: representative.name,
    phone: representative.phone,
    email: representative.email,
    status: representative.status,
    specialties: representative.specialties,
    currentLocation: representative.currentLocation || '',
    workingHours: representative.workingHours,
    performanceMetrics: representative.performanceMetrics,
    commissionRate: representative.commissionRate,
    region: representative.region,
    type: representative.type || 'driver',
    position: representative.position || '',
    avatar: representative.avatar
  });

  const [newSpecialty, setNewSpecialty] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone && formData.email) {
      onSave(formData as any);
    }
  };

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="تعديل معلومات المندوب"
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* المعلومات الشخصية */}
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            المعلومات الشخصية
          </h4>

          {/* Image Upload */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 hover:border-purple-500 transition-colors">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">صورة الملف الشخصي</p>
              <p className="text-xs text-gray-500">انقر لتغيير الصورة (JPG, PNG)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                نوع المندوب
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
              >
                <option value="driver">سائق</option>
                <option value="technician">فني</option>
                <option value="manager">مدير</option>
                <option value="other">آخر</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                المنصب الوظيفي
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                placeholder="مثال: مسؤول التوصيل الأول"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                الاسم الكامل *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                رقم الهاتف *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                البريد الإلكتروني *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                المنطقة / الموقع
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            الحالة والتخصصات
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                حالة المندوب
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
              >
                <option value="available">متوفر</option>
                <option value="busy">مشغول</option>
                <option value="onRoute">في الطريق</option>
                <option value="offline">غير متصل</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                نسبة العمولة (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.commissionRate}
                onChange={(e) => setFormData(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              التخصصات
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="أضف تخصص جديد..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialty())}
              />
              <button
                type="button"
                onClick={addSpecialty}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold transition-colors"
              >
                إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specialties.map((specialty, index) => (
                <span key={index} className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold border border-purple-100">
                  {specialty}
                  <button
                    type="button"
                    onClick={() => removeSpecialty(specialty)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            className="flex-1 bg-purple-600 text-white py-3.5 px-6 rounded-xl hover:bg-purple-700 transition-all font-bold shadow-lg shadow-purple-200"
          >
            حفظ التغييرات
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-3.5 px-6 rounded-xl hover:bg-gray-200 transition-all font-bold"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => onDelete(representative.id)}
            className="flex-1 bg-red-50 text-red-600 py-3.5 px-6 rounded-xl hover:bg-red-100 transition-all font-bold border border-red-200"
          >
            حذف المندوب
          </button>
        </div>
      </form>
    </Modal>
  );
};