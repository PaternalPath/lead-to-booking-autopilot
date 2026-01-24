import {
  ApiResponse,
  LeadWithCounts,
  LeadCreateInput,
  LeadUpdateInput,
  ActivityCreateInput,
  TaskCreateInput,
  TaskUpdateInput,
  TemplateCreateInput,
  TemplateUpdateInput,
  MigrationInput,
  MigrationStats,
  Lead,
  Activity,
  Task,
  Template,
} from "./types";

class ApiClient {
  private baseUrl: string;
  private organizationId: string | null = null;

  constructor() {
    this.baseUrl = "/api";
  }

  setOrganization(orgId: string) {
    this.organizationId = orgId;
  }

  getOrganizationId(): string | null {
    return this.organizationId;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(this.organizationId && { "x-organization-id": this.organizationId }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || {
            code: "UNKNOWN_ERROR",
            message: "An unknown error occurred",
          },
        };
      }

      return data;
    } catch (error) {
      return {
        error: {
          code: "NETWORK_ERROR",
          message:
            error instanceof Error ? error.message : "Network request failed",
        },
      };
    }
  }

  // ==================== LEADS ====================

  async getLeads(params?: {
    page?: number;
    pageSize?: number;
    stage?: string;
    search?: string;
  }): Promise<ApiResponse<LeadWithCounts[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.pageSize) searchParams.set("pageSize", String(params.pageSize));
    if (params?.stage) searchParams.set("stage", params.stage);
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    return this.request<LeadWithCounts[]>(`/leads${query ? `?${query}` : ""}`);
  }

  async getLead(id: string): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/leads/${id}`);
  }

  async createLead(data: LeadCreateInput): Promise<ApiResponse<Lead>> {
    return this.request<Lead>("/leads", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateLead(
    id: string,
    data: LeadUpdateInput
  ): Promise<ApiResponse<Lead>> {
    return this.request<Lead>(`/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteLead(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/leads/${id}`, {
      method: "DELETE",
    });
  }

  // ==================== ACTIVITIES ====================

  async getActivities(leadId: string): Promise<ApiResponse<Activity[]>> {
    return this.request<Activity[]>(`/leads/${leadId}/activities`);
  }

  async createActivity(
    leadId: string,
    data: ActivityCreateInput
  ): Promise<ApiResponse<Activity>> {
    return this.request<Activity>(`/leads/${leadId}/activities`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ==================== TASKS ====================

  async getTasks(params?: {
    leadId?: string;
    status?: string;
  }): Promise<ApiResponse<Task[]>> {
    const searchParams = new URLSearchParams();
    if (params?.leadId) searchParams.set("leadId", params.leadId);
    if (params?.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return this.request<Task[]>(`/tasks${query ? `?${query}` : ""}`);
  }

  async createTask(data: TaskCreateInput): Promise<ApiResponse<Task>> {
    return this.request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTask(
    id: string,
    data: TaskUpdateInput
  ): Promise<ApiResponse<Task>> {
    return this.request<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/tasks/${id}`, {
      method: "DELETE",
    });
  }

  // ==================== TEMPLATES ====================

  async getTemplates(): Promise<ApiResponse<Template[]>> {
    return this.request<Template[]>("/templates");
  }

  async getTemplate(id: string): Promise<ApiResponse<Template>> {
    return this.request<Template>(`/templates/${id}`);
  }

  async createTemplate(
    data: TemplateCreateInput
  ): Promise<ApiResponse<Template>> {
    return this.request<Template>("/templates", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(
    id: string,
    data: TemplateUpdateInput
  ): Promise<ApiResponse<Template>> {
    return this.request<Template>(`/templates/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/templates/${id}`, {
      method: "DELETE",
    });
  }

  // ==================== MIGRATION ====================

  async migrateFromLocalStorage(
    data: MigrationInput
  ): Promise<ApiResponse<{ imported: MigrationStats }>> {
    return this.request<{ imported: MigrationStats }>("/migrate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

// Singleton instance
export const api = new ApiClient();
