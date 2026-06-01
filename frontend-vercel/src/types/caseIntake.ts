// TypeScript types for Case Intake (Medical Questionnaire) System
// Corresponds to database schema in add_case_intake_system.sql

export type CaseIntakeStatus = 'draft' | 'submitted' | 'under_review' | 'archived';

export type OnsetTimeCategory = '<1month' | '1-6months' | '6-12months' | '>1year';

export type DiagnosisStage = 'undiagnosed' | 'preliminary' | 'confirmed' | 'post_treatment';

export type SymptomSeverity = 'mild' | 'moderate' | 'severe';

export type MainCategory = 'surgery' | 'tumor' | 'fertility' | 'cosmetic' | 'cardiovascular' | 'general' | 'other';

export type TreatmentExpectation = 'diagnosis' | 'treatment_plan' | 'second_opinion' | 'cost_evaluation' | 'post_treatment_followup';

export type BudgetRange = '0-5k' | '5-10k' | '10-20k' | '20-50k' | '>50k' | 'uncertain';

export type PreferredTiming = 'within_1month' | '1-3months' | '3-6months' | '>6months' | 'flexible';

export type ContactChannel = 'email' | 'phone' | 'wechat' | 'whatsapp';

// ============================================================================
// Step 2: Quick Triage and Classification
// ============================================================================

export interface Step2Data {
  // Q1: Primary location (structured)
  primary_location: string; // Single choice from predefined locations
  primary_location_other?: string; // If 'other' is selected
  
  // Q2: Symptom nature (structured)
  symptom_nature: string[]; // Multiple choice from predefined symptom types
  symptom_nature_other?: string; // Additional notes
  
  // Onset and course
  onset_and_course: {
    category: OnsetTimeCategory;
    progression_trend?: string; // 'worsening', 'fluctuating', 'stable', 'improving'
    description: string;
  };
  
  // Diagnosis stage and category
  current_diagnosis_stage: DiagnosisStage;
  main_category: MainCategory;
  
  // Legacy field for backward compatibility (auto-generated from location + nature)
  chief_complaint?: string;
  
  // Step 2-2: Secondary questions (conditional)
  secondary_category?: string;
  is_surgery_related?: boolean;
  is_tumor_related?: boolean;
  symptom_severity?: SymptomSeverity;
}

// ============================================================================
// Step 3: Present Illness Details (现病史)
// ============================================================================

export interface Step3Data {
  detailed_symptoms: string;
  symptom_location?: string;
  symptom_characteristics?: string;
  progression: string;
  aggravating_factors?: string;
  relieving_factors?: string;
  impact_on_daily_life?: string;
  previous_treatments_tried?: string;
}

// ============================================================================
// Step 4: Past Medical History & Family History (既往史与家族史)
// ============================================================================

export interface PastSurgery {
  name: string;
  date: string;
  hospital?: string;
  complications?: string;
}

export interface Step4Data {
  // Past major diseases (multi-select + text)
  past_medical_history: {
    hypertension?: boolean;
    diabetes?: boolean;
    heart_disease?: boolean;
    stroke?: boolean;
    hepatitis?: boolean;
    kidney_disease?: boolean;
    cancer?: boolean;
    tuberculosis?: boolean;
    other?: string;
    none?: boolean;
  };
  
  // Past surgeries
  has_past_surgeries: boolean;
  past_surgeries?: PastSurgery[];
  
  // Chronic conditions
  has_chronic_conditions: boolean;
  chronic_conditions_description?: string;
  
  // Family history
  has_family_history: boolean;
  family_history_description?: string;
}

// ============================================================================
// Step 5: Medications and Allergies (用药与过敏)
// ============================================================================

export interface Medication {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  purpose?: string;
}

export interface Allergen {
  substance: string;
  reaction: string;
}

export interface Step5Data {
  // Current medications
  has_current_medications: boolean;
  medication_types_selected?: string[]; // Multiple choice common medication types
  current_medications?: Medication[];
  
  // Allergies
  has_allergies: boolean;
  allergies?: {
    drug_allergies?: Allergen[];
    food_allergies?: Allergen[];
    other_allergies?: string;
  };
}

// ============================================================================
// Step 6: Examinations and Test Results (检查检验结果)
// ============================================================================

export interface MedicalExam {
  type: string; // 'CT', 'MRI', 'X-ray', 'Ultrasound', 'Blood test', etc.
  date: string;
  hospital?: string;
  findings?: string;
}

// Uploaded file info
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: 'exam' | 'lab' | 'imaging' | 'pathology' | 'other';
  uploadedAt: string;
  url?: string; // URL after upload to storage
}

export interface Step6Data {
  // Recent examinations
  has_recent_exams: boolean;
  recent_exams?: MedicalExam[];
  exam_types_selected?: string[]; // Multiple choice exam types
  exam_details_summary?: string; // Summary of all exams

  // Lab results summary
  has_lab_results: boolean;
  lab_results_summary?: string;

  // Imaging availability
  has_imaging_available: boolean;
  imaging_description?: string;

  // Pathology reports (if applicable)
  has_pathology_report: boolean;
  pathology_summary?: string;

  // Files provision intent
  can_provide_files: boolean;
  files_provision_notes?: string;

  // Uploaded files
  uploaded_files?: UploadedFile[];
  // Files by exam type (key is exam type like 'ct', 'mri', etc.)
  exam_files?: Record<string, UploadedFile[]>;
}

// ============================================================================
// Step 7: Treatment Expectations and Logistics (诊疗期待与安排)
// ============================================================================

export interface Step7Data {
  // Treatment expectations (multi-select)
  treatment_expectations: TreatmentExpectation[];
  treatment_expectations_other?: string;
  
  // Budget
  budget_range: BudgetRange;
  budget_notes?: string;
  
  // Timing
  preferred_timing: PreferredTiming;
  timing_constraints?: string;
  
  // Additional information
  additional_notes?: string;
  
  // Preferred contact method
  preferred_contact_channel?: ContactChannel;
  best_contact_time?: string;
}

// ============================================================================
// Complete Case Intake Form Data (all steps combined)
// ============================================================================

export interface CaseIntakeFormData {
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;
  step7: Step7Data;
}

// ============================================================================
// Case Intake Record (from database)
// ============================================================================

export interface CaseIntake {
  id: string;
  user_id: string;
  status: CaseIntakeStatus;
  current_step: number; // 2-7
  
  // Extracted structured fields
  chief_complaint?: string;
  main_category?: MainCategory;
  onset_time_category?: OnsetTimeCategory;
  current_diagnosis_stage?: DiagnosisStage;
  
  // Complete form data
  form_data: CaseIntakeFormData;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  submitted_at?: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface CreateCaseIntakeRequest {
  form_data: Partial<CaseIntakeFormData>;
  current_step: number;
  status: CaseIntakeStatus;
}

export interface UpdateCaseIntakeRequest {
  id: string;
  form_data: Partial<CaseIntakeFormData>;
  current_step?: number;
  status?: CaseIntakeStatus;
}

export interface CaseIntakeStats {
  total_count: number;
  draft_count: number;
  submitted_count: number;
  latest_submission_date?: string;
  has_active_draft: boolean;
}

export interface CaseIntakeSummary {
  current?: CaseIntake;
  stats: CaseIntakeStats;
}

