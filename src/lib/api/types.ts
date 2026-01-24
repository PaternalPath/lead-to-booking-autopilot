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

// Database enum types (mirroring Prisma schema)
export type LeadStage = "New" | "Contacted" | "Qualified" | "ProposalSent" | "Booked" | "Lost";
export type ActivityType = "note" | "call" | "email" | "sms" | "status_change";
export type TaskStatus = "todo" | "done";
export type TaskChannel = "email" | "sms" | "call";
export type TemplateChannel = "email" | "sms" | "call";
export type MemberRole = "OWNER" | "ADMIN" | "MEMBER";

// Database entity types (mirroring Prisma schema)
export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  ssoEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: MemberRole;
  joinedAt: Date;
}

export interface Lead {
  id: string;
  organizationId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  destinationOrServiceIntent: string | null;
  budgetRange: string | null;
  timeline: string | null;
  notes: string | null;
  stage: LeadStage;
  createdAt: Date;
  updatedAt: Date;
  createdById: string | null;
  updatedById: string | null;
}

export interface Activity {
  id: string;
  organizationId: string;
  leadId: string;
  type: ActivityType;
  body: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  organizationId: string;
  leadId: string;
  title: string;
  dueAt: Date;
  status: TaskStatus;
  channel: TaskChannel | null;
  templateId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: string;
  organizationId: string;
  channel: TemplateChannel;
  name: string;
  subject: string | null;
  body: string;
  tags: string[];
  isSystemTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CadencePolicy {
  id: string;
  organizationId: string;
  name: string;
  rules: unknown;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Lead with counts (for list views)
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

export type LeadUpdateInput = Partial<LeadCreateInput>;

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

export type TemplateUpdateInput = Partial<TemplateCreateInput>;

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

// Prisma-like types for API routes (when Prisma client isn't generated)
// These provide type safety without requiring `prisma generate`
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace PrismaTypes {
  export interface LeadWhereInput {
    organizationId?: string;
    stage?: LeadStage;
    OR?: Array<{
      fullName?: { contains: string; mode?: "insensitive" };
      email?: { contains: string; mode?: "insensitive" };
      phone?: { contains: string };
    }>;
  }

  export interface TaskWhereInput {
    organizationId?: string;
    leadId?: string;
    status?: TaskStatus;
  }

  export interface ActivityWhereInput {
    organizationId?: string;
    leadId?: string;
    type?: ActivityType;
  }

  export interface TemplateWhereInput {
    organizationId?: string;
    channel?: TemplateChannel;
    isSystemTemplate?: boolean;
  }

  export interface OrganizationMemberWhereInput {
    organizationId?: string;
    userId?: string;
    role?: MemberRole;
  }
}
