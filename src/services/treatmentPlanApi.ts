// خدمة API للخطط العلاجية ومخطط الأسنان التفاعلي
// تاريخ الإنشاء: 2024-11-16

import { supabase } from '../lib/supabase';

// أنواع البيانات
export interface ToothData {
  id?: string;
  patient_id: string;
  tooth_number: number;
  tooth_type: string;
  condition: 'present' | 'healthy' | 'missing' | 'lost' | 'cavity' | 'stained' | 'broken' | 'mobile' | 'decayed' | 'calculus' | 'abnormal_shape' | 'abnormal_position';
  diagnosis?: string[];
  treatment_notes?: string;
  root_treatment_sessions?: number;
  root_treatment_notes?: string;
  cost?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface TreatmentPlan {
  id?: string;
  patient_id: string;
  tooth_number: number;
  tooth_numbers?: number[];
  tooth_type: string;
  overall_status: 'healthy' | 'needs_treatment' | 'in_progress' | 'completed' | 'post_treatment' | 'failed';
  status: 'planned' | 'started' | 'in_progress' | 'completed' | 'failed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  treatment_type: string;
  diagnosis: string;
  treatment_description: string;
  alternative_treatments?: string[];
  contraindications?: string[];
  estimated_cost?: number;
  actual_cost?: number;
  session_count?: number;
  completed_sessions?: number;
  estimated_duration?: number;
  actual_duration?: number;
  estimated_start_date?: string;
  actual_start_date?: string;
  estimated_completion_date?: string;
  actual_completion_date?: string;
  follow_up_required?: boolean;
  follow_up_date?: string;
  follow_up_notes?: string;
  complications?: string[];
  assigned_doctor: string;
  assigned_technician?: string;
  assigned_nurse?: string;
  outcome?: 'success' | 'partial' | 'failure' | 'complication' | 'pending';
  patient_satisfaction?: number;
  long_term_prognosis?: string;
  initial_notes: string;
  progress_notes?: string[];
  final_notes?: string;
  financial_status: 'pending' | 'partial_payment' | 'paid' | 'refunded' | 'overdue';
  payment_method?: string;
  invoice_generated?: boolean;
  created_at?: string;
  last_updated?: string;
  created_by?: string;
  last_updated_by?: string;
}

export interface TreatmentPhase {
  id?: string;
  plan_id: string;
  name: string;
  phase_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  estimated_duration?: number;
  actual_duration?: number;
  prerequisites?: string[];
  next_phases?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TreatmentTask {
  id?: string;
  phase_id: string;
  task_name: string;
  description: string;
  task_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  estimated_time: number;
  actual_time?: number;
  assigned_to?: string;
  materials?: string[];
  equipment?: string[];
  completion_criteria?: string[];
  dependencies?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TreatmentSession {
  id?: string;
  plan_id: string;
  session_number: number;
  session_date: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  session_status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  phase_name?: string;
  procedure_name: string;
  findings?: string[];
  complications?: string[];
  medications?: string[];
  instructions?: string;
  next_session_plan?: string;
  follow_up_required?: boolean;
  amount_charged?: number;
  amount_paid?: number;
  assistant?: string;
  equipment_used?: string[];
  materials_used?: string[];
  photos_taken?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// خدمة البيانات الأساسية للأسنان
export const ToothService = {
  // الحصول على جميع الأسنان لمريض معين
  async getPatientTeeth(patientId: string): Promise<ToothData[]> {
    try {
      const { data, error } = await supabase
        .from('patient_teeth')
        .select('*')
        .eq('patient_id', patientId)
        .order('tooth_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching patient teeth:', error);
      throw error;
    }
  },

  // الحصول على معلومات سن محدد
  async getTooth(patientId: string, toothNumber: number): Promise<ToothData | null> {
    try {
      const { data, error } = await supabase
        .from('patient_teeth')
        .select('*')
        .eq('patient_id', patientId)
        .eq('tooth_number', toothNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // لا توجد بيانات
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching tooth:', error);
      throw error;
    }
  },

  // إنشاء أو تحديث معلومات سن
  async saveTooth(toothData: Partial<ToothData>): Promise<ToothData> {
    try {
      const { data, error } = await supabase
        .from('patient_teeth')
        .upsert(toothData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving tooth:', error);
      throw error;
    }
  },

  // حذف معلومات سن
  async deleteTooth(patientId: string, toothNumber: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('patient_teeth')
        .delete()
        .eq('patient_id', patientId)
        .eq('tooth_number', toothNumber);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting tooth:', error);
      throw error;
    }
  },

  // الحصول على إحصائيات الأسنان لمريض
  async getPatientTeethStats(patientId: string): Promise<{
    total: number;
    healthy: number;
    needs_treatment: number;
    in_progress: number;
    completed: number;
    missing: number;
  }> {
    try {
      const { data, error } = await supabase
        .rpc('get_patient_teeth_stats', { patient_uuid: patientId });

      if (error) throw error;

      return data?.[0] || {
        total: 0,
        healthy: 0,
        needs_treatment: 0,
        in_progress: 0,
        completed: 0,
        missing: 0
      };
    } catch (error) {
      console.error('Error fetching teeth stats:', error);
      throw error;
    }
  }
};

// خدمة الخطط العلاجية
export const TreatmentPlanService = {
  // الحصول على الخطط العلاجية لمريض
  async getPatientTreatmentPlans(patientId: string): Promise<TreatmentPlan[]> {
    try {
      const { data, error } = await supabase
        .from('tooth_treatment_plans')
        .select('*')
        .eq('patient_id', patientId)
        .order('tooth_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching treatment plans:', error);
      throw error;
    }
  },

  // الحصول على خطة علاجية محددة
  async getTreatmentPlan(planId: string): Promise<TreatmentPlan | null> {
    try {
      const { data, error } = await supabase
        .from('tooth_treatment_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error fetching treatment plan:', error);
      throw error;
    }
  },

  // إنشاء خطة علاجية جديدة
  async createTreatmentPlan(planData: Partial<TreatmentPlan>): Promise<TreatmentPlan> {
    try {
      // التأكد من وجود معلومات السن الأساسية
      if (!planData.patient_id || !planData.tooth_number) {
        throw new Error('Patient ID and tooth number are required');
      }

      const { data, error } = await supabase
        .from('tooth_treatment_plans')
        .insert([{
          ...planData,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating treatment plan:', error);
      throw error;
    }
  },

  // تحديث خطة علاجية
  async updateTreatmentPlan(planId: string, updates: Partial<TreatmentPlan>): Promise<TreatmentPlan> {
    try {
      const { data, error } = await supabase
        .from('tooth_treatment_plans')
        .update({
          ...updates,
          last_updated: new Date().toISOString()
        })
        .eq('id', planId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating treatment plan:', error);
      throw error;
    }
  },

  // حذف خطة علاجية
  async deleteTreatmentPlan(planId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tooth_treatment_plans')
        .delete()
        .eq('id', planId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting treatment plan:', error);
      throw error;
    }
  },

  // الحصول على خطط العلاج لمسن محدد
  async getTreatmentPlansForTooth(patientId: string, toothNumber: number): Promise<TreatmentPlan[]> {
    try {
      const { data, error } = await supabase
        .from('tooth_treatment_plans')
        .select('*')
        .eq('patient_id', patientId)
        .eq('tooth_number', toothNumber)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching tooth treatment plans:', error);
      throw error;
    }
  }
};

// خدمة المراحل العلاجية
export const TreatmentPhaseService = {
  // الحصول على المراحل لخطة علاجية
  async getTreatmentPhases(planId: string): Promise<TreatmentPhase[]> {
    try {
      const { data, error } = await supabase
        .from('treatment_phases')
        .select('*')
        .eq('plan_id', planId)
        .order('phase_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching treatment phases:', error);
      throw error;
    }
  },

  // إنشاء مرحلة جديدة
  async createTreatmentPhase(phaseData: Partial<TreatmentPhase>): Promise<TreatmentPhase> {
    try {
      const { data, error } = await supabase
        .from('treatment_phases')
        .insert([phaseData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating treatment phase:', error);
      throw error;
    }
  },

  // تحديث مرحلة
  async updateTreatmentPhase(phaseId: string, updates: Partial<TreatmentPhase>): Promise<TreatmentPhase> {
    try {
      const { data, error } = await supabase
        .from('treatment_phases')
        .update(updates)
        .eq('id', phaseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating treatment phase:', error);
      throw error;
    }
  },

  // حذف مرحلة
  async deleteTreatmentPhase(phaseId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('treatment_phases')
        .delete()
        .eq('id', phaseId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting treatment phase:', error);
      throw error;
    }
  }
};

// خدمة المهام العلاجية
export const TreatmentTaskService = {
  // الحصول على المهام لمرحلة معينة
  async getTreatmentTasks(phaseId: string): Promise<TreatmentTask[]> {
    try {
      const { data, error } = await supabase
        .from('treatment_tasks')
        .select('*')
        .eq('phase_id', phaseId)
        .order('task_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching treatment tasks:', error);
      throw error;
    }
  },

  // إنشاء مهمة جديدة
  async createTreatmentTask(taskData: Partial<TreatmentTask>): Promise<TreatmentTask> {
    try {
      const { data, error } = await supabase
        .from('treatment_tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating treatment task:', error);
      throw error;
    }
  },

  // تحديث مهمة
  async updateTreatmentTask(taskId: string, updates: Partial<TreatmentTask>): Promise<TreatmentTask> {
    try {
      const { data, error } = await supabase
        .from('treatment_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating treatment task:', error);
      throw error;
    }
  },

  // حذف مهمة
  async deleteTreatmentTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('treatment_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting treatment task:', error);
      throw error;
    }
  }
};

// خدمة جلسات العلاج
export const TreatmentSessionService = {
  // الحصول على الجلسات لخطة علاجية
  async getTreatmentSessions(planId: string): Promise<TreatmentSession[]> {
    try {
      const { data, error } = await supabase
        .from('treatment_sessions')
        .select('*')
        .eq('plan_id', planId)
        .order('session_number', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching treatment sessions:', error);
      throw error;
    }
  },

  // إنشاء جلسة جديدة
  async createTreatmentSession(sessionData: Partial<TreatmentSession>): Promise<TreatmentSession> {
    try {
      const { data, error } = await supabase
        .from('treatment_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating treatment session:', error);
      throw error;
    }
  },

  // تحديث جلسة
  async updateTreatmentSession(sessionId: string, updates: Partial<TreatmentSession>): Promise<TreatmentSession> {
    try {
      const { data, error } = await supabase
        .from('treatment_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating treatment session:', error);
      throw error;
    }
  },

  // حذف جلسة
  async deleteTreatmentSession(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('treatment_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting treatment session:', error);
      throw error;
    }
  }
};

// خدمة البيانات المدمجة
export const TreatmentPlanApi = {
  // إنشاء خطة علاجية كاملة مع المراحل والمهام
  async createCompleteTreatmentPlan(planData: {
    tooth: Partial<ToothData>;
    treatmentPlan: Partial<TreatmentPlan>;
    phases?: Partial<TreatmentPhase>[];
    tasks?: Partial<TreatmentTask>[];
  }): Promise<{
    tooth: ToothData;
    treatmentPlan: TreatmentPlan;
    phases?: TreatmentPhase[];
    tasks?: TreatmentTask[];
  }> {
    try {
      // بدء معاملة قاعدة البيانات
      const { data: toothData, error: toothError } = await supabase
        .from('patient_teeth')
        .upsert(planData.tooth)
        .select()
        .single();

      if (toothError) throw toothError;

      // إنشاء الخطة العلاجية
      const { data: treatmentPlanData, error: planError } = await supabase
        .from('tooth_treatment_plans')
        .insert([{
          ...planData.treatmentPlan,
          patient_id: planData.tooth.patient_id,
          tooth_number: planData.tooth.tooth_number,
          created_at: new Date().toISOString(),
          last_updated: new Date().toISOString()
        }])
        .select()
        .single();

      if (planError) throw planError;

      // إنشاء المراحل إذا وجدت
      let phasesData: TreatmentPhase[] | undefined;
      if (planData.phases && planData.phases.length > 0) {
        const phasesWithPlanId = planData.phases.map(phase => ({
          ...phase,
          plan_id: treatmentPlanData.id
        }));

        const { data: phases, error: phasesError } = await supabase
          .from('treatment_phases')
          .insert(phasesWithPlanId)
          .select();

        if (phasesError) throw phasesError;
        phasesData = phases;
      }

      // إنشاء المهام إذا وجدت
      let tasksData: TreatmentTask[] | undefined;
      if (planData.tasks && planData.tasks.length > 0 && phasesData && phasesData.length > 0) {
        const tasksWithPhaseId = planData.tasks.map((task, index) => {
          const phaseId = phasesData![index % phasesData!.length].id;
          return {
            ...task,
            phase_id: phaseId
          };
        });

        const { data: tasks, error: tasksError } = await supabase
          .from('treatment_tasks')
          .insert(tasksWithPhaseId)
          .select();

        if (tasksError) throw tasksError;
        tasksData = tasks;
      }

      return {
        tooth: toothData,
        treatmentPlan: treatmentPlanData,
        phases: phasesData,
        tasks: tasksData
      };
    } catch (error) {
      console.error('Error creating complete treatment plan:', error);
      throw error;
    }
  },

  // الحصول على بيانات شاملة لمخطط الأسنان
  async getToothChartData(patientId: string): Promise<{
    teeth: (ToothData & { treatmentPlan?: TreatmentPlan })[];
    stats: {
      total: number;
      healthy: number;
      needs_treatment: number;
      in_progress: number;
      completed: number;
      missing: number;
    };
  }> {
    try {
      // الحصول على جميع الأسنان
      const teeth = await ToothService.getPatientTeeth(patientId);

      // الحصول على جميع الخطط العلاجية
      const treatmentPlans = await TreatmentPlanService.getPatientTreatmentPlans(patientId);

      // دمج البيانات
      const teethWithPlans = teeth.map(tooth => {
        const plan = treatmentPlans.find(p =>
          p.tooth_number === tooth.tooth_number
        );
        return {
          ...tooth,
          treatmentPlan: plan
        };
      });

      // حساب الإحصائيات
      const stats = await ToothService.getPatientTeethStats(patientId);

      return {
        teeth: teethWithPlans,
        stats
      };
    } catch (error) {
      console.error('Error fetching tooth chart data:', error);
      throw error;
    }
  },

  // تحديث حالة السن وخطة العلاج
  async updateToothAndPlan(
    patientId: string,
    toothNumber: number,
    updates: {
      tooth?: Partial<ToothData>;
      treatmentPlan?: Partial<TreatmentPlan>;
    }
  ): Promise<{
    tooth: ToothData;
    treatmentPlan?: TreatmentPlan;
  }> {
    try {
      // تحديث معلومات السن
      const updatedTooth = await ToothService.saveTooth({
        patient_id: patientId,
        tooth_number: toothNumber,
        ...updates.tooth
      });

      let updatedPlan: TreatmentPlan | undefined;

      // تحديث أو إنشاء خطة العلاج إذا وجدت
      if (updates.treatmentPlan) {
        const existingPlans = await TreatmentPlanService.getTreatmentPlansForTooth(
          patientId,
          toothNumber
        );

        if (existingPlans.length > 0) {
          // تحديث الخطة الموجودة
          updatedPlan = await TreatmentPlanService.updateTreatmentPlan(
            existingPlans[0].id!,
            updates.treatmentPlan
          );
        } else {
          // إنشاء خطة جديدة
          updatedPlan = await TreatmentPlanService.createTreatmentPlan({
            patient_id: patientId,
            tooth_number: toothNumber,
            ...updates.treatmentPlan
          });
        }
      }

      return {
        tooth: updatedTooth,
        treatmentPlan: updatedPlan
      };
    } catch (error) {
      console.error('Error updating tooth and plan:', error);
      throw error;
    }
  },

  // الحصول على ملخص خطة العلاج
  async getTreatmentPlanSummary(planId: string): Promise<{
    plan: TreatmentPlan;
    phases: TreatmentPhase[];
    tasks: TreatmentTask[];
    sessions: TreatmentSession[];
    progress: {
      totalPhases: number;
      completedPhases: number;
      totalTasks: number;
      completedTasks: number;
      totalSessions: number;
      completedSessions: number;
      overallProgress: number;
    };
  }> {
    try {
      // الحصول على الخطة الأساسية
      const plan = await TreatmentPlanService.getTreatmentPlan(planId);
      if (!plan) throw new Error('Treatment plan not found');

      // الحصول على المراحل والمهام والجلسات
      const [phases, sessions] = await Promise.all([
        TreatmentPhaseService.getTreatmentPhases(planId),
        TreatmentSessionService.getTreatmentSessions(planId)
      ]);

      const tasksResults = await Promise.all(phases.map(phase => TreatmentTaskService.getTreatmentTasks(phase.id!)));
      const tasks = tasksResults.flat() as TreatmentTask[];

      // حساب التقدم
      const totalPhases = phases.length;
      const completedPhases = phases.filter(p => p.status === 'completed').length;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(s => s.session_status === 'completed').length;

      // حساب النسبة المئوية الشاملة للتقدم
      const phaseProgress = totalPhases > 0 ? (completedPhases / totalPhases) * 40 : 0;
      const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 35 : 0;
      const sessionProgress = totalSessions > 0 ? (completedSessions / totalSessions) * 25 : 0;
      const overallProgress = Math.round(phaseProgress + taskProgress + sessionProgress);

      return {
        plan,
        phases,
        tasks,
        sessions,
        progress: {
          totalPhases,
          completedPhases,
          totalTasks,
          completedTasks,
          totalSessions,
          completedSessions,
          overallProgress
        }
      };
    } catch (error) {
      console.error('Error fetching treatment plan summary:', error);
      throw error;
    }
  }
};

export default TreatmentPlanApi;
