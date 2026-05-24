export type AdminPatientSummary = {
  patientId: string;
  displayName?: string;
  email?: string;
  state?: string;
  lifecycleState: string;
  reviewStatus?: string;
  subscriptionStatus?: string;
  updatedAt?: string;
};

export type AdminPatientDetail = AdminPatientSummary & {
  refillStatus?: string;
  prescriptionStatus?: string;
  fulfillmentStatus?: string;
  currentIntakeId?: string;
};

export type AuditLogSummary = {
  auditLogId: string;
  timestamp?: string;
  actorType?: string;
  actorId?: string;
  actorRole?: string;
  action?: string;
  patientId?: string;
  result?: string;
  correlationId?: string;
  metadataKeys: string[];
};

export type WorkflowCommandSummary = {
  commandId: string;
  type?: string;
  status?: string;
  patientId?: string;
  sourceId?: string;
  attemptCount?: number;
  lastAttemptAt?: string;
  nextAttemptAt?: string;
  errorCode?: string;
  createdAt?: string;
  updatedAt?: string;
  payloadKeys: string[];
};

export type QuestionType =
  | 'boolean'
  | 'text'
  | 'single_select'
  | 'multi_select'
  | 'boolean_with_text';

export type AnswerOption = {
  label: string;
  value: string;
};

export type VisibilityRule = {
  sourceQuestionId: string;
  operator: 'is' | 'is_not' | 'contains';
  value: string;
};

export type ContraIndicationConfig = {
  severity: 'standard' | 'escalation';
  triggerValue: string;
  message: string;
};

export type ClinicalReviewMetadata = {
  reviewedBy: string;
  reviewedByName: string;
  reviewedAt: string;
};

export type Question = {
  id: string;
  type: QuestionType;
  label: string;
  hint?: string;
  required: boolean;
  options?: AnswerOption[];
  followUpPrompt?: string;
  visibilityRules?: VisibilityRule[];
  visibilityLogic?: 'and' | 'or';
  contraIndication?: ContraIndicationConfig;
};

export type FormConfigSummary = {
  conditionId: string;
  publishedVersion: number;
  publishedAt: string | null;
  publishedByName: string | null;
  updatedAt: string;
  updatedByName: string;
  draftQuestionCount: number;
  publishedQuestionCount: number;
};

export type AdminFormConfigView = {
  conditionId: string;
  publishedVersion: number;
  publishedAt: string | null;
  publishedBy: string | null;
  publishedByName: string | null;
  updatedAt: string;
  updatedBy: string;
  updatedByName: string;
  draftQuestions: Question[];
  publishedQuestions: Question[];
};

export type FormVersionSummary = {
  version: number;
  publishedAt: string;
  publishedByName: string;
  questionCount: number;
};

export type FormVersionDetail = FormVersionSummary & {
  publishedBy: string;
  questions: Question[];
  clinicalReview?: ClinicalReviewMetadata;
};

export type SaveFormDraftInput = {
  conditionId: string;
  questions: Question[];
};

export type PublishFormInput = {
  conditionId: string;
  expectedUpdatedAt: string;
  clinicalReview?: ClinicalReviewMetadata;
};

export type MigrateFormsResult = {
  seeded: string[];
  skipped: string[];
};
