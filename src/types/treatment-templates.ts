// Treatment Template Types

export interface TreatmentTemplate {
  id: string;
  name: string;
  description?: string;
  category: TreatmentCategory;
  steps: TemplateField[];
  estimatedCost?: number;
  estimatedDuration?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomTreatmentPlan {
  id: string;
  templateId?: string;
  patientId: string;
  customFields: Record<string, any>;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdAt?: string;
}

export interface TemplateField {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: any;
  options?: string[];
}

export interface CustomTemplate {
  id: string;
  name: string;
  fields: TemplateField[];
  isPublic?: boolean;
  createdBy?: string;
}

export interface TreatmentTemplateFilters {
  category?: TreatmentCategory;
  search?: string;
  isPublic?: boolean;
}

export interface TemplateUsage {
  templateId: string;
  count: number;
  lastUsed?: string;
}

export type TreatmentCategory = 
  | 'root_canal'
  | 'crown'
  | 'filling'
  | 'extraction'
  | 'cleaning'
  | 'orthodontics'
  | 'veneer'
  | 'implant'
  | 'other';

export interface TemplateFormData {
  name: string;
  category: TreatmentCategory;
  description?: string;
  steps: TemplateField[];
}

export interface CostItem {
  id: string;
  description: string;
  amount: number;
}

export interface SessionDetail {
  id: string;
  sessionNumber: number;
  description: string;
  duration: number;
  cost?: number;
}
