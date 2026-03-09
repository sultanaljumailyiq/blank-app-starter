// لوحة تحكم وإحصائيات مخطط الأسنان التفاعلي
// تاريخ الإنشاء: 2024-11-16

import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Clock, DollarSign, CheckCircle, AlertTriangle,
  Calendar, Users, Target, Activity, PieChart, LineChart, Award,
  Eye, Download, Share, Filter, Search, RefreshCw, Plus
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import TreatmentPlanApi, { TreatmentPlan, ToothData, TreatmentPlanService } from '../../services/treatmentPlanApi';

interface TreatmentChartDashboardProps {
  patientId: string;
  onViewTooth?: (toothNumber: number) => void;
  onViewPlan?: (planId: string) => void;
  className?: string;
}

// أنواع البيانات للإحصائيات
interface DashboardStats {
  // الإحصائيات العامة
  totalTeeth: number;
  healthyTeeth: number;
  needsTreatment: number;
  inProgress: number;
  completed: number;
  missing: number;
  
  // إحصائيات الخطط العلاجية
  totalPlans: number;
  activePlans: number;
  completedPlans: number;
  onHoldPlans: number;
  cancelledPlans: number;
  
  // إحصائيات التكلفة
  totalEstimatedCost: number;
  totalActualCost: number;
  totalPaid: number;
  totalOutstanding: number;
  averageCostPerTooth: number;
  
  // إحصائيات الوقت
  averageTreatmentDuration: number; // بالأيام
  longestTreatment: number; // بالأيام
  shortestTreatment: number; // بالأيام
  onTimeCompletions: number;
  delayedCompletions: number;
  
  // إحصائيات الأطباء
  doctorsPerformance: {
    doctorName: string;
    totalPatients: number;
    completedTreatments: number;
    averageSatisfaction: number;
    successRate: number;
  }[];
  
  // التوزيعات
  treatmentDistribution: {
    treatmentType: string;
    count: number;
    percentage: number;
    averageCost: number;
  }[];
  
  priorityDistribution: {
    priority: string;
    count: number;
    percentage: number;
  }[];
  
  // الاتجاهات الشهرية
  monthlyTrends: {
    month: string;
    newPlans: number;
    completedPlans: number;
    averageDuration: number;
    satisfactionScore: number;
  }[];
  
  // آخر الأنشطة
  recentActivities: {
    id: string;
    type: 'plan_created' | 'phase_completed' | 'session_completed' | 'plan_completed';
    description: string;
    date: string;
    user: string;
    toothNumber: number;
  }[];
}

export const TreatmentChartDashboard: React.FC<TreatmentChartDashboardProps> = ({
  patientId,
  onViewTooth,
  onViewPlan,
  className = ''
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedView, setSelectedView] = useState<'overview' | 'financial' | 'performance' | 'trends'>('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  // تحميل الإحصائيات
  useEffect(() => {
    loadDashboardStats();
  }, [patientId, selectedTimeRange, refreshKey]);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // الحصول على بيانات الأسنان والخطة
      const chartData = await TreatmentPlanApi.getToothChartData(patientId);
      const teeth = chartData.teeth;
      const allPlans = await TreatmentPlanService.getPatientTreatmentPlans(patientId);

      // حساب الإحصائيات
      const dashboardStats: DashboardStats = {
        // الإحصائيات العامة للأسنان
        totalTeeth: teeth.length,
        healthyTeeth: teeth.filter(t => t.condition === 'healthy').length,
        needsTreatment: teeth.filter(t => t.treatmentPlan?.overall_status === 'needs_treatment').length,
        inProgress: teeth.filter(t => t.treatmentPlan?.overall_status === 'in_progress').length,
        completed: teeth.filter(t => t.treatmentPlan?.overall_status === 'completed').length,
        missing: teeth.filter(t => t.condition === 'missing').length,
        
        // إحصائيات الخطط العلاجية
        totalPlans: allPlans.length,
        activePlans: allPlans.filter(p => ['planned', 'started', 'in_progress'].includes(p.status)).length,
        completedPlans: allPlans.filter(p => p.status === 'completed').length,
        onHoldPlans: allPlans.filter(p => p.status === 'on_hold').length,
        cancelledPlans: allPlans.filter(p => p.status === 'cancelled').length,
        
        // إحصائيات التكلفة
        totalEstimatedCost: allPlans.reduce((sum, p) => sum + (p.estimated_cost || 0), 0),
        totalActualCost: allPlans.reduce((sum, p) => sum + (p.actual_cost || 0), 0),
        totalPaid: allPlans.reduce((sum, p) => sum + (p.financial_status === 'paid' ? (p.actual_cost || p.estimated_cost || 0) : 0), 0),
        totalOutstanding: allPlans.reduce((sum, p) => sum + (p.estimated_cost || 0) - (p.financial_status === 'paid' ? (p.actual_cost || p.estimated_cost || 0) : 0), 0),
        averageCostPerTooth: allPlans.length > 0 ? allPlans.reduce((sum, p) => sum + (p.estimated_cost || 0), 0) / allPlans.length : 0,
        
        // إحصائيات الوقت
        averageTreatmentDuration: calculateAverageDuration(allPlans),
        longestTreatment: Math.max(...allPlans.map(p => calculateDurationDays(p)), 0),
        shortestTreatment: Math.min(...allPlans.map(p => calculateDurationDays(p)).filter(d => d > 0)),
        onTimeCompletions: allPlans.filter(p => p.status === 'completed' && p.actual_completion_date && p.estimated_completion_date && 
          new Date(p.actual_completion_date) <= new Date(p.estimated_completion_date)).length,
        delayedCompletions: allPlans.filter(p => p.status === 'completed' && p.actual_completion_date && p.estimated_completion_date && 
          new Date(p.actual_completion_date) > new Date(p.estimated_completion_date)).length,
        
        // أداء الأطباء (بيانات تجريبية)
        doctorsPerformance: calculateDoctorsPerformance(allPlans),
        
        // توزيع أنواع العلاج
        treatmentDistribution: calculateTreatmentDistribution(allPlans),
        
        // توزيع الأولويات
        priorityDistribution: calculatePriorityDistribution(allPlans),
        
        // الاتجاهات الشهرية (بيانات تجريبية)
        monthlyTrends: generateMonthlyTrends(),
        
        // الأنشطة الأخيرة (بيانات تجريبية)
        recentActivities: generateRecentActivities(allPlans)
      };

      setStats(dashboardStats);
    } catch (err) {
      setError('فشل في تحميل إحصائيات لوحة التحكم');
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // حساب متوسط مدة العلاج
  const calculateAverageDuration = (plans: TreatmentPlan[]): number => {
    const completedPlans = plans.filter(p => p.status === 'completed' && p.actual_completion_date && p.actual_start_date);
    if (completedPlans.length === 0) return 0;
    
    const totalDays = completedPlans.reduce((sum, plan) => {
      const start = new Date(plan.actual_start_date!);
      const end = new Date(plan.actual_completion_date!);
      return sum + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    
    return Math.round(totalDays / completedPlans.length);
  };

  // حساب مدة العلاج بالأيام
  const calculateDurationDays = (plan: TreatmentPlan): number => {
    if (!plan.actual_completion_date || !plan.actual_start_date) return 0;
    
    const start = new Date(plan.actual_start_date);
    const end = new Date(plan.actual_completion_date);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // حساب أداء الأطباء
  const calculateDoctorsPerformance = (plans: TreatmentPlan[]) => {
    const doctorsMap = new Map<string, {
      name: string;
      totalPatients: number;
      completedTreatments: number;
      satisfactionScores: number[];
      totalPlans: number;
    }>();

    plans.forEach(plan => {
      const doctor = plan.assigned_doctor;
      if (!doctorsMap.has(doctor)) {
        doctorsMap.set(doctor, {
          name: doctor,
          totalPatients: 0,
          completedTreatments: 0,
          satisfactionScores: [],
          totalPlans: 0
        });
      }

      const doctorData = doctorsMap.get(doctor)!;
      doctorData.totalPlans++;
      
      if (plan.status === 'completed') {
        doctorData.completedTreatments++;
        if (plan.patient_satisfaction) {
          doctorData.satisfactionScores.push(plan.patient_satisfaction);
        }
      }
    });

    return Array.from(doctorsMap.values()).map(data => ({
      doctorName: data.name,
      totalPatients: data.totalPatients,
      completedTreatments: data.completedTreatments,
      averageSatisfaction: data.satisfactionScores.length > 0 
        ? data.satisfactionScores.reduce((sum, score) => sum + score, 0) / data.satisfactionScores.length 
        : 0,
      successRate: data.totalPlans > 0 ? (data.completedTreatments / data.totalPlans) * 100 : 0
    }));
  };

  // حساب توزيع أنواع العلاج
  const calculateTreatmentDistribution = (plans: TreatmentPlan[]) => {
    const distributionMap = new Map<string, { count: number; totalCost: number }>();
    
    plans.forEach(plan => {
      const type = plan.treatment_type;
      if (!distributionMap.has(type)) {
        distributionMap.set(type, { count: 0, totalCost: 0 });
      }
      
      const data = distributionMap.get(type)!;
      data.count++;
      data.totalCost += plan.estimated_cost || 0;
    });

    return Array.from(distributionMap.entries()).map(([treatmentType, data]) => ({
      treatmentType,
      count: data.count,
      percentage: plans.length > 0 ? (data.count / plans.length) * 100 : 0,
      averageCost: data.count > 0 ? data.totalCost / data.count : 0
    }));
  };

  // حساب توزيع الأولويات
  const calculatePriorityDistribution = (plans: TreatmentPlan[]) => {
    const distributionMap = new Map<string, number>();
    
    plans.forEach(plan => {
      const priority = plan.priority;
      distributionMap.set(priority, (distributionMap.get(priority) || 0) + 1);
    });

    return Array.from(distributionMap.entries()).map(([priority, count]) => ({
      priority: priority === 'urgent' ? 'عاجل' : priority === 'high' ? 'عالي' : priority === 'medium' ? 'متوسط' : 'منخفض',
      count,
      percentage: plans.length > 0 ? (count / plans.length) * 100 : 0
    }));
  };

  // توليد الاتجاهات الشهرية (بيانات تجريبية)
  const generateMonthlyTrends = () => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
    return months.map((month, index) => ({
      month,
      newPlans: Math.floor(Math.random() * 10) + 5,
      completedPlans: Math.floor(Math.random() * 8) + 3,
      averageDuration: Math.floor(Math.random() * 30) + 15,
      satisfactionScore: Math.floor(Math.random() * 3) + 7
    }));
  };

  // توليد الأنشطة الأخيرة (بيانات تجريبية)
  const generateRecentActivities = (plans: TreatmentPlan[]) => {
    const activities = [];
    
    plans.slice(0, 5).forEach((plan, index) => {
      activities.push({
        id: `activity-${index}`,
        type: plan.status === 'completed' ? 'plan_completed' : 
              plan.status === 'in_progress' ? 'phase_completed' : 'plan_created',
        description: `${plan.treatment_type} للسن ${plan.tooth_number}`,
        date: new Date(Date.now() - index * 86400000).toISOString(),
        user: plan.assigned_doctor,
        toothNumber: plan.tooth_number
      });
    });

    return activities;
  };

  // دالة التنسيق
  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString()} د.ع`;
  };

  const formatPercentage = (percentage: number): string => {
    return `${Math.round(percentage)}%`;
  };

  // دالة التحديث
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="mr-3 text-gray-600">جاري تحميل الإحصائيات...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-8 ${className}`}>
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-gray-600 mb-4">{error || 'لم يتم العثور على بيانات'}</p>
          <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* رأس لوحة التحكم */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">لوحة تحكم مخطط الأسنان التفاعلي</h2>
            <p className="text-blue-100">إحصائيات شاملة للخطط العلاجية والتقدم العام</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50"
            >
              <option value="week" className="text-gray-900">الأسبوع</option>
              <option value="month" className="text-gray-900">الشهر</option>
              <option value="quarter" className="text-gray-900">الربع</option>
              <option value="year" className="text-gray-900">السنة</option>
            </select>
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              تحديث
            </Button>
          </div>
        </div>
      </div>

      {/* اختيار نوع العرض */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: 'نظرة عامة', icon: Eye },
            { id: 'financial', label: 'المالية', icon: DollarSign },
            { id: 'performance', label: 'الأداء', icon: TrendingUp },
            { id: 'trends', label: 'الاتجاهات', icon: LineChart }
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setSelectedView(tab.id as any)}
              variant={selectedView === tab.id ? 'primary' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* البطاقات الإحصائية الرئيسية */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* إجمالي الأسنان */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">إجمالي الأسنان</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTeeth}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">سليمة: {stats.healthyTeeth}</span>
                <span className="text-gray-500">{formatPercentage((stats.healthyTeeth / stats.totalTeeth) * 100)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">تحتاج علاج: {stats.needsTreatment}</span>
                <span className="text-gray-500">{formatPercentage((stats.needsTreatment / stats.totalTeeth) * 100)}</span>
              </div>
            </div>
          </Card>

          {/* الخطط العلاجية */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">الخطط العلاجية</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPlans}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">نشطة: {stats.activePlans}</span>
                <span className="text-gray-500">{formatPercentage((stats.activePlans / stats.totalPlans) * 100)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">مكتملة: {stats.completedPlans}</span>
                <span className="text-gray-500">{formatPercentage((stats.completedPlans / stats.totalPlans) * 100)}</span>
              </div>
            </div>
          </Card>

          {/* التكلفة الإجمالية */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">التكلفة الإجمالية</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEstimatedCost)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">مدفوعة: {formatCurrency(stats.totalPaid)}</span>
                <span className="text-gray-500">{formatPercentage((stats.totalPaid / stats.totalEstimatedCost) * 100)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-orange-600">معلقة: {formatCurrency(stats.totalOutstanding)}</span>
                <span className="text-gray-500">{formatPercentage((stats.totalOutstanding / stats.totalEstimatedCost) * 100)}</span>
              </div>
            </div>
          </Card>

          {/* متوسط مدة العلاج */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">متوسط المدة</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageTreatmentDuration} يوم</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">أقصر: {stats.shortestTreatment || 0} يوم</span>
                <span className="text-gray-500">-</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">أطول: {stats.longestTreatment} يوم</span>
                <span className="text-gray-500">-</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* العرض المالي */}
      {selectedView === 'financial' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* التكاليف والإيرادات */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">التحليل المالي</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">إجمالي التكلفة المقدرة</span>
                <span className="font-bold text-gray-900">{formatCurrency(stats.totalEstimatedCost)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700">إجمالي التكلفة الفعلية</span>
                <span className="font-bold text-blue-600">{formatCurrency(stats.totalActualCost)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700">المبالغ المدفوعة</span>
                <span className="font-bold text-green-600">{formatCurrency(stats.totalPaid)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-gray-700">المبالغ المعلقة</span>
                <span className="font-bold text-red-600">{formatCurrency(stats.totalOutstanding)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-gray-700">متوسط تكلفة السن</span>
                <span className="font-bold text-purple-600">{formatCurrency(stats.averageCostPerTooth)}</span>
              </div>
            </div>
          </Card>

          {/* توزيع التكاليف */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع تكاليف العلاج</h3>
            <div className="space-y-3">
              {stats.treatmentDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">{item.treatmentType}</span>
                    <span className="text-sm font-medium">{formatCurrency(item.averageCost)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{formatPercentage(item.percentage)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* عرض الأداء */}
      {selectedView === 'performance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* أداء الأطباء */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">أداء الأطباء</h3>
            <div className="space-y-4">
              {stats.doctorsPerformance.map((doctor, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{doctor.doctorName}</h4>
                    <span className="text-sm text-gray-500">{doctor.totalPatients} مريض</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">معدل النجاح:</span>
                      <span className="font-medium text-green-600 mr-2">{formatPercentage(doctor.successRate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">رضا المرضى:</span>
                      <span className="font-medium text-blue-600 mr-2">{doctor.averageSatisfaction.toFixed(1)}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* توزيع الأولويات */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">توزيع الأولويات</h3>
            <div className="space-y-3">
              {stats.priorityDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-700">{item.priority}</span>
                    <span className="text-sm font-medium">{item.count} خطة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          item.priority === 'عاجل' ? 'bg-red-600' :
                          item.priority === 'عالي' ? 'bg-orange-500' :
                          item.priority === 'متوسط' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{formatPercentage(item.percentage)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* عرض الاتجاهات */}
      {selectedView === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الاتجاهات الشهرية */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">الاتجاهات الشهرية</h3>
            <div className="space-y-4">
              {stats.monthlyTrends.map((month, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">{month.month}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">خطط جديدة:</span>
                      <span className="font-medium text-blue-600">{month.newPlans}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">مكتملة:</span>
                      <span className="font-medium text-green-600">{month.completedPlans}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">متوسط المدة:</span>
                      <span className="font-medium text-orange-600">{month.averageDuration} يوم</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الرضا:</span>
                      <span className="font-medium text-purple-600">{month.satisfactionScore}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* الأنشطة الأخيرة */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">آخر الأنشطة</h3>
            <div className="space-y-3">
              {stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {activity.type === 'plan_created' ? <Plus className="w-4 h-4 text-blue-600" /> :
                     activity.type === 'phase_completed' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                     activity.type === 'session_completed' ? <Calendar className="w-4 h-4 text-purple-600" /> :
                     <Award className="w-4 h-4 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      بواسطة {activity.user} • {new Date(activity.date).toLocaleDateString('ar-IQ')}
                    </p>
                  </div>
                  <span className="text-xs text-blue-600 font-medium">السن {activity.toothNumber}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* أزرار الإجراءات السريعة */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => onViewTooth && onViewTooth(-1)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            عرض مخطط الأسنان
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            تصدير التقرير
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Share className="w-4 h-4" />
            مشاركة الإحصائيات
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            تصفية متقدمة
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TreatmentChartDashboard;
