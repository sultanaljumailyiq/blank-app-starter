import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCurrentClinic } from '../../../hooks/useCurrentClinic';
import { supabase } from '../../../lib/supabase';
import {
  User, Phone, Mail, MapPin, Calendar, Activity,
  FileText, Eye, ChevronRight, Share2, Printer, MoreVertical,
  Plus, Search, Filter, ShieldCheck, AlertCircle, CheckCircle,
  X, DollarSign, Brain, Sparkles, Send, ImageIcon, ExternalLink, Trash2,
  Minus, ChevronLeft, Settings as SettingsIcon, Save, Edit2, Archive,
  HeartPulse, Syringe, Pill, Star, Beaker, History as HistoryIcon,
  MessageSquare, Upload, RefreshCcw, Info, ArrowRight, AlertTriangle,
  TrendingUp, TrendingDown, CreditCard, Wallet, Receipt, HandCoins,
  CheckSquare, AlertOctagon, Edit, Clock
} from 'lucide-react';

import { ComprehensiveTransactionModal } from '../../../components/finance/ComprehensiveTransactionModal';
import { toast } from 'sonner';

import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { TeethChart } from '../../../components/treatment/TeethChart';
import { ToothInteractionModal } from '../../../components/treatment/ToothInteractionModal';
import { TreatmentSessionManager } from '../../../components/treatment/TreatmentSessionManagerV2';
import { ToothCondition, TreatmentPlan, TreatmentSession } from '../../../types/treatment';
import { usePatient } from '../../../hooks/usePatient';
import { usePatientTreatments } from '../../../hooks/usePatientTreatments';
import { useAppointments } from '../../../hooks/useAppointments';
import { useFinance } from '../../../hooks/useFinance';
import { useTreatments, TreatmentService } from '../../../hooks/useTreatments';
import { formatDate } from '../../../lib/utils';
import { Modal } from '../../../components/common/Modal';
import { useLabs } from '../../../hooks/useLabs';
import { useLabOrders } from '../../../hooks/useLabOrders';
import { useAuth } from '../../../contexts/AuthContext';
import { useAIAnalysis } from '../../../hooks/useAIAnalysis';
import { ImageUploadZone } from '../../../components/ai/ImageUploadZone';
import { AnalysisResultCard } from '../../../components/ai/AnalysisResultCard';
import { PatientImageGallery } from '../../../components/patient/PatientImageGallery';
import { SmartAssistantChat } from '../../../components/ai/SmartAssistantChat';
import { useStorage } from '../../../hooks/useStorage';
import { ImageEditorModal } from '../../../components/common/ImageEditorModal';
import { FilePreviewModal } from '../../../components/common/FilePreviewModal';
import { CreateOrderModal } from './sections/components/CreateOrderModal';
import { GeneralTreatmentModal } from '../../../components/treatment/GeneralTreatmentModal'; // Import New Modal
import { ToothConditionModal } from '../../../components/treatment/ToothConditionModal'; // Added
import { AppointmentModal } from '../../../components/appointments/AppointmentModal';
import { Appointment } from '../../../types/appointments';
import { appointmentStatuses, appointmentTypes } from '../../../data/mock/appointments';

interface FileItem {
  id: string;
  name: string;
  type: 'xray' | 'report' | 'prescription' | 'lab';
  date: string;
  size: string;
  url?: string;
}

export const ClinicPatientProfile = () => {
  const { patientId, clinicId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'overview' | 'treatment' | 'medical' | 'smart' | 'archive' | 'finance' | 'settings'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsPopupOpen, setIsDetailsPopupOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'general' | 'treatment'>('general');
  const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false); // New State for General Modal
  const [selectedTooth, setSelectedTooth] = useState<ToothCondition | null>(null);

  // New Multi-Tooth States
  const [isToothSelectionMode, setIsToothSelectionMode] = useState(false);
  const [selectedTeethNumbers, setSelectedTeethNumbers] = useState<number[]>([]);
  const [isSelectedTeethModalOpen, setIsSelectedTeethModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);

  // Edit State - Removed isEditingHistory and tempVitals for auto-save
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // AI & Analysis State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileToAnalyze, setFileToAnalyze] = useState<File | null>(null);
  const [analysisNotes, setAnalysisNotes] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Lab State
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [selectedLabPlan, setSelectedLabPlan] = useState<TreatmentPlan | null>(null);

  // Other UI State
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  // Finance State
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [financeModalType, setFinanceModalType] = useState<'income' | 'expense'>('income');
  const [selectedFinancePlanId, setSelectedFinancePlanId] = useState<string | null>(null);
  const [selectedFinanceSessionId, setSelectedFinanceSessionId] = useState<string | null>(null);
  const [financeAmount, setFinanceAmount] = useState<number>(0);

  // --- HOOKS & DATA ---
  const { user } = useAuth();
  const { clinic: currentClinic } = useCurrentClinic();

  // Use param ID (preferred) or found clinic ID
  const effectiveClinicId = clinicId || currentClinic?.id || '';

  // Restore original hook signature
  const { patient, loading: patientLoading, error, updatePatientProfile } = usePatient(patientId);
  // Restore original hook signature
  const { appointments, createAppointment, refresh: refreshAppointments } = useAppointments(effectiveClinicId ? effectiveClinicId.toString() : undefined);
  const { transactions, addTransaction } = useFinance(effectiveClinicId ? effectiveClinicId.toString() : undefined, patientId);
  const { uploadFile, loading: fileUploading, error: uploadError } = useStorage();

  // Lab Hooks
  const { labs, savedLabs } = useLabs({ clinicId: effectiveClinicId });
  const { createOrder: submitOrder } = useLabOrders();
  const allLabs = [...(savedLabs || []), ...(labs || [])];

  // Treatments for Tooth Interaction Modal
  const { treatments: clinicTreatments } = useTreatments(effectiveClinicId);

  // Patient Treatments Data (Teeth Conditions & Plans)
  const {
    teeth: patientTeeth,
    treatmentPlans,
    updateTooth,
    addPlan,
    updateSession,
    completeSession,
    deletePlan,
    updatePlan,
    loading: treatmentsLoading
  } = usePatientTreatments(patientId);

  // Files State - DB Backed
  const [files, setFiles] = useState<FileItem[]>([]);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, string>>({});
  const [financePrefillData, setFinancePrefillData] = useState<any>(null); // New state for pre-filling modal

  // Appointment Modal State
  // Appointment Modal State
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  // Removed duplicate useAppointments hook call - ensuring we have the functions we need
  const { createAppointment: addAppointment, updateAppointment, deleteAppointment } = useAppointments(effectiveClinicId ? effectiveClinicId.toString() : undefined);


  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setIsAppointmentModalOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الموعد؟')) {
      try {
        await deleteAppointment(appointmentId);
        toast.success('تم حذف الموعد بنجاح');
      } catch (error) {
        console.error('Error deleting appointment:', error);
        toast.error('فشل حذف الموعد');
      }
    }
  };

  const handleSaveAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      if (editingAppointment) {
        // Merge existing appointment with updates
        const updatedAppointment = { ...editingAppointment, ...appointmentData };
        await updateAppointment(updatedAppointment as Appointment);
        toast.success('تم تحديث الموعد بنجاح');
      } else {
        await addAppointment({
          ...appointmentData,
          patientId: patientId!,
          patientName: patient?.name || appointmentData.patientName || 'Unknown',
          clinicId: effectiveClinicId.toString(),
          time: appointmentData.time || appointmentData.startTime || '09:00'
        } as any);
        toast.success('تم إضافة الموعد بنجاح');
      }
      setIsAppointmentModalOpen(false);
      setEditingAppointment(null);
      if (refreshAppointments) refreshAppointments();
    } catch (error) {
      console.error('Failed to save appointment', error);
      toast.error('حدث خطأ أثناء حفظ الموعد');
    }
  };

  useEffect(() => {
    const fetchFiles = async () => {
      if (!patientId) return;
      const { data } = await supabase
        .from('patient_files')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (data) {
        setFiles(data.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type as any,
          date: f.date || new Date(f.created_at).toLocaleDateString(),
          size: f.size || '-',
          url: f.url
        })));
      }
    };
    fetchFiles();
  }, [patientId]);

  // Derived Data - with null safety for nested vitals
  const rawMedicalData = patient?.medicalHistoryData;
  const medicalData = {
    vitals: {
      weight: rawMedicalData?.vitals?.weight ?? '-',
      height: rawMedicalData?.vitals?.height ?? '-',
      bp: rawMedicalData?.vitals?.bp ?? '-',
      sugar: rawMedicalData?.vitals?.sugar ?? '-',
      pulse: rawMedicalData?.vitals?.pulse ?? '-'
    },
    conditions: rawMedicalData?.conditions ?? [],
    allergies: rawMedicalData?.allergies ?? [],
    habits: rawMedicalData?.habits ?? [],
    notes: rawMedicalData?.notes ?? ''
  };

  const patientAppointments = appointments.filter(a => a.patientId === patientId);
  const nextAppointment = patientAppointments
    .filter(a => new Date(a.date) > new Date() && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  const completedVisits = patientAppointments.filter(a => a.status === 'completed').length;

  const patientTransactions = transactions.filter(t => t.patientId === patientId);
  const totalPaid = patientTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const activePlans = treatmentPlans.filter(p => p.status !== 'completed' && p.status !== 'cancelled');

  // Calculate Outstanding: Sum of (Cost - Paid) for all plans
  // Note: we track 'paid' in the plan object itself now from previous tasks
  const outstanding = treatmentPlans.reduce((sum, plan) => {
    // If status is cancelled, usually we don't count remaining balance unless specific policy
    if (plan.status === 'cancelled') return sum;
    return sum + (plan.cost - (plan.paid || 0));
  }, 0);

  // Treatment Status Logic
  let treatmentStatus = 'لا يوجد علاج نشط';
  let completedPercentage = 0;

  if (activePlans.length > 0) {
    treatmentStatus = 'قيد المعالجة';
    // Calculate overall progress
    const totalSessions = activePlans.reduce((s, p) => s + p.totalSessions, 0);
    const totalCompleted = activePlans.reduce((s, p) => s + p.completedSessions, 0);
    completedPercentage = totalSessions > 0 ? Math.round((totalCompleted / totalSessions) * 100) : 0;
  } else if (treatmentPlans.some(p => p.status === 'completed')) {
    treatmentStatus = 'مكتمل';
    completedPercentage = 100;
  }

  // Effects

  // Effects
  useEffect(() => {
    if (patient) {
      setTempName(patient.name);
    }
  }, [patient]);

  // Auto-save Handlers
  const [newAlert, setNewAlert] = useState('');
  const [isAddingAlert, setIsAddingAlert] = useState(false);

  const handleVitalChange = async (field: string, value: string) => {
    if (!patient) return;
    const newData = {
      ...medicalData,
      vitals: {
        ...medicalData.vitals,
        [field]: value
      }
    };
    // Optimistic update is handled by usePatient if we pass the whole object,
    // but here we are using derived 'medicalData'.
    // We need to call updatePatientProfile with the new medicalHistoryData.
    // The hook merges it.
    await updatePatientProfile({ medicalHistoryData: newData });
  };

  const toggleCondition = async (condition: string) => {
    if (!patient) return;
    const currentConditions = medicalData.conditions || [];
    const newConditions = currentConditions.includes(condition)
      ? currentConditions.filter(c => c !== condition)
      : [...currentConditions, condition];

    const newData = {
      ...medicalData,
      conditions: newConditions
    };
    await updatePatientProfile({ medicalHistoryData: newData });
  };

  const handleAddAlert = async () => {
    if (!newAlert.trim() || !patient) return;
    const currentAllergies = medicalData.allergies || [];
    const newData = {
      ...medicalData,
      allergies: [...currentAllergies, newAlert.trim()]
    };
    await updatePatientProfile({ medicalHistoryData: newData });
    setNewAlert('');
    setIsAddingAlert(false);
    toast.success('تم إضافة التنبيه بنجاح');
  };

  const handleDeleteAlert = async (alert: string) => {
    if (!patient) return;
    if (!window.confirm('هل أنت متأكد من حذف هذا التنبيه؟')) return;

    const currentAllergies = medicalData.allergies || [];
    const newData = {
      ...medicalData,
      allergies: currentAllergies.filter(a => a !== alert)
    };
    await updatePatientProfile({ medicalHistoryData: newData });
    toast.success('تم حذف التنبيه بنجاح');
  };

  // --- HANDLERS ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'xray' | 'report') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const result = await uploadFile(file, 'patient-docs', `${patientId}/${type}s`);
        if (result) {
          // Save to DB
          const newFilePayload = {
            patient_id: patientId,
            name: file.name,
            type: type,
            url: result.url,
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            date: new Date().toISOString()
          };

          const { data: dbFile, error: dbError } = await supabase
            .from('patient_files')
            .insert(newFilePayload)
            .select()
            .single();

          if (dbError) throw dbError;

          if (dbFile) {
            const newFile: FileItem = {
              id: dbFile.id,
              name: dbFile.name,
              type: dbFile.type as any,
              date: new Date(dbFile.created_at).toLocaleDateString('ar-IQ'),
              size: dbFile.size,
              url: dbFile.url
            };
            setFiles(prev => [newFile, ...prev]);
            // toast.success('تم رفع الملف وحفظه بنجاح');
          }
        }
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, 'report');
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e, 'xray');

  const handleToothClick = (tooth: ToothCondition) => {
    setSelectedTooth(tooth);
    setSelectedTeethNumbers([tooth.number]); // Sync for unified modal
    setIsDetailsPopupOpen(true);
  };

  const handleEditCondition = (tooth?: ToothCondition) => {
    if (tooth) setSelectedTooth(tooth);
    // Keep the details popup open in the background
    setIsConditionModalOpen(true);
  };

  const handleAddTreatment = () => {
    // Keep the details popup open in the background
    setIsModalOpen(true);
  };

  const handleAddGeneralTreatment = () => {
    setSelectedTooth(null);
    setSelectedTeethNumbers([0]);
    setIsDetailsPopupOpen(false);
    setIsModalOpen(true);
  };

  // --- Multi-Select Handlers ---
  const handleSelectionComplete = () => {
    if (selectedTeethNumbers.length > 0) {
      setIsDetailsPopupOpen(true);
    }
  };

  const handleAddTreatmentToAllSelected = () => {
    // Keep the details popup open in the background
    setIsModalOpen(true); // Open the multi-tooth treatment modal
  };

  const handleSaveCondition = async (toothNumber: number, condition: string, notes: string) => {
    if (!patientId) return;
    await updateTooth(toothNumber, condition, notes);
    toast.success('تم تحديث حالة السن بنجاح');
  };


  // --- Patient Data Handling (Supabase Integrated) ---


  const handleUpdateSession = (planId: string, sessionId: string, data: any) => {
    updateSession(planId, sessionId, data);
  };

  const handleLabRequest = (plan: TreatmentPlan) => {
    setSelectedLabPlan(plan);
    setIsLabModalOpen(true);
  };

  const handleCancelPlan = async (planId: string) => {
    if (window.confirm('هل أنت متأكد من إلغاء وحذف هذه الخطة العلاجية؟')) {
      await deletePlan(planId);
      // State update is handled optionally by hook or we force refresh
      // deletePlan in hook updates local state 'treatmentPlans'
    }
  };



  const handleOpenFinanceModal = (planId: string, sessionId: string) => {
    const plan = treatmentPlans.find(p => p.id === planId);
    const session = plan?.sessions.find(s => s.id === sessionId);

    if (plan && session) {
      setSelectedFinancePlanId(planId);
      setSelectedFinanceSessionId(sessionId);
      // specific logic for amount: defaulting to 0 or session cost if applicable
      setFinanceAmount(0);
      setFinanceModalType('income');
      setIsFinanceModalOpen(true);
    }
  };

  const handleSaveFinance = async (data: any) => {
    try {
      // 1. Add Transaction
      await addTransaction(data);

      // 2. Update Session Status & Paid Amount if it's related to a session
      if (selectedFinanceSessionId && selectedFinancePlanId) {
        // Calculate new paid amount (this is a simplification, ideally we sum up transactions)
        // For now, we just add this transaction amount to the session's 'paid' field if we had one,
        // or just rely on the transaction log. 
        // But to turn the session green, we might want to mark it as completed or partially paid.

        // Let's assume full payment for simplicity or ask user. 
        // For now, just logging the payment is the critical part.

        // Optionally update session status to 'completed' if it wasn't
        // updateSession(selectedFinancePlanId, selectedFinanceSessionId, { status: 'completed' }); 

        // Better: just refresh the data
      }

      setIsFinanceModalOpen(false);
      toast.success('تم حفظ المعاملة بنجاح');
    } catch (e) {
      console.error(e);
      toast.error('حدث خطأ أثناء الحفظ');
    }
  };

  const getTreatmentLabel = (type: string) => {
    const labels: Record<string, string> = {
      'endo': 'علاج عصب',
      'crown': 'تاج / جسر',
      'filling': 'حشوة',
      'implant': 'زراعة',
      'ortho': 'تقويم',
      'other': 'إجراء آخر',
      'x-ray': 'أشعة',
      'cleaning': 'تنظيف',
      'surgery': 'جراحة',
      'general': 'علاج عام'
    };
    return labels[type] || type || 'خطة علاجية';
  };



  const handleOpenGeneralModal = () => {
    setIsGeneralModalOpen(true);
  };

  const handleSaveGeneralTreatment = async (data: any) => {
    if (!patientId) return;

    // Create Treatment Plan
    const newPlan: TreatmentPlan = {
      id: crypto.randomUUID(),
      patientId: patientId,
      toothNumber: 0, // Always 0 for general
      type: data.treatmentType || 'general',
      status: 'planned',
      totalSessions: data.treatmentPlan.sessions.length,
      completedSessions: 0,
      progress: 0,
      sessions: data.treatmentPlan.sessions.map((s: any, i: number) => ({
        id: `sess-${Date.now()}-${i}`,
        number: i + 1,
        title: s.title,
        status: 'pending',
        duration: s.duration,
        schemaId: s.schemaId,
        data: {}
      })),
      cost: data.estimatedCost || 0,
      paid: 0,
      startDate: data.startDate,
      notes: data.treatmentPlan?.name || data.notes
    };

    await addPlan(newPlan);
    setIsGeneralModalOpen(false);
  };

  const handleModalSave = async (data: any) => {
    if (!patientId) return;

    // data now contains { toothNumbers: number[], treatmentType, notes, estimatedCostPerTooth, startDate, treatmentPlan, condition, priority }

    // 1. Update Tooth Condition for all selected teeth (if needed/returned)
    if (data.toothNumbers && data.condition && data.condition !== 'healthy') {
      for (const tNum of data.toothNumbers) {
        // Merging notes if necessary, or just using diagnosis notes
        await updateTooth(tNum, data.condition, data.notes);
      }
    }

    // 2. Create Unified Treatment Plan for selected teeth
    if (data.treatmentPlan && data.toothNumbers) {
      const isMulti = data.toothNumbers.length > 1;
      const primaryToothNum = isMulti ? 0 : data.toothNumbers[0];
      const totalPlanCost = (data.estimatedCostPerTooth || 0) * data.toothNumbers.length;

      const newPlan: TreatmentPlan = {
        id: crypto.randomUUID(),
        patientId: patientId,
        toothNumber: primaryToothNum,
        toothNumbers: isMulti ? data.toothNumbers : undefined,
        type: data.treatmentType || 'general',
        status: 'planned',
        totalSessions: data.treatmentPlan.sessions.length,
        completedSessions: 0,
        progress: 0,
        sessions: data.treatmentPlan.sessions.map((s: any, i: number) => ({
          id: `sess-${Date.now()}-${i}-${primaryToothNum}`,
          number: i + 1,
          title: s.title,
          status: 'pending',
          duration: s.duration,
          schemaId: s.schemaId,
          data: {}
        })),
        cost: totalPlanCost,
        paid: 0,
        startDate: data.startDate,
        notes: data.treatmentPlan?.name || data.notes
      };

      await addPlan(newPlan);
      toast.success(isMulti ? 'تم إنشاء خطة علاجية مجمعة للأسنان بنجاح' : 'تم إنشاء خطة علاجية بنجاح');
    }

    setIsModalOpen(false);
    setSelectedTeethNumbers([]);
    setIsToothSelectionMode(false);
    setIsDetailsPopupOpen(false); // Close details modal upon adding treatment to avoid staled background state
  };

  /* Financial State (Real) */
  // Complete Session & Add Transaction
  const handleCompleteSession = async (planId: string, sessionId: string, cost?: number) => {
    // 1. Update Treatment Plan via Hook
    completeSession(planId, sessionId, cost || 0);

    // 2. Add Financial Transaction if cost > 0
    if (cost && cost > 0) {
      try {
        await addTransaction({
          amount: cost,
          type: 'income',
          category: 'treatment',
          description: `جلسة علاج - خطة #${planId.slice(-4)}`,
          date: new Date().toISOString(),
          paymentMethod: 'cash',
          patientId: patientId
        });
        alert(`تم إكمال الجلسة وتسجيل دفعة بقيمة ${cost.toLocaleString()} د.ع`);
      } catch (e) {
        console.error("Failed to add transaction", e);
        alert("تم إكمال الجلسة ولكن فشل تسجيل الدفعة المالية");
      }
    } else {
      alert("تم إكمال الجلسة بنجاح");
    }
  };

  const handleSmartAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate AI Analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      const newReport: FileItem = {
        id: `rep-${Date.now()}`,
        name: `تقرير تحليل ذكي - ${new Date().toLocaleDateString('ar-IQ')}`,
        type: 'report',
        date: new Date().toLocaleDateString('ar-IQ'),
        size: '1.2 MB'
      };
      setFiles(prev => [newReport, ...prev]);
      alert("تم اكتمال التحليل الذكي وتم حفظ التقرير في الأرشيف بنجاح");
    }, 2500);
  };



  // Render Helpers
  const renderOverviewTab = () => {
    // Calculate derived state for UI
    const activeTreatment = treatmentPlans.find(p => p.status !== 'completed' && p.status !== 'cancelled');
    const completedPercentage = activeTreatment ? activeTreatment.progress : 0;
    const treatmentStatus = activeTreatment ? 'قيد المعالجة' : 'لا يوجد علاج نشط';

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in">
        <Card className="p-6 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow relative group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">الموعد القادم</p>
              <h3 className="text-xl font-bold mt-1 text-gray-900">
                {nextAppointment ? new Date(nextAppointment.date).toLocaleDateString('ar-IQ') : 'لا يوجد موعد'}
              </h3>
              <p className="text-blue-600 text-sm mt-2 font-medium flex items-center gap-2">
                {nextAppointment ? `${nextAppointment.type} - ${formatDate(nextAppointment.time)}` : '-'}
                {nextAppointment && nextAppointment.type.includes('أونلاين') && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 animate-pulse">
                    أونلاين
                  </span>
                )}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl flex flex-col gap-2">
              <Calendar className="text-blue-600 w-6 h-6" />
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleAddAppointment(); }}
            className="absolute top-4 left-4 p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="إضافة موعد"
          >
            <Plus className="w-4 h-4" />
          </button>
        </Card>

        <Card className="p-6 border-l-4 border-l-orange-500 hover:shadow-md transition-shadow relative">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-bold">عدد الزيارات</p>
              <h3 className="text-2xl font-bold mt-1 text-gray-900">{completedVisits} <span className="text-xs font-normal text-gray-400">أي زيارة</span></h3>
              <p className="text-orange-600 text-xs mt-2 font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                مكتملة بنجاح
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">الرصيد المستحق</p>
              <h3 className="text-xl font-bold mt-1 text-gray-900">{outstanding.toLocaleString()} د.ع</h3>
              <p className="text-green-600 text-sm mt-2 font-medium">مدفوع: {totalPaid.toLocaleString()} د.ع</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl">
              <DollarSign className="text-green-600 w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">حالة العلاج</p>
              <h3 className="text-xl font-bold mt-1 text-gray-900">{treatmentStatus}</h3>
              <p className="text-purple-600 text-sm mt-2 font-medium">مكتمل: {completedPercentage}%</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-xl">
              <Activity className="text-purple-600 w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Dynamic Medical Alerts */}
        {(() => {
          const history = Array.isArray(patient?.medicalHistory)
            ? patient.medicalHistory
            : (typeof patient?.medicalHistory === 'string' ? patient.medicalHistory.split(',') : []);

          const hasAlerts = history.some(h => h.includes('حساسية') || h.includes('Allergy'));

          return hasAlerts && (
            <div className="md:col-span-3">
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 shadow-sm flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-red-100 p-1.5 rounded-lg shrink-0">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <h4 className="font-bold text-red-900 text-sm">تنبيهات طبية هامة</h4>
                </div>

                <div className="flex flex-wrap gap-2">
                  {medicalData.allergies.map(allergy => (
                    <div key={allergy} className="flex items-center gap-1.5 text-red-700 text-xs font-bold bg-white border border-red-100 px-2.5 py-1 rounded-md shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <span>{allergy === 'penicillin' ? 'حساسية بنسيلين' : allergy}</span>
                    </div>
                  ))}
                  {medicalData.conditions.includes('hypertension') && (
                    <div className="flex items-center gap-1.5 text-red-700 text-xs font-bold bg-white border border-red-100 px-2.5 py-1 rounded-md shadow-sm">
                      <Activity className="w-3 h-3 shrink-0" />
                      <span>ضغط دم مرتفع</span>
                    </div>
                  )}
                  {medicalData.conditions.includes('diabetes') && (
                    <div className="flex items-center gap-1.5 text-red-700 text-xs font-bold bg-white border border-red-100 px-2.5 py-1 rounded-md shadow-sm">
                      <Activity className="w-3 h-3 shrink-0" />
                      <span>مرض السكري</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Merged Medical History Section */}
        <div className="md:col-span-3 mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-200">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">السجل الطبي والعلامات الحيوية</h3>
          </div>
          {renderMedicalHistoryTab()}
        </div>
      </div>
    );
  };

  const renderTreatmentPlanTab = () => {
    const activePlans = treatmentPlans.filter(p => p.status !== 'completed' && p.status !== 'cancelled');
    const archivedPlans = treatmentPlans.filter(p => p.status === 'completed' || p.status === 'cancelled');

    return (
      <div className="space-y-8 animate-in fade-in">
        {/* Chart Section */}
        <div className="space-y-6">
          <TeethChart
            teeth={patientTeeth}
            onToothClick={handleToothClick}
            isSelectionMode={isToothSelectionMode}
            selectedTeethNumbers={selectedTeethNumbers}
            onSelectionChange={setSelectedTeethNumbers}
            onSelectionComplete={handleSelectionComplete}
            onCancelSelection={() => {
              setIsToothSelectionMode(false);
              setSelectedTeethNumbers([]);
            }}
            onEnableSelection={() => setIsToothSelectionMode(true)}
          />

          {/* Quick Actions */}
          {/* Quick Actions - General Treatments */}
          <div className="grid grid-cols-1">
            <Button
              onClick={handleOpenGeneralModal}
              className="h-auto py-6 flex flex-col items-center gap-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-lg border-0"
            >
              <div className="bg-white/20 p-3 rounded-full">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="text-center">
                <span className="block text-xl font-bold">إضافة علاج عام</span>
                <span className="text-teal-100 text-sm font-normal opacity-90">اضغط هنا لإافة علاجات مثل التبييض والتنظيف</span>
              </div>
            </Button>
          </div>

          {/* Active Treatments List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                <Activity className="w-5 h-5 text-blue-600" />
                خطط العلاج الجارية
              </h3>

            </div>

            {activePlans.length === 0 ? (
              <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setIsModalOpen(true)}>
                <div className="bg-white mx-auto w-16 h-16 rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Plus className="w-8 h-8 text-blue-500" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">لا توجد خطط علاج نشطة</h4>
                <p className="text-gray-500">اختر نوع العلاج من الأعلى أو اضغط على السن في المخطط</p>
              </div>
            ) : (
              <div className="space-y-6">
                {activePlans.map(plan => {
                  // Calculate Financial Status
                  const planTx = patientTransactions.filter(t => t.treatmentId === plan.id && t.type === 'income');
                  const ledgerPaid = planTx.reduce((sum, t) => sum + t.amount, 0);
                  const paidAmount = Math.max(ledgerPaid, plan.paid || 0); // Use the greater of the two
                  const totalCost = plan.cost || 0;

                  let paymentStatusText = 'غير مدفوع';
                  let paymentStatusColor = 'text-red-500';

                  if (paidAmount >= totalCost && totalCost > 0) {
                    paymentStatusText = 'مدفوع بالكامل';
                    paymentStatusColor = 'text-green-600';
                  } else if (paidAmount > 0) {
                    paymentStatusText = `مدفوع جزئياً (${paidAmount.toLocaleString()} د.ع)`;
                    paymentStatusColor = 'text-orange-500';
                  }



                  return (
                    <Card key={plan.id} className="overflow-hidden border-0 shadow-md ring-1 ring-gray-100">
                      <div className="bg-white border-b p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="min-w-[3.5rem] h-14 px-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-blue-200 shadow-lg">
                              {(plan.toothNumbers && plan.toothNumbers.length > 0)
                                ? plan.toothNumbers.join(', ')
                                : plan.toothNumber !== 0 ? plan.toothNumber : 'عام'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xl text-gray-900">
                                  {plan.notes || getTreatmentLabel(plan.type)}
                                </h4>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${plan.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                  {plan.status === 'completed' ? 'مكتمل' : 'قيد المعالجة'}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500 mt-1 flex items-center gap-3">
                                <span>تاريخ البدء: {plan.startDate}</span>
                                <span>•</span>
                                <span>الطبيب: {plan.doctor?.includes('@') ? `د. ${plan.doctor.split('@')[0].split('.').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}` : (plan.doctor || 'غير محدد')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left flex flex-col items-end gap-2">
                            <div>
                              <span className="block text-2xl font-bold text-gray-900">{(plan.cost || 0).toLocaleString()} <span className="text-xs text-gray-500 font-normal">د.ع</span></span>
                              <span className={`text-xs font-medium ${paymentStatusColor}`}>{paymentStatusText}</span>
                            </div>
                          </div>
                        </div>

                        {/* Segmented Progress Bar (Sessions & Payment) */}
                        {/* Segmented Progress Bar (Sessions & Payment) */}
                        <div className="relative pt-2">
                          {(() => {
                            const totalSegments = Math.max(plan.totalSessions || 1, 1);
                            const paidRatio = Math.min(1, (plan.paid || 0) / (plan.cost || 1));
                            const paidSegments = Math.floor(paidRatio * totalSegments);
                            const completedSegments = plan.completedSessions || 0;

                            // Calculate overall progress percentage based on completion, or payment?
                            // User label is generic "Progress". Let's show completion % here or mixed?
                            // Usually completion is the main progress metric for the bar label.
                            const progressPercentage = Math.round((completedSegments / totalSegments) * 100);

                            return (
                              <>
                                <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1">
                                  <span>التقدم ({completedSegments} من {totalSegments})</span>
                                  <span>{progressPercentage}%</span>
                                </div>
                                <div className="flex gap-1 h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5">
                                  {Array.from({ length: totalSegments }).map((_, idx) => {
                                    let bgColor = 'bg-gray-200';
                                    // User logic: 
                                    // 1. Paid -> Green
                                    // 2. Completed -> Blue (overrides Green?) "becomes blue after clicking complete"
                                    // So priority: Completed (Blue) > Paid (Green) > Pending

                                    const isPaid = idx < paidSegments;
                                    const isCompleted = idx < completedSegments;

                                    if (isCompleted) {
                                      bgColor = 'bg-blue-500'; // Completed (Blue)
                                    } else if (isPaid) {
                                      bgColor = 'bg-green-500'; // Paid but not completed (Green)
                                    }

                                    return (
                                      <div
                                        key={idx}
                                        className={`h-full flex-1 rounded-sm transition-all duration-500 ${bgColor}`}
                                        title={`Session ${idx + 1}: ${isCompleted ? 'مكتمل' : (isPaid ? 'مدفوع' : 'قيد الانتظار')}`}
                                      />
                                    );
                                  })}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex justify-between items-center mb-4">
                          <div className="text-sm text-gray-500">
                            {plan.completedSessions} من {plan.totalSessions} جلسات مكتملة
                          </div>
                          <Button
                            onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                            variant={expandedPlanId === plan.id ? "ghost" : "primary"}
                            className={expandedPlanId === plan.id ? "" : "bg-blue-600 hover:bg-blue-700 text-white"}
                          >
                            {expandedPlanId === plan.id ? 'إخفاء التفاصيل' : 'عرض الخطة'}
                          </Button>
                        </div>

                        {expandedPlanId === plan.id && (
                          <div className="animate-in slide-in-from-top-4 fade-in duration-300 border-t pt-4">
                            <TreatmentSessionManager
                              plan={plan}
                              onUpdateSession={updateSession}
                              onCompleteSession={completeSession}
                              onAddPayment={handleSessionPayment}
                            />

                            <div className="mt-6 pt-5 border-t border-gray-100 flex justify-between items-center">
                              <Button
                                variant="outline"
                                className="text-gray-700 border-gray-300 hover:bg-gray-50"
                                onClick={() => {
                                  setSelectedLabPlan(plan);
                                  setIsLabModalOpen(true);
                                }}
                              >
                                <Beaker className="w-4 h-4 ml-2 text-indigo-600" />
                                {(() => {
                                  const teeth = plan.toothNumbers && plan.toothNumbers.length > 0 ? plan.toothNumbers : (plan.toothNumber !== undefined ? [plan.toothNumber] : [0]);
                                  if (teeth.length === 1 && teeth[0] === 0) return 'طلب معمل (علاج عام)';
                                  if (teeth.length > 1) return `طلب معمل للأسنان #${teeth.join(', ')}`;
                                  return `طلب معمل للسن #${teeth[0]}`;
                                })()}
                              </Button>

                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() => handleCancelPlan(plan.id)}
                                >
                                  إلغاء الخطة
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Archived Section */}
            {
              archivedPlans.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-500">
                    <CheckCircle className="w-5 h-5" />
                    الأرشيف والخطط المكتملة
                  </h3>
                  <div className="space-y-4 opacity-75 grayscale hover:grayscale-0 transition-all duration-500">
                    {archivedPlans.map(plan => {
                      const isExpanded = expandedPlanId === plan.id;
                      // Calculate Financial Status for Archive
                      const planTx = patientTransactions.filter(t => t.treatmentId === plan.id && t.type === 'income');
                      const paidAmount = planTx.reduce((sum, t) => sum + t.amount, 0);
                      const totalCost = plan.cost || 0;
                      // const remaining = totalCost - paidAmount; // unused for now in archive view summary

                      return (
                        <div key={plan.id} className={`bg-gray-50 border border-gray-200 rounded-xl transition-all ${isExpanded ? 'bg-white shadow-md ring-1 ring-blue-100' : 'hover:bg-white hover:shadow-sm'}`}>
                          <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}>
                            <div className="flex items-center gap-4">
                              <div className={`min-w-[2.5rem] px-2 h-10 rounded-lg flex items-center justify-center font-bold text-gray-600 text-xs ${plan.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-200'}`}>
                                {plan.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : ((plan.toothNumbers && plan.toothNumbers.length > 0) ? plan.toothNumbers.join(', ') : plan.toothNumber)}
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                  {plan.notes || getTreatmentLabel(plan.type)}
                                  <span className="text-xs font-normal text-gray-500">
                                    #{(plan.toothNumbers && plan.toothNumbers.length > 0) ? plan.toothNumbers.join(', ') : plan.toothNumber}
                                  </span>
                                </h4>
                                <p className="text-xs text-gray-500">
                                  {plan.status === 'completed' ? `مكتمل بتاريخ: ${plan.startDate}` : `تمت الأرشفة: ${plan.startDate}`}
                                  <span className="mx-2">•</span>
                                  <span className={paidAmount >= totalCost ? "text-green-600 font-bold" : "text-orange-500"}>
                                    {paidAmount >= totalCost ? 'مدفوع بالكامل' : 'عالق / جزئي'}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('هل أنت متأكد من حذف هذه الخطة من الأرشيف نهائياً؟')) {
                                    handleCancelPlan(plan.id); // Re-using cancel for now, strictly speaking straightforward delete might be better if available
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                {isExpanded ? <Minus className="w-4 h-4" /> : 'عرض التفاصيل'}
                              </Button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-gray-100 pt-4 animate-in slide-in-from-top-2">
                              {/* Re-use Session Manager in Read-Only functionality or limited edit? 
                                 Usually completed plans can just show history. 
                                 For now, just showing the session list through the Manager component 
                                 but maybe we should disable editing? 
                                 TreatmentSessionManager handles its own state.
                             */}
                              <TreatmentSessionManager
                                plan={plan}
                                onUpdateSession={updateSession}
                                onCompleteSession={completeSession}
                                onAddPayment={handleOpenFinanceModal}
                                isReadOnly={true}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            }

          </div >
        </div >
      </div >
    );
  };



  /* --- TWO-STEP PAYMENT FLOW HANDLERS --- */
  const handleSettleInstallment = async (planId: string, amount: number) => {
    try {
      const plan = treatmentPlans.find(p => p.id === planId);
      if (!plan) return;

      const currentPaid = plan.paid || 0;
      const newPaid = currentPaid + amount;
      // Clamp to total cost to avoid overpayment (optional, but good practice)
      const finalPaid = Math.min(newPaid, plan.cost || 0);

      const { error } = await supabase
        .from('tooth_treatment_plans')
        .update({ paid: finalPaid })
        .eq('id', planId);

      if (error) throw error;

      toast.success(`تم تسجيل دفعة بقيمة ${amount.toLocaleString()} د.ع بنجاح`);

      // Optimistically update local state to reflect change immediately
      updatePlan(planId, { paid: finalPaid });

    } catch (error) {
      console.error('Error settling installment:', error);
      toast.error('فشل تسجيل الدفعة');
    }
  };

  const handleSessionPayment = (planId: string, sessionId: string, amount?: number) => {
    const plan = treatmentPlans.find(p => p.id === planId);
    if (!plan) return;

    if (amount && amount > 0) {
      if (confirm(`هل تريد تسجيل دفعة بقيمة ${amount.toLocaleString()} د.ع لهذه الجلسة؟`)) {
        handleSettleInstallment(planId, amount);
      }
      return;
    }

    // Calculate suggested installment amount (Remaining / Remaining Sessions)
    // or simply Cost / Total Sessions
    const totalSegments = plan.totalSessions || 1;
    const paidAmount = plan.paid || 0;
    const remainingCost = (plan.cost || 0) - paidAmount;

    // Estimate how many sessions are "paid for"
    const currentPaidSegments = Math.floor((paidAmount / (plan.cost || 1)) * totalSegments);
    const remainingSegments = Math.max(1, totalSegments - currentPaidSegments);

    const suggestedAmount = Math.ceil(remainingCost / remainingSegments);

    if (confirm(`هل تريد تسجيل دفعة بقيمة ${suggestedAmount.toLocaleString()} د.ع لهذه الجلسة؟`)) {
      handleSettleInstallment(planId, suggestedAmount);
    }
  };


  /* Finance Tab Render */
  const renderFinanceTab = () => {
    // 1. Calculate Statistics
    const totalRevenue = patientTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = patientTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate financial status for each plan
    const planPayments = treatmentPlans.map(plan => {
      // Calculate verified payments from transactions (Ledger)
      const planTx = patientTransactions.filter(t => t.treatmentId === plan.id && t.type === 'income');
      const ledgerPaid = planTx.reduce((sum, t) => sum + t.amount, 0);

      // Clinical Paid (from the plan itself)
      const clinicalPaid = plan.paid || 0;

      // Effective Paid is the max of both (Clinical usually leads)
      const effectivePaid = Math.max(clinicalPaid, ledgerPaid);

      return {
        ...plan,
        paidAmount: effectivePaid,
        ledgerPaid: ledgerPaid,
        remaining: (plan.cost || 0) - effectivePaid
      };
    });

    // Total Outstanding = Sum of remaining balances on all plans
    const totalOutstanding = planPayments.reduce((sum, p) => sum + Math.max(0, p.remaining), 0);

    return (
      <div className="animate-in fade-in space-y-8">

        {/* 1. Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Outstanding Balance */}
          <Card className="p-6 border-l-4 border-l-red-500 bg-red-50/20 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-bold mb-1">الرصيد المستحق</p>
                <h3 className="text-2xl font-bold text-gray-900">{totalOutstanding.toLocaleString()} <span className="text-sm font-normal text-gray-500">د.ع</span></h3>
                <p className="text-red-600 text-xs mt-2 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  متبقي للدفع
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl text-red-600">
                <HandCoins className="w-6 h-6" />
              </div>
            </div>
          </Card>

          {/* Total Revenue */}
          <Card className="p-6 border-l-4 border-l-emerald-500 bg-emerald-50/20 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-bold mb-1">إجمالي الإيرادات</p>
                <h3 className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} <span className="text-sm font-normal text-gray-500">د.ع</span></h3>
                <p className="text-emerald-600 text-xs mt-2 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  مدفوعات مستلمة
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
          </Card>

          {/* Total Expenses */}
          <Card className="p-6 border-l-4 border-l-orange-500 bg-orange-50/20 hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-bold mb-1">المصروفات / التكاليف</p>
                <h3 className="text-2xl font-bold text-gray-900">{totalExpenses.toLocaleString()} <span className="text-sm font-normal text-gray-500">د.ع</span></h3>
                <p className="text-orange-600 text-xs mt-2 font-medium flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  تكاليف تشغيلية
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* 2. Outstanding Plans Table */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-gray-500" />
              الرصيد المستحق (خطط العلاج)
            </h3>
            <div className="text-sm text-gray-500">
              عدد الخطط: {planPayments.filter(p => p.remaining > 0).length}
            </div>
          </div>

          <table className="w-full text-right">
            <thead className="bg-gray-50 text-xs text-gray-500 font-bold uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">العلاج</th>
                <th className="px-6 py-4">السن</th>
                <th className="px-6 py-4 w-1/3">حالة الدفع (الدفعات)</th>
                <th className="px-6 py-4">الرصيد المستحق</th>
                <th className="px-6 py-4">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {planPayments.filter(p => p.remaining > 0 || (p.paidAmount > 0 && p.ledgerPaid < p.paidAmount)).map(plan => {
                // Calculate segments for progress bar
                const totalSegments = plan.totalSessions || 1;
                const isSingleSession = totalSegments === 1;
                const paidRatio = Math.min(1, plan.paidAmount / (plan.cost || 1));
                const paidSegments = Math.floor(paidRatio * totalSegments);

                return (
                  <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-bold text-gray-900 block">{plan.notes || getTreatmentLabel(plan.type)}</span>
                        <span className="text-xs text-gray-500">ID: {plan.id.slice(0, 6)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="min-w-[2rem] px-2 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {(plan.toothNumbers && plan.toothNumbers.length > 0)
                          ? plan.toothNumbers.join(', ')
                          : plan.toothNumber !== 0 ? plan.toothNumber : 'عام'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 h-3 w-full max-w-[200px]">
                        {Array.from({ length: totalSegments }).map((_, idx) => {
                          const isPaid = idx < paidSegments;
                          return (
                            <div
                              key={idx}
                              className={`h-full flex-1 rounded-sm transition-all ${isPaid ? 'bg-green-500' : 'bg-red-200'}`}
                              title={isPaid ? 'مدفوع' : 'غير مدفوع'}
                            />
                          );
                        })}
                      </div>
                      <div className="text-xs text-gray-500 mt-1.5 flex justify-between w-full max-w-[200px]">
                        <span>{isSingleSession ? 'جلسة واحدة' : `${totalSegments} دفعات`}</span>
                        <span>{Math.round(paidRatio * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {plan.remaining > 0 ? (
                        <div>
                          <span className="font-bold text-red-600 block">{plan.remaining.toLocaleString()} د.ع</span>
                          <span className="text-xs text-gray-400">من أصل {plan.cost?.toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          تم السداد
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {plan.remaining > 0 && (
                        <div className="flex flex-col gap-2">
                          {/* Confirm Full Settlement */}
                          {(plan.remaining <= 0 || isSingleSession || (plan.remaining < (plan.cost || 0) * 0.1)) ? (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من تسوية المبلغ المتبقي (${plan.remaining.toLocaleString()} د.ع)؟`)) {
                                  handleSettleInstallment(plan.id, plan.remaining);
                                }
                              }}
                            >
                              <CheckSquare className="w-4 h-4 ml-1" />
                              تأكيد التسديد
                            </Button>
                          ) : (
                            // Pay Installment with Input
                            <div className="flex items-center gap-2">
                              <div className="relative w-24">
                                <input
                                  type="number"
                                  min="0"
                                  max={plan.remaining}
                                  className="w-full text-xs p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-center"
                                  placeholder="المبلغ..."
                                  value={paymentAmounts[plan.id] || ''}
                                  onChange={(e) => setPaymentAmounts(prev => ({ ...prev, [plan.id]: e.target.value }))}
                                />
                                <span className="absolute left-1 top-1.5 text-[10px] text-gray-400">د.ع</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-200 text-blue-700 hover:bg-blue-50 px-3"
                                disabled={!paymentAmounts[plan.id] || parseFloat(paymentAmounts[plan.id]) <= 0 || parseFloat(paymentAmounts[plan.id]) > plan.remaining}
                                onClick={() => {
                                  const amount = parseFloat(paymentAmounts[plan.id]);
                                  if (amount && amount > 0) {
                                    if (confirm(`تأكيد دفع مبلغ ${amount.toLocaleString()} د.ع؟`)) {
                                      handleSettleInstallment(plan.id, amount);
                                      // Clear input after success
                                      setPaymentAmounts(prev => ({ ...prev, [plan.id]: '' }));
                                    }
                                  }
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          )}

                          {(!isSingleSession && plan.remaining > 0 && paidSegments >= totalSegments - 1) && (
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white w-full animate-pulse"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من تسوية المبلغ المتبقي (${plan.remaining.toLocaleString()} د.ع)؟`)) {
                                  handleSettleInstallment(plan.id, plan.remaining);
                                }
                              }}
                            >
                              <CheckSquare className="w-4 h-4 ml-1" />
                              تسوية نهائية
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Record Revenue Button */}
                      {(plan.remaining <= 0 && plan.ledgerPaid < plan.paidAmount) && (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white w-full shadow-md shadow-blue-100"
                          onClick={() => {
                            setFinancePrefillData({
                              amount: plan.paidAmount,
                              category: 'treatment',
                              patientId: patientId,
                              treatmentId: plan.id,
                              description: `إيراد علاج - ${plan.notes || getTreatmentLabel(plan.type)}`,
                              date: new Date().toISOString()
                            });
                            setFinanceModalType('income');
                            setIsFinanceModalOpen(true);
                          }}
                        >
                          <DollarSign className="w-4 h-4 ml-1" />
                          تسجيل الإيراد
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {planPayments.filter(p => p.remaining > 0 || (p.paidAmount > 0 && p.ledgerPaid < p.paidAmount)).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <CheckCircle className="w-12 h-12 text-green-100 mx-auto mb-3" />
                    <p>لا توجد مبالغ مستحقة حالياً</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-gray-500" />
            سجل المعاملات المالية
          </h3>
          <div className="flex gap-3">
            <Button variant="outline" className="text-rose-600 hover:bg-rose-50 border-rose-200" onClick={() => { setFinanceModalType('expense'); setIsFinanceModalOpen(true); }}>
              <Minus className="w-4 h-4 ml-2" />
              تسجيل مصروف
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
              onClick={() => { setFinanceModalType('income'); setIsFinanceModalOpen(true); }}
            >
              <Plus className="w-4 h-4 ml-2" />
              تسجيل ايراد
            </Button>
          </div>
        </div>

        {/* Existing Transaction Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-500">رقم الوصل</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500">التاريخ</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500">النوع</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500">الوصف</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500">المبلغ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patientTransactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm text-gray-600">#{t.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatDate(t.date)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.type === 'income' ? 'إيراد' : 'مصروف'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{t.description}</td>
                  <td className={`px-6 py-4 font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} د.ع
                  </td>
                </tr>
              ))}
              {patientTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    لا توجد سجلات مالية لهذا المريض
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div >
    )
  };


  /* --- ARCHIVE GALLERY LOGIC --- */
  const getImages = () => files.filter(f => f.type === 'xray' || f.name.match(/\.(jpg|jpeg|png|gif)$/i));
  const currentImageIndex = previewUrl ? getImages().findIndex(f => f.url === previewUrl) : -1;

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const images = getImages();
    if (images.length === 0) return;
    const nextIndex = (currentImageIndex + 1) % images.length;
    setPreviewUrl(images[nextIndex].url);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const images = getImages();
    if (images.length === 0) return;
    const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
    setPreviewUrl(images[prevIndex].url);
  };

  /* --- FINANCE MODAL LOGIC --- */




  /* Archive Tab Render */
  const [archiveSubTab, setArchiveSubTab] = useState<'gallery' | 'files'>('gallery');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<FileItem | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null); // Added this line

  const handleSaveEditedImage = async (newUrl: string) => {
    if (!editingFile || !patientId) return;

    try {
      // Convert DataURL to File
      const res = await fetch(newUrl);
      const blob = await res.blob();
      const fileName = `edited_${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      // Upload
      const result = await uploadFile(file, 'patient-docs', `${patientId}/images`);

      if (result) {
        // Update Database
        const { error } = await supabase
          .from('patient_files')
          .update({
            url: result.url,
            size: (file.size / 1024).toFixed(1) + ' KB'
          })
          .eq('id', editingFile.id);

        if (error) throw error;

        // Update UI
        setFiles(prev => prev.map(f => f.id === editingFile.id ? { ...f, url: result.url } : f));
        setPreviewUrl(result.url); // Update preview if open
        toast.success('تم حفظ التعديلات بنجاح');
      }
    } catch (error) {
      console.error('Save edit error:', error);
      toast.error('فشل حفظ التعديلات');
    }
  };

  const handleSaveCopy = async (newUrl: string) => {
    if (!editingFile || !patientId) return;

    try {
      // Convert DataURL to File
      const res = await fetch(newUrl);
      const blob = await res.blob();
      const fileName = `copy_${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      // Upload
      const result = await uploadFile(file, 'patient-docs', `${patientId}/images`);

      if (result) {
        // Insert new record
        const { data, error } = await supabase
          .from('patient_files')
          .insert({
            patient_id: patientId,
            name: fileName,
            type: 'xray',
            url: result.url,
            size: (file.size / 1024).toFixed(1) + ' KB',
            date: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const newFile: FileItem = {
            id: data.id,
            name: data.name,
            type: 'xray', // Cast if needed, or ensure DB type matches
            url: data.url,
            date: new Date(data.created_at).toLocaleDateString('ar-IQ'),
            size: data.size
          };
          setFiles(prev => [newFile, ...prev]);
          toast.success('تم حفظ نسخة جديدة بنجاح');
        }
      }
    } catch (error) {
      console.error('Save copy error:', error);
      toast.error('فشل حفظ النسخة');
    }
  };

  const renderArchiveTab = () => (
    <div className="animate-in fade-in space-y-6">
      {/* Sub-Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit mb-6">
        <button
          onClick={() => setArchiveSubTab('gallery')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${archiveSubTab === 'gallery' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            معرض الصور
          </div>
        </button>
        <button
          onClick={() => setArchiveSubTab('files')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${archiveSubTab === 'files' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            المستندات والتقارير
          </div>
        </button>
      </div>

      {archiveSubTab === 'gallery' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
          {/* Gallery Toolbar */}
          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                معرض الصور
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{getImages().length}</span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {isSelectionMode ? (
                <>
                  <span className="text-sm font-bold text-indigo-600 px-2">{selectedImageIds.length} تم تحديده</span>
                  <Button variant="ghost" size="sm" onClick={() => {
                    if (selectedImageIds.length === getImages().length) setSelectedImageIds([]);
                    else setSelectedImageIds(getImages().map(f => f.id));
                  }}>
                    {selectedImageIds.length === getImages().length ? 'إلغاء الكل' : 'تحديد الكل'}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={handleDeleteFiles} disabled={selectedImageIds.length === 0}>
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف
                  </Button>
                  <div className="w-px h-6 bg-gray-200 mx-1"></div>
                  <Button variant="ghost" size="sm" onClick={() => { setIsSelectionMode(false); setSelectedImageIds([]); }}>
                    إلغاء
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsSelectionMode(true)} className="text-gray-600 border-gray-300">
                  <CheckCircle className="w-4 h-4 ml-2" />
                  تحديد
                </Button>
              )}

              {!isSelectionMode && (
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  <Plus className="w-4 h-4" />
                  إضافة صورة
                </label>
              )}
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {getImages().length === 0 ? (
              <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">لا توجد صور مرفقة</p>
              </div>
            ) : (
              getImages().map(file => {
                const isSelected = selectedImageIds.includes(file.id);
                return (
                  <div key={file.id}
                    className={`group relative aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${isSelectionMode && isSelected
                      ? 'border-indigo-500 ring-2 ring-indigo-200 ring-offset-2'
                      : 'border-transparent hover:shadow-lg'
                      }`}
                    onClick={() => {
                      if (isSelectionMode) {
                        setSelectedImageIds(prev =>
                          prev.includes(file.id) ? prev.filter(id => id !== file.id) : [...prev, file.id]
                        );
                      } else {
                        setPreviewUrl(file.url || null);
                      }
                    }}>

                    {file.url ? (
                      <img src={file.url} alt={file.name} className={`w-full h-full object-cover transition-transform duration-500 ${!isSelectionMode && 'group-hover:scale-110'}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}

                    {/* Selection Indicator Overlay */}
                    {isSelectionMode && (
                      <div className={`absolute inset-0 bg-black/10 flex items-start justify-end p-2 transition-all ${isSelected ? 'bg-indigo-500/20' : ''}`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white/50 border-white'
                          }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                      </div>
                    )}

                    {/* Caption Gradient (Only in view mode) */}
                    {!isSelectionMode && (
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs truncate font-medium text-center">{file.name}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {archiveSubTab === 'files' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
          {/* Upload for Docs */}
          <label className="cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:to-indigo-100 p-6 rounded-2xl border border-blue-100 flex flex-col items-center text-center transition-all group">
            <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleDocumentUpload} />
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">رفع تقارير طبية</h3>
            <p className="text-gray-500 text-xs">تحاليل، تقارير خارجية، وصفات</p>
          </label>

          {/* 2. Documents Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                المستندات والتقارير
              </h3>
              <span className="text-xs text-gray-500">{files.filter(f => f.type !== 'xray').length} ملف</span>
            </div>
            <table className="w-full text-right">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="px-6 py-3">اسم الملف</th>
                  <th className="px-6 py-3">التاريخ</th>
                  <th className="px-6 py-3">الحجم</th>
                  <th className="px-6 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {files.filter(f => f.type !== 'xray').map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{file.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{file.size}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }} title="عرض الملف">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('حذف الملف؟')) setFiles(prev => prev.filter(f => f.id !== file.id));
                        }} title="حذف الملف">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {files.filter(f => f.type !== 'xray').length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">لا توجد مستندات</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
      />

      {/* Image Preview Modal (Gallery style) */}
      {
        previewUrl && (
          <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setPreviewUrl(null)}>
            {/* Close Button */}
            <button className="absolute top-4 right-4 text-white/50 hover:text-white p-2 z-50 transition-colors" onClick={() => setPreviewUrl(null)}>
              <X className="w-8 h-8" />
            </button>

            {/* Toolbar */}
            <div className="absolute top-4 left-4 flex gap-2 z-50">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors" onClick={(e) => {
                e.stopPropagation();
                const currentImg = getImages()[currentImageIndex];
                if (currentImg) {
                  setEditingFile(currentImg);
                  setIsEditorOpen(true);
                }
              }}>
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-medium">تعديل</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-full backdrop-blur-md transition-colors" onClick={(e) => {
                e.stopPropagation();
                const currentImg = getImages()[currentImageIndex];
                if (currentImg) handleArchiveAnalysis(currentImg.id);
              }}>
                <Brain className="w-4 h-4" />
                <span className="text-sm font-medium">تحليل AI</span>
              </button>
            </div>

            {/* Navigation Left */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all hidden md:block"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            {/* Main Image */}
            <img src={previewUrl} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl select-none" onClick={e => e.stopPropagation()} />

            {/* Navigation Right */}
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all hidden md:block"
              onClick={handleNextImage}
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            {/* Image Info / Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur text-white px-4 py-1.5 rounded-full text-sm">
              {currentImageIndex + 1} / {getImages().length}
            </div>
          </div>
        )
      }

      {/* Image Editor Modal */}
      {
        isEditorOpen && editingFile && (
          <ImageEditorModal
            isOpen={isEditorOpen}
            imageUrl={editingFile.url || ''}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSaveEditedImage}
            onSaveCopy={handleSaveCopy}
          />
        )
      }


    </div >
  );

  // Need to add state locally for the editor:
  // (We'll do this via a separate replace call if needed, but we can try to inject it before this function if we were editing the whole file,
  // but since we are editing a block, we need to ensure the state variables exist appropriately.
  // Wait, I can't inject state inside renderArchiveTab if I don't change the beginning of it.
  // I will assume I need to add state variables at the start of renderArchiveTab in a separate call or this will fail compilation.
  // Actually, I can replace the whole renderArchiveTab function start to finish to include the new state.)

  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const { history: aiHistory, uploading: aiUploading, analyzing: aiAnalyzing, analyzeImage, analyzeExistingImage, deleteAnalysis, refresh: refreshAI } = useAIAnalysis(patientId);

  // Chat History State - DB Backed
  const [chatHistory, setChatHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!patientId) return;
      const { data } = await supabase
        .from('smart_assistant_chats')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (data) {
        setChatHistory(data.map(c => ({
          id: c.id,
          date: new Date(c.created_at).toLocaleDateString('ar-IQ'),
          summary: c.summary,
          messages: c.messages
        })));
      }
    };
    fetchChats();
  }, [patientId]);

  // Workflow Step 1: User Selects File
  const handleAIFileSelect = (file: File) => {
    setFileToAnalyze(file);
    setPreviewUrl(URL.createObjectURL(file));
    setSelectedAnalysis(null);
    setAnalysisNotes('');
  };

  // Workflow Step 2: User Clicks Analyze
  const handleManualAnalyze = async () => {
    if (!previewUrl) return;

    let result;
    if (fileToAnalyze) {
      // Upload and Analyze
      result = await analyzeImage(fileToAnalyze);
    } else {
      // Analyze Existing URL (from Archive)
      result = await analyzeExistingImage(previewUrl);
    }

    if (result) {
      const displayResult = {
        image_url: previewUrl,
        analysis_result: result,
        created_at: new Date().toISOString(),
        notes: analysisNotes // We might want to save this later
      };
      setSelectedAnalysis(displayResult);
      // Clear preview state to show result
      setPreviewUrl(null);
      setFileToAnalyze(null);
    }
  };

  const handleSaveChat = async (messages: any[]) => {
    if (!patientId) return;

    // Save to DB
    const summaryText = messages.length > 0 ? messages[messages.length - 1].text.substring(0, 50) + '...' : 'محادثة جديدة';

    try {
      const { data, error } = await supabase
        .from('smart_assistant_chats')
        .insert({
          patient_id: patientId,
          doctor_id: user?.id,
          title: 'محادثة مساعد ذكي',
          summary: `محادثة (${messages.length} رسائل) - ${summaryText}`,
          messages: messages
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newChatLog = {
          id: data.id,
          date: new Date(data.created_at).toLocaleDateString('ar-IQ'),
          summary: data.summary,
          messages: data.messages
        };
        setChatHistory(prev => [newChatLog, ...prev]);
        toast.success('تم حفظ المحادثة في سجل التشخيصات بنجاح');
      }
    } catch (err) {
      console.error('Error saving chat:', err);
      toast.error('فشل حفظ المحادثة');
    }
  };

  const handleDeleteAnalysis = async (id: string, type: 'image' | 'chat') => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل بشكل نهائي؟')) return;

    try {
      if (type === 'image') {
        // Use the hook method for AI Analysis
        await deleteAnalysis(id);
        refreshAI(); // Refresh UI
        toast.success('تم حذف تحليل الصورة بنجاح');
      } else {
        // Delete Chat History
        const { error } = await supabase
          .from('smart_assistant_chats')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setChatHistory(prev => prev.filter(c => c.id !== id));
        toast.success('تم حذف سجل المحادثة بنجاح');
      }
    } catch (error) {
      console.error('Delete error', error);
      toast.error('فشل في حذف السجل');
    }
  };

  const handleDeleteFiles = async () => {
    if (selectedImageIds.length === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedImageIds.length} ملفات بشكل نهائي؟`)) return;

    try {
      const { error } = await supabase
        .from('patient_files')
        .delete()
        .in('id', selectedImageIds);

      if (error) throw error;

      // Update UI
      setFiles(prev => prev.filter(f => !selectedImageIds.includes(f.id)));
      setSelectedImageIds([]);
      setIsSelectionMode(false);
      toast.success('تم حذف الملفات بنجاح');

    } catch (error) {
      console.error('File deletion error:', error);
      toast.error('فشل حذف الملفات');
    }
  };

  const handleSaveToArchive = async (item: any, type: 'image' | 'chat') => {
    if (type === 'image') {
      try {
        const { data, error } = await supabase
          .from('patient_files')
          .insert({
            patient_id: patientId,
            name: `تشخيص AI - ${new Date().toLocaleDateString('ar-IQ')}`,
            type: 'xray',
            url: item.image_url || item.imageUrl,
            size: 'AI Processed',
            date: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const newFile: FileItem = {
            id: data.id,
            name: data.name,
            type: data.type as any,
            date: new Date(data.created_at).toLocaleDateString('ar-IQ'),
            size: data.size || '-',
            url: data.url
          };
          setFiles(prev => [newFile, ...prev]);
          alert('تم حفظ الصورة والتشخيص في الأرشيف (قسم الصور)');
        }
      } catch (err) {
        console.error('Archive Save Error:', err);
        alert('فشل الحفظ في الأرشيف');
      }
    } else {
      // ... existing chat save logic ...
      // Create a Blob for the Chat Content
      const chatContent = `
        سجل محادثة المساعد الطبي الذكي
        التاريخ: ${item.date}
        الملخص: ${item.summary}
        ----------------------------------------
        ${item.messages ? item.messages.map((m: any) => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.sender === 'user' ? 'الطبيب' : 'المساعد'}: ${m.text}`).join('\n\n') : 'لا توجد تفاصيل'}
      `;
      const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
      const fileName = `chat-log-${Date.now()}.txt`;
      const file = new File([blob], fileName, { type: 'text/plain' });

      try {
        const result = await uploadFile(file, 'patient-docs', `${patientId}/reports`);

        if (result) {
          const { data, error } = await supabase
            .from('patient_files')
            .insert({
              patient_id: patientId,
              name: `محادثة مساعد ذكي - ${new Date().toLocaleDateString('ar-IQ')}`,
              type: 'report',
              url: result.url,
              size: '15 KB',
              date: new Date().toISOString()
            })
            .select()
            .single();

          if (error) throw error;

          if (data) {
            const newDoc: FileItem = {
              id: data.id,
              name: data.name,
              type: data.type as any,
              date: new Date(data.created_at).toLocaleDateString('ar-IQ'),
              size: data.size,
              url: data.url
            };
            setFiles(prev => [newDoc, ...prev]);
            toast.success('تم حفظ المحادثة في المستندات (قسم التقارير)');
          }
        }
      } catch (err) {
        console.error('Chat Archive Error:', err);
        toast.error('فشل حفظ المحادثة');
      }
    }
  };

  // Fixed Archive Analysis Handoff
  const handleArchiveAnalysis = async (imageId: string) => {
    const image = files.find(f => f.id === imageId);
    if (image) {
      // Switch to Smart Services tab
      setActiveTab('smart');
      setIsAnalysisModalOpen(true);

      // Setup Preview Mode
      const mockUrl = image.url || 'https://images.unsplash.com/photo-1606811971618-4486d14f3f72';
      setPreviewUrl(mockUrl);
      setFileToAnalyze(null); // It's an existing file
      setSelectedAnalysis(null); // Ensure we don't show old result
      setAnalysisNotes('');
    }
  };

  // Render Helper for Analysis Modal Content
  const renderAnalysisModalContent = () => {
    // 1. Result View
    if (selectedAnalysis) {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-lg text-gray-800">نتيجة التحليل</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSaveToArchive(selectedAnalysis, 'image')}>
                <Save className="w-4 h-4 ml-2" />
                حفظ في سجل التشخيص
              </Button>
              <Button variant="ghost" size="sm" onClick={() => {
                setSelectedAnalysis(null);
                setPreviewUrl(null);
              }}>
                <Plus className="w-4 h-4 ml-2" />
                تشخيص جديد
              </Button>
            </div>
          </div>
          <AnalysisResultCard
            imageUrl={selectedAnalysis.image_url}
            result={selectedAnalysis.analysis_result}
            date={selectedAnalysis.created_at}
          />
        </div>
      );
    }

    // 2. Preview & Analyze View
    if (previewUrl) {
      return (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 relative group">
            <img src={previewUrl} alt="Preview" className="w-full h-64 object-contain bg-black/5" />
            {!aiAnalyzing && !aiUploading && (
              <button
                onClick={() => setPreviewUrl(null)}
                className="absolute top-2 right-2 bg-white/90 p-2 rounded-full shadow-sm hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">إضافة ملاحظات للطبيب أو النظام (اختياري)</label>
            <textarea
              value={analysisNotes}
              onChange={(e) => setAnalysisNotes(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50 focus:bg-white transition-all text-sm"
              placeholder="اكتب أي ملاحظات حول الصورة هنا..."
              rows={2}
              disabled={aiAnalyzing || aiUploading}
            />
          </div>

          {(aiAnalyzing || aiUploading) && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
              <div className="w-12 h-12 relative flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-blue-800 mb-1">{aiUploading ? 'جاري رفع الصورة...' : 'جاري تحليل الصورة بالذكاء الاصطناعي...'}</p>
                <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full animate-pulse w-2/3"></div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleManualAnalyze}
              className="w-full h-11 text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 border-0 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={aiAnalyzing || aiUploading}
            >
              <span className="flex items-center justify-center gap-2 w-full">
                {aiAnalyzing ? 'جاري العمل...' : 'بدء التحليل الآن'}
                {!aiAnalyzing && <Brain className="w-5 h-5" />}
              </span>
            </Button>
          </div>
        </div>
      );
    }

    // 3. Upload View
    return (
      <div>
        <p className="text-gray-600 mb-4">
          قم برفع صورة الأشعة (X-Ray) وسيقوم النظام بتحليلها فوراً.
        </p>
        <ImageUploadZone
          onFileSelect={handleAIFileSelect}
          isUploading={false} // Loading handles in Preview Mode now
        />
      </div>
    );
  };


  const renderSmartServicesTab = () => (
    <div className="animate-in fade-in space-y-8">
      {/* Header Banner Removed */}
      <div className="hidden"></div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image Analysis Card */}
        <div
          onClick={() => {
            setSelectedAnalysis(null); // Reset for new upload
            setIsAnalysisModalOpen(true);
          }}
          className="group cursor-pointer bg-white rounded-2xl p-1 border border-transparent hover:border-indigo-200 shadow-sm hover:shadow-xl transition-all duration-300"
        >
          <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center group-hover:scale-[0.98] transition-transform">
            <div className="absolute inset-0 bg-grid-indigo-500/[0.05] [mask-image:linear-gradient(0deg,white,transparent)]" />
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-500">
              <Brain className="w-10 h-10" />
            </div>
          </div>
          <div className="px-5 pb-5">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">تحليل الصور (AI Diagnosis)</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              رفع صور الأشعة للكشف التلقائي عن التسوسات والالتهابات بدقة عالية مع تقرير فوري.
            </p>
            <div className="flex items-center text-indigo-600 font-bold text-sm">
              بدء التحليل <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-[-4px] transition-transform" />
            </div>
          </div>
        </div>

        {/* Smart Assistant Card */}
        <div
          onClick={() => setIsChatModalOpen(true)}
          className="group cursor-pointer bg-white rounded-2xl p-1 border border-transparent hover:border-purple-200 shadow-sm hover:shadow-xl transition-all duration-300"
        >
          <div className="relative h-48 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl overflow-hidden mb-4 flex items-center justify-center group-hover:scale-[0.98] transition-transform">
            <div className="absolute inset-0 bg-grid-purple-500/[0.05] [mask-image:linear-gradient(0deg,white,transparent)]" />
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-500">
              <MessageSquare className="w-10 h-10" />
            </div>
          </div>
          <div className="px-5 pb-5">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">المساعد الذكي (Smart Assistant)</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              محادثة تفاعلية مع مساعد ذكي للحصول على توصيات علاجية، وكتابة تقارير، والإجابة على الأسئلة.
            </p>
            <div className="flex items-center text-purple-600 font-bold text-sm">
              فتح المحادثة <ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-[-4px] transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-gray-500" />
            سجل التشخيصات والتحليلات
            <div className="flex gap-2">
              {/* Filter buttons could go here */}
            </div>
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {aiHistory.length === 0 && chatHistory.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-300" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">لا يوجد سجل نشاط</h4>
              <p className="text-gray-500">لم يتم إجراء أي عمليات تحليل أو محادثات مع المساعد الذكي بعد.</p>
            </div>
          ) : (
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">النوع</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">التاريخ</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">النتيجة / الملخص</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {/* AI Image History */}
                {aiHistory.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Brain className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-900">تحليل صورة</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(item.created_at).toLocaleDateString('ar-IQ')}
                      <span className="block text-xs text-gray-400">{new Date(item.created_at).toLocaleTimeString('ar-IQ')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                             ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                           `}>
                        {item.status === 'completed' ? 'مكتمل' : 'جاري المعالجة'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => {
                          setSelectedAnalysis(item);
                          setIsAnalysisModalOpen(true);
                        }}>
                          عرض
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-600 hover:bg-gray-50" onClick={() => handleSaveToArchive(item, 'image')}>
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteAnalysis(item.id, 'image')}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Chat Mock History */}
                {chatHistory.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-900">محادثة</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm truncate max-w-xs">{item.summary}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => setIsChatModalOpen(true)}>
                          متابعة
                        </Button>
                        <Button size="sm" variant="ghost" className="text-gray-600 hover:bg-gray-50" onClick={() => handleSaveToArchive(item, 'chat')}>
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteAnalysis(item.id, 'chat')}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div >
  );



  /* Medical History State - Integrated locally for now */
  /* Medical History State - Integrated via usePatient */
  // We use the patient.medicalHistoryData directly from the hook primarily, 
  // but we might want local state for the form if editing.

  // For now simple toggle:


  const renderMedicalHistoryTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">

      {/* Sidebar - Summary & Vitals */}
      <div className="lg:col-span-4 space-y-6">
        {/* Vital Signs Card */}
        <Card className="p-0 overflow-hidden border-orange-200">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 border-b border-orange-200 flex justify-between items-center">
            <h3 className="font-bold text-orange-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              العلامات الحيوية
            </h3>
            <span className="text-xs text-orange-700 bg-white/50 px-2 py-1 rounded">حفظ تلقائي</span>
          </div>

          <div className="p-4 grid grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm text-center">
              <span className="text-xs text-gray-500 block mb-1">الضغط (BP)</span>
              <input
                key={`bp-${patientId}`} // Force re-render on patient change
                defaultValue={medicalData.vitals.bp}
                onBlur={(e) => handleVitalChange('bp', e.target.value)}
                className="w-full text-center font-bold text-xl text-gray-800 border-b border-transparent hover:border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="-"
              />
            </div>
            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm text-center">
              <span className="text-xs text-gray-500 block mb-1">السكر (Mg/dl)</span>
              <input
                key={`sugar-${patientId}`}
                defaultValue={medicalData.vitals.sugar}
                onBlur={(e) => handleVitalChange('sugar', e.target.value)}
                className="w-full text-center font-bold text-xl text-gray-800 border-b border-transparent hover:border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="-"
              />
            </div>
            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm text-center">
              <span className="text-xs text-gray-500 block mb-1">النبض (BPM)</span>
              <input
                key={`pulse-${patientId}`}
                defaultValue={medicalData.vitals.pulse}
                onBlur={(e) => handleVitalChange('pulse', e.target.value)}
                className="w-full text-center font-bold text-xl text-gray-800 border-b border-transparent hover:border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="-"
              />
            </div>
            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm text-center">
              <span className="text-xs text-gray-500 block mb-1">الوزن (Kg)</span>
              <input
                key={`weight-${patientId}`}
                defaultValue={medicalData.vitals.weight}
                onBlur={(e) => handleVitalChange('weight', e.target.value)}
                className="w-full text-center font-bold text-xl text-gray-800 border-b border-transparent hover:border-orange-200 focus:border-orange-500 focus:outline-none transition-colors"
                placeholder="-"
              />
            </div>
          </div>
        </Card>

        {/* Alerts Card */}
        <Card className="p-5 border-l-4 border-l-red-500 bg-red-50/20">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2 justify-between">
            <span className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-red-500" />
              تنبيهات طبية
            </span>
            <button
              onClick={() => setIsAddingAlert(!isAddingAlert)}
              className="text-xs bg-white/50 hover:bg-white text-red-600 px-2 py-1 rounded transition-colors"
            >
              {isAddingAlert ? 'إلغاء' : '+ إضافة'}
            </button>
          </h3>

          <div className="space-y-3">
            {isAddingAlert && (
              <div className="flex gap-2 animate-in slide-in-from-top-2">
                <input
                  value={newAlert}
                  onChange={(e) => setNewAlert(e.target.value)}
                  placeholder="اكتب التنبيه..."
                  className="flex-1 text-sm px-2 py-1 rounded border border-red-200 focus:outline-none focus:border-red-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddAlert();
                  }}
                />
                <Button size="sm" onClick={handleAddAlert} className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}

            {medicalData.allergies.map(allergy => (
              <div key={allergy} className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm font-bold flex justify-between items-center shadow-sm group">
                <span>{allergy === 'penicillin' ? 'حساسية: بنسيلين' : allergy}</span>
                <button
                  onClick={() => handleDeleteAlert(allergy)}
                  className="p-1 hover:bg-red-200 rounded text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="حذف التنبيه"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {medicalData.conditions.includes('hypertension') && (
              <div className="bg-yellow-50 text-yellow-800 px-3 py-2 rounded-lg text-sm font-bold border border-yellow-200 flex justify-between items-center">
                <span>تحذير: ضغط دم مرتفع</span>
                <Activity className="w-4 h-4" />
              </div>
            )}

            {medicalData.allergies.length === 0 && !medicalData.conditions.includes('hypertension') && !isAddingAlert && (
              <div className="text-center text-gray-500 text-sm py-2">لا توجد تنبيهات مسجلة</div>
            )}
          </div>
        </Card>
      </div>

      {/* Main Content - History Form */}
      <div className="lg:col-span-8 space-y-6">
        <Card className="p-6">
          <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            استبيان التاريخ الطبي
          </h3>

          <div className="space-y-8">
            {/* Systemic Diseases */}
            <div>
              <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">الأمراض المزمنة</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['diabetes', 'hypertension', 'heart_disease', 'asthma', 'hepatitis', 'bleeding_disorder'].map(cond => (
                  <label key={cond} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${medicalData.conditions.includes(cond) ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${medicalData.conditions.includes(cond) ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                      }`}>
                      {medicalData.conditions.includes(cond) && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={medicalData.conditions.includes(cond)}
                      onChange={() => toggleCondition(cond)}
                    />
                    <span className={`text-sm font-bold ${medicalData.conditions.includes(cond) ? 'text-blue-700' : 'text-gray-600'}`}>
                      {cond === 'diabetes' ? 'السكري' :
                        cond === 'hypertension' ? 'ضغط الدم' :
                          cond === 'heart_disease' ? 'مريض قلب' :
                            cond === 'asthma' ? 'الربو' :
                              cond === 'hepatitis' ? 'التهاب الكبد' : 'سيولة الدم'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">سجل الزيارات والعمليات</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddAppointment}
                  className="flex items-center gap-2 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  إضافة موعد
                </Button>
              </div>
              <div className="space-y-4 relative before:absolute before:inset-y-0 before:right-2.5 before:w-0.5 before:bg-gray-200 before:top-2 before:bottom-2">
                {patientAppointments.length > 0 ? (
                  patientAppointments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((appt, i) => {
                      const statusConfig = appointmentStatuses[appt.status] || { label: appt.status, color: '#666', bgColor: '#eee' };
                      const typeConfig = appointmentTypes.find(t => t.type === appt.type) || { label: appt.type, color: '#666', defaultDuration: 30 };

                      return (
                        <div key={appt.id} className="relative flex gap-4">
                          <div className={`w-6 h-6 rounded-full shrink-0 z-10 border-2 border-white shadow-sm mt-1 ${appt.type === 'surgery' ? 'bg-red-500' :
                            appt.type === 'emergency' ? 'bg-orange-500' :
                              appt.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                            }`}></div>
                          <div className="relative group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex transform hover:-translate-y-1 flex-1">

                            {/* Left Column: Date & Time */}
                            <div className={`w-24 shrink-0 flex flex-col items-center justify-center p-3 border-l border-gray-50
                            ${appt.type === 'surgery' ? 'bg-red-50 text-red-700' :
                                appt.type === 'consultation' ? 'bg-blue-50 text-blue-700' :
                                  appt.type === 'emergency' ? 'bg-orange-50 text-orange-700' :
                                    'bg-purple-50 text-purple-700'}
                          `}>
                              <span className="text-3xl font-black">{new Date(appt.date).getDate()}</span>
                              <span className="text-[10px] uppercase font-bold opacity-70 mb-2">
                                {new Date(appt.date).toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                              <div className="bg-white/60 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-sm">
                                {appt.startTime}
                              </div>
                            </div>

                            {/* Right Column: Details */}
                            <div className="flex-1 p-4 flex flex-col justify-between gap-3">
                              {/* Header: Doctor Info + Actions (Always Visible) */}
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm
                                    ${appt.doctorName ? 'bg-gray-50 text-gray-600' : 'bg-gray-100 text-gray-400'}
                                  `}>
                                    {appt.doctorName ? appt.doctorName.charAt(0).toUpperCase() : '?'}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-gray-900 text-sm">
                                      {appt.doctorName ? `د. ${appt.doctorName}` : 'غير محدد'}
                                    </h4>
                                    <span className="text-xs text-gray-500">طبيب أسنان</span>
                                  </div>
                                </div>

                                {/* Actions - Always Visible */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleEditAppointment(appt); }}
                                    className="w-8 h-8 flex items-center justify-center bg-white text-blue-600 rounded-xl shadow-sm border border-blue-100 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                    title="تعديل"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteAppointment(appt.id); }}
                                    className="w-8 h-8 flex items-center justify-center bg-white text-red-600 rounded-xl shadow-sm border border-red-100 hover:bg-red-50 hover:border-red-200 transition-colors"
                                    title="حذف"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Footer: ALL Badges (Type, Status, Priority) - No Conditions */}
                              <div className="flex flex-wrap gap-2 items-center mt-1">
                                {/* Type Badge */}
                                <span
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold border"
                                  style={{
                                    color: typeConfig.color,
                                    backgroundColor: `${typeConfig.color}10`,
                                    borderColor: `${typeConfig.color}20`
                                  }}
                                >
                                  {typeConfig.label}
                                </span>

                                {/* Status Badge */}
                                <span
                                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold border"
                                  style={{
                                    color: statusConfig.color,
                                    backgroundColor: statusConfig.bgColor,
                                    borderColor: `${statusConfig.color}20`
                                  }}
                                >
                                  {statusConfig.label}
                                </span>

                                {/* Priority Badge - Always Show */}
                                <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-bold border
                                ${appt.priority === 'urgent' ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' :
                                    appt.priority === 'high' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                      'bg-gray-50 text-gray-500 border-gray-100'}
                              `}>
                                  {appt.priority === 'urgent' && <AlertCircle className="w-3 h-3" />}
                                  {appt.priority === 'urgent' ? 'عاجل' :
                                    appt.priority === 'high' ? 'مهم' :
                                      'عادي'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">لا توجد زيارات مسجلة</div>
                )}
              </div>
            </div>

          </div>
        </Card>
      </div>

      {/* Modals */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setEditingAppointment(null);
        }}
        onSave={handleSaveAppointment}
        editingAppointment={editingAppointment}
        preSelectedPatient={(patient as any) || undefined}
        clinicId={effectiveClinicId.toString()}
      />
    </div>
  );

  if (patientLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">جاري تحميل ملف المريض...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 font-bold text-lg">لم يتم العثور على المريض</p>
          <Button className="mt-4" onClick={() => navigate('/doctor')}>
            العودة للقائمة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/doctor')}>
                <ArrowRight className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="px-2 py-1 text-lg font-bold text-gray-900 border border-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          if (patient && tempName.trim()) {
                            updatePatientProfile({ name: tempName });
                            // setPatient({ ...patient, name: tempName }); // Removed local set as hooks handle it
                            setIsEditingName(false);
                          }
                        }}
                        className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                        title="حفظ"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setTempName(patient?.name || '');
                          setIsEditingName(false);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-full"
                        title="إلغاء"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 group">
                      ملف المريض: {patient?.name || 'جاري التحميل...'}
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50"
                        title="تعديل الاسم"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${patient?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {patient?.status === 'active' ? 'نشط' : (patient?.status === 'emergency' ? 'طوارئ' : 'غير نشط')}
                      </span>
                    </h1>
                  )}
                </div>
                <p className="text-xs text-gray-500">رقم الملف: #{patientId?.slice(0, 8) || '...'} • آخر زيارة: {patient?.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('en-GB') : '-'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm"><SettingsIcon className="w-4 h-4 ml-2" /> إعدادات</Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-6 space-x-reverse overflow-x-auto">
            {[
              { id: 'overview', label: 'نظرة عامة' },
              { id: 'treatment', label: 'خطة العلاج' },

              { id: 'smart', label: 'الخدمات الذكية' },
              { id: 'archive', label: 'الأرشيف' },
              { id: 'finance', label: 'المالية' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 pt-1 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'treatment' && renderTreatmentPlanTab()}
        {activeTab === 'medical' && renderMedicalHistoryTab()}
        {activeTab === 'smart' && renderSmartServicesTab()}
        {activeTab === 'archive' && renderArchiveTab()}
        {activeTab === 'finance' && renderFinanceTab()}
      </div>

      <ToothInteractionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        toothNumbers={selectedTeethNumbers}
        onSave={handleModalSave}
        availableTreatments={clinicTreatments.map(t => ({
          id: t.id,
          name: t.name,
          category: t.category,
          basePrice: t.basePrice,
          costEstimate: t.costEstimate,
          profitMargin: t.profitMargin,
          popularity: t.popularity,
          expectedSessions: t.expectedSessions,
          isActive: t.isActive,
          isComplex: t.isComplex,
          scope: t.scope,
          totalRevenue: t.totalRevenue || 0
        }))}
      />

      {/* Unified Details Popup for Existing Teeth */}
      <Modal
        isOpen={isDetailsPopupOpen}
        onClose={() => setIsDetailsPopupOpen(false)}
        title={`تفاصيل ${selectedTeethNumbers.length > 1 ? 'الأسنان المحددة' : `السن #${selectedTeethNumbers[0]}`}`}
        size="md"
        contentClassName="p-0"
      >
        <div className="flex flex-col bg-gray-50/50">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 shadow-md border-b border-indigo-800/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 min-w-[3.5rem] px-3 bg-white/20 rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg border border-white/30 backdrop-blur-sm">
                {selectedTeethNumbers.join(', ')}
              </div>
              <div>
                <h3 className="text-xl font-bold">
                  {selectedTeethNumbers.length > 1 ? 'مجموعة أسنان محددة' : `تفاصيل السن`}
                </h3>
                <p className="text-blue-100 opacity-90 mt-1 text-sm">
                  {selectedTeethNumbers.length > 1 ? `يحتوي على ${selectedTeethNumbers.length} أسنان` : 'تحقق من حالة السن والخطط المرتبطة به'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">

            {/* Condition List */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm max-h-[30vh] overflow-y-auto">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                الحالة الحالية
              </h4>
              <div className="space-y-3">
                {patientTeeth.filter(t => selectedTeethNumbers.includes(t.number)).map(tooth => (
                  <div key={tooth.number} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-inner">
                        {tooth.number}
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${tooth.condition === 'healthy' ? 'bg-green-100 text-green-800' :
                          tooth.condition === 'decayed' ? 'bg-red-100 text-red-800' :
                            tooth.condition === 'missing' ? 'bg-gray-200 text-gray-800' :
                              tooth.condition === 'filled' ? 'bg-blue-100 text-blue-800' :
                                tooth.condition === 'crown' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-indigo-50 text-indigo-800'
                          }`}>
                          {tooth.condition === 'healthy' ? 'سليم' :
                            tooth.condition === 'decayed' ? 'تسوس' :
                              tooth.condition === 'missing' ? 'مفقود' :
                                tooth.condition === 'filled' ? 'محشو' :
                                  tooth.condition === 'crown' ? 'تاج' :
                                    tooth.condition}
                        </span>
                        {tooth.notes && <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">{tooth.notes}</p>}
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs px-2 h-8" onClick={(e) => {
                      e.stopPropagation();
                      handleEditCondition(tooth);
                    }}>تعديل الحالة</Button>
                  </div>
                ))}
              </div>
            </div>

            {/* History Section - Only reliable for single tooth currently */}
            {selectedTeethNumbers.length === 1 && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  تاريخ العلاجات السابقة
                </h4>
                {(selectedTooth?.existingTreatments?.length || 0) > 0 ? (
                  <ul className="space-y-2">
                    {selectedTooth!.existingTreatments!.map((tx, idx) => (
                      <li key={idx} className="text-sm flex items-center gap-2 text-gray-600 bg-white p-2 rounded shadow-sm border-r-2 border-gray-300">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {tx}
                      </li>
                    ))}
                  </ul>
                ) : treatmentPlans.filter(p => {
                  // Support plans linked to array of teeth or single toothNumber
                  const tNums = p.toothNumbers || [p.toothNumber];
                  return tNums.includes(selectedTooth?.number) && p.status === 'completed';
                }).length > 0 ? (
                  <ul className="space-y-2">
                    {treatmentPlans.filter(p => {
                      const tNums = p.toothNumbers || [p.toothNumber];
                      return tNums.includes(selectedTooth?.number) && p.status === 'completed';
                    }).map((plan, idx) => (
                      <li key={plan.id} className="text-sm flex items-center justify-between text-gray-600 bg-white p-2 rounded shadow-sm border-r-2 border-green-500">
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          {plan.notes || getTreatmentLabel(plan.type)}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(plan.startDate).toLocaleDateString('en-GB')}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">لا توجد علاجات سابقة مسجلة</p>
                )}
              </div>
            )}

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                الخطط العلاجية النشطة المرتبطة
              </h4>
              {treatmentPlans.filter(p => {
                const tNums = p.toothNumbers || [p.toothNumber];
                return tNums.some(n => selectedTeethNumbers.includes(n)) && p.status !== 'completed';
              }).length > 0 ? (
                <ul className="space-y-3">
                  {treatmentPlans.filter(p => {
                    const tNums = p.toothNumbers || [p.toothNumber];
                    return tNums.some(n => selectedTeethNumbers.includes(n)) && p.status !== 'completed';
                  }).map((plan, idx) => (
                    <li key={plan.id} className="text-sm bg-white p-3 rounded-lg shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="min-w-[1.5rem] px-2 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                            {(plan.toothNumbers || [plan.toothNumber]).join(', ')}
                          </span>
                          <div>
                            <span className="font-bold text-gray-800 block">
                              {plan.notes || getTreatmentLabel(plan.type)}
                            </span>
                            <span className="text-[10px] text-gray-400 block mt-0.5">ID: {plan.id.slice(0, 6)} • {new Date(plan.startDate).toLocaleDateString('en-GB')}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCancelPlan(plan.id)}
                          className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-all"
                          title="إلغاء الخطة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">التقدم: {plan.completedSessions} / {plan.totalSessions} جلسات</span>
                          <span className="font-bold text-blue-600">{Math.round((plan.completedSessions / plan.totalSessions) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${(plan.completedSessions / plan.totalSessions) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 bg-white p-3 rounded-lg border border-dashed border-gray-300">لا توجد خطط نشطة حالياً.</p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-100 grid gap-3">
              <Button onClick={handleAddTreatment} className="w-full justify-center text-base py-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200">
                إضافة خطة علاجية لـ {selectedTeethNumbers.length} أسنان
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <ToothConditionModal
        isOpen={isConditionModalOpen}
        onClose={() => setIsConditionModalOpen(false)}
        toothNumber={selectedTooth?.number || 0}
        initialCondition={selectedTooth?.condition}
        initialNotes={selectedTooth?.notes}
        onSave={handleSaveCondition}
      />




      {/* Unified Lab Order Modal */}
      <CreateOrderModal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        clinicId={effectiveClinicId}
        patientId={patientId}
        patientName={patient?.name}
        selectedPlanId={selectedLabPlan?.id}
      />

      {/* Image Analysis Modal */}
      <Modal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        title="تشخيص الصور بالأشعة والذكاء الاصطناعي"
      >
        <div className="space-y-6">
          {renderAnalysisModalContent()}
        </div>
      </Modal>

      {/* Smart Assistant Modal */}
      <Modal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        title="المساعد الطبي الذكي"
        contentClassName="p-0 overflow-hidden flex flex-col h-[65vh]"
        size="lg"
      >
        <div className="flex-1 flex flex-col h-full overflow-hidden min-h-0">
          <SmartAssistantChat patientId={patient.id} patientName={patient.name} onSave={handleSaveChat} />
        </div>
      </Modal>
      {/* Financial Transaction Modal */}
      <ComprehensiveTransactionModal
        isOpen={isFinanceModalOpen}
        onClose={() => setIsFinanceModalOpen(false)}
        type={financeModalType}
        clinicId={effectiveClinicId}
        preselectedPatientId={patientId}
        prefillData={financePrefillData || {
          amount: financeAmount,
          treatmentId: selectedFinancePlanId,
          description: selectedFinanceSessionId ? `دفعة مالية - جلسة علاج (Plan: ${selectedFinancePlanId})` : '',
        }}
        onSave={handleSaveFinance}
        lockFields={financePrefillData ? ['amount', 'patient', 'treatment'] : (selectedFinancePlanId ? ['amount', 'patient', 'treatment'] : [])}
      />

      {/* General Treatment Modal */}
      <GeneralTreatmentModal
        isOpen={isGeneralModalOpen}
        onClose={() => setIsGeneralModalOpen(false)}
        availableTreatments={clinicTreatments}
        onSave={handleSaveGeneralTreatment}
      />
    </div>
  );
};
