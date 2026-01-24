import { Lead, Activity, Task, Template, CadencePolicy } from "@prisma/client";

// API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
  };
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Lead types
export interface LeadWithCounts extends Lead {
  _count: {
    tasks: number;
    activities: number;
  };
}

export interface LeadFilters {
  stage?: string | string[];
  search?: string;
  createdAfter?: string;
  createdBefore?: string;
}

// Create/Update input types
export interface LeadCreateInput {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  source?: string | null;
  destinationOrServiceIntent?: string | null;
  budgetRange?: string | null;
  timeline?: string | null;
  notes?: string | null;
  stage?: string;
}

export interface LeadUpdateInput extends Partial<LeadCreateInput> {}

export interface ActivityCreateInput {
  type: "note" | "call" | "email" | "sms" | "status_change";
  body: string;
}

export interface TaskCreateInput {
  leadId: string;
  title: string;
  dueAt: string | Date;
  channel?: "email" | "sms" | "call" | null;
  templateId?: string | null;
}

export interface TaskUpdateInput {
  title?: string;
  dueAt?: string | Date;
  status?: "todo" | "done";
  channel?: "email" | "sms" | "call" | null;
  templateId?: string | null;
}

export interface TemplateCreateInput {
  channel: "email" | "sms" | "call";
  name: string;
  subject?: string | null;
  body: string;
  tags?: string[];
}

export interface TemplateUpdateInput extends Partial<TemplateCreateInput> {}

// Migration types
export interface MigrationInput {
  leads: Array<{
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
    source?: string;
    destinationOrServiceIntent?: string;
    budgetRange?: string;
    timeline?: string;
    notes?: string;
    stage: string;
    createdAt: string | Date;
    updatedAt: string | Date;
  }>;
  activities: Array<{
    id: string;
    leadId: string;
    type: string;
    body: string;
    createdAt: string | Date;
  }>;
  tasks: Array<{
    id: string;
    leadId: string;
    title: string;
    dueAt: string | Date;
    status: string;
    channel?: string;
    templateId?: string;
  }>;
  templates: Array<{
    id: string;
    channel: string;
    name: string;
    subject?: string;
    body: string;
    tags?: string[];
  }>;
  cadencePolicies: Array<{
    id: string;
    name: string;
    rules: unknown;
  }>;
}

export interface MigrationStats {
  leads: number;
  activities: number;
  tasks: number;
  templates: number;
  cadencePolicies: number;
}

// Re-export Prisma types
export type {
  Lead,
  Activity,
  Task,
  Template,
  CadencePolicy,
  Organization,
  User,
  OrganizationMember,
} from "@prisma/client";
