"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import useSWR, { mutate } from "swr";
import { Workspace } from "@/types/workspace";
import { Lead } from "@/types/lead";
import { Activity } from "@/types/activity";
import { Task } from "@/types/task";
import { Template } from "@/types/template";
import { CadencePolicy } from "@/types/cadence";
import { loadWorkspace, saveWorkspace, clearWorkspace } from "@/lib/storage/storage";
import { api } from "@/lib/api/client";

interface WorkspaceContextValue {
  workspace: Workspace;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  hasLocalData: boolean;

  // Lead operations
  addLead: (lead: Lead) => void | Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => void | Promise<void>;
  deleteLead: (id: string) => void | Promise<void>;
  getLeadById: (id: string) => Lead | undefined;

  // Activity operations
  addActivity: (activity: Activity) => void | Promise<void>;
  getActivitiesByLeadId: (leadId: string) => Activity[];

  // Task operations
  addTask: (task: Task) => void | Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => void | Promise<void>;
  deleteTask: (id: string) => void | Promise<void>;
  getTasksByLeadId: (leadId: string) => Task[];

  // Template operations
  addTemplate: (template: Template) => void | Promise<void>;
  updateTemplate: (id: string, updates: Partial<Template>) => void | Promise<void>;
  deleteTemplate: (id: string) => void | Promise<void>;
  getTemplateById: (id: string) => Template | undefined;

  // Cadence policy operations
  addCadencePolicy: (policy: CadencePolicy) => void;
  getCadencePolicyById: (id: string) => CadencePolicy | undefined;

  // Workspace operations
  loadDemoWorkspace: (demoData: Workspace) => void;
  clearAll: () => void;
  importWorkspace: (workspace: Workspace) => void;
  migrateToCloud: () => Promise<{ success: boolean; message: string }>;
  refreshData: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

const emptyWorkspace: Workspace = {
  version: 1,
  leads: [],
  activities: [],
  tasks: [],
  templates: [],
  cadencePolicies: [],
};

// Helper to convert API data to local types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertApiLead(apiLead: any): Lead {
  return {
    id: apiLead.id,
    fullName: apiLead.fullName,
    email: apiLead.email ?? undefined,
    phone: apiLead.phone ?? undefined,
    source: apiLead.source ?? undefined,
    destinationOrServiceIntent: apiLead.destinationOrServiceIntent ?? undefined,
    budgetRange: apiLead.budgetRange ?? undefined,
    timeline: apiLead.timeline ?? undefined,
    notes: apiLead.notes ?? undefined,
    stage: apiLead.stage,
    createdAt: new Date(apiLead.createdAt),
    updatedAt: new Date(apiLead.updatedAt),
  };
}

// Note: convertApiActivity is available for when activities are fetched per-lead
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
function convertApiActivity(apiActivity: any): Activity {
  return {
    id: apiActivity.id,
    leadId: apiActivity.leadId,
    type: apiActivity.type,
    body: apiActivity.body,
    createdAt: new Date(apiActivity.createdAt),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertApiTask(apiTask: any): Task {
  return {
    id: apiTask.id,
    leadId: apiTask.leadId,
    title: apiTask.title,
    dueAt: new Date(apiTask.dueAt),
    status: apiTask.status,
    channel: apiTask.channel ?? undefined,
    templateId: apiTask.templateId ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertApiTemplate(apiTemplate: any): Template {
  return {
    id: apiTemplate.id,
    channel: apiTemplate.channel,
    name: apiTemplate.name,
    subject: apiTemplate.subject ?? undefined,
    body: apiTemplate.body,
    tags: apiTemplate.tags ?? undefined,
  };
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status: authStatus } = useSession();
  const isAuthenticated = authStatus === "authenticated" && !!session?.user;
  const orgId = api.getOrganizationId();

  // Local state for localStorage mode
  const [localWorkspace, setLocalWorkspace] = useState<Workspace>(emptyWorkspace);
  const [localLoading, setLocalLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [hasLocalData, setHasLocalData] = useState(false);

  // SWR for API mode
  const { data: apiLeads, error: leadsError, isLoading: leadsLoading } = useSWR(
    isAuthenticated && orgId ? `/api/leads?orgId=${orgId}` : null,
    () => api.getLeads()
  );

  const { data: apiTasks, isLoading: tasksLoading } = useSWR(
    isAuthenticated && orgId ? `/api/tasks?orgId=${orgId}` : null,
    () => api.getTasks()
  );

  const { data: apiTemplates, isLoading: templatesLoading } = useSWR(
    isAuthenticated && orgId ? `/api/templates?orgId=${orgId}` : null,
    () => api.getTemplates()
  );

  // Load localStorage workspace on mount
  useEffect(() => {
    try {
      const loaded = loadWorkspace();
      if (loaded) {
        setLocalWorkspace(loaded);
        setHasLocalData(loaded.leads.length > 0);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Failed to load workspace");
      console.error("Failed to load workspace:", err);
    } finally {
      setLocalLoading(false);
    }
  }, []);

  // Save localStorage workspace whenever it changes (only in localStorage mode)
  useEffect(() => {
    if (!localLoading && !isAuthenticated) {
      try {
        saveWorkspace(localWorkspace);
        setHasLocalData(localWorkspace.leads.length > 0);
        setLocalError(null);
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : "Failed to save workspace");
        console.error("Failed to save workspace:", err);
      }
    }
  }, [localWorkspace, localLoading, isAuthenticated]);

  // Construct workspace from API data when authenticated
  const workspace: Workspace = isAuthenticated
    ? {
        version: 1,
        leads: (apiLeads?.data || []).map(convertApiLead),
        activities: [], // Activities are loaded per-lead
        tasks: (apiTasks?.data || []).map(convertApiTask),
        templates: (apiTemplates?.data || []).map(convertApiTemplate),
        cadencePolicies: [],
      }
    : localWorkspace;

  const isLoading = authStatus === "loading" || (isAuthenticated
    ? leadsLoading || tasksLoading || templatesLoading
    : localLoading);

  const error = isAuthenticated ? leadsError?.message || null : localError;

  // ==================== LEAD OPERATIONS ====================

  const addLead = useCallback(
    async (lead: Lead) => {
      if (isAuthenticated) {
        const result = await api.createLead({
          fullName: lead.fullName,
          email: lead.email,
          phone: lead.phone,
          source: lead.source,
          destinationOrServiceIntent: lead.destinationOrServiceIntent,
          budgetRange: lead.budgetRange,
          timeline: lead.timeline,
          notes: lead.notes,
          stage: lead.stage,
        });
        if (result.error) {
          throw new Error(result.error.message);
        }
        mutate(`/api/leads?orgId=${orgId}`);
      } else {
        setLocalWorkspace((prev) => ({
          ...prev,
          leads: [...prev.leads, lead],
        }));
      }
    },
    [isAuthenticated, orgId]
  );

  const updateLead = useCallback(
    async (id: string, updates: Partial<Lead>) => {
      if (isAuthenticated) {
        const result = await api.updateLead(id, updates);
        if (result.error) {
          throw new Error(result.error.message);
        }
        mutate(`/api/leads?orgId=${orgId}`);
      } else {
        setLocalWorkspace((prev) => ({
          ...prev,
          leads: prev.leads.map((lead) =>
            lead.id === id ? { ...lead, ...updates, updatedAt: new Date() } : lead
          ),
        }));
      }
    },
    [isAuthenticated, orgId]
  );

  const deleteLead = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        const result = await api.deleteLead(id);
        if (result.error) {
          throw new Error(result.error.message);
        }
        mutate(`/api/leads?orgId=${orgId}`);
        mutate(`/api/tasks?orgId=${orgId}`);
      } else {
        setLocalWorkspace((prev) => ({
          ...prev,
          leads: prev.leads.filter((lead) => lead.id !== id),
          activities: prev.activities.filter((activity) => activity.leadId !== id),
          tasks: prev.tasks.filter((task) => task.leadId !== id),
        }));
      }
    },
    [isAuthenticated, orgId]
  );

  const getLeadById = useCallback(
    (id: string) => workspace.leads.find((lead) => lead.id === id),
    [workspace.leads]
  );

  // ==================== ACTIVITY OPERATIONS ====================

  const addActivity = useCallback(
    async (activity: Activity) => {
      if (isAuthenticated) {
        const result = await api.createActivity(activity.leadId, {
          type: activity.type,
          body: activity.body,
        });
        if (result.error) {
          throw new Error(result.error.message);
        }
        // Activities are fetched per-lead, so we need to refresh the lead detail page
      } else {
        setLocalWorkspace((prev) => ({
          ...prev,
          activities: [...prev.activities, activity],
        }));
      }
    },
    [isAuthenticated]
  );

  const getActivitiesByLeadId = useCallback(
    (leadId: string) => {
      return workspace.activities
        .filter((activity) => activity.leadId === leadId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    [workspace.activities]
  );

  // ==================== TASK OPERATIONS ====================

  const addTask = useCallback(
    async (task: Task) => {
      if (isAuthenticated) {
        const result = await api.createTask({
          leadId: task.leadId,
          title: task.title,
          dueAt: task.dueAt,
          channel: task.channel,
          templateId: task.templateId,
        });
        if (result.error) {
          throw new Error(result.error.message);
        }
        mutate(`/api/tasks?orgId=${orgId}`);
      } else {
        setLocalWorkspace((prev) => ({
          ...prev,
          tasks: [...prev.tasks, task],
        }));
      }
    },
    [isAuthenticated, orgId]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      if (isAuthenticated) {
        const result = await api.updateTask(id, updates);
        if (result.error) {
          throw new Error(result.error.message);
        }
        mutate(`/api/tasks?orgId=${orgId}`);
      } else {
        setLocalWorkspace((prev) => ({
          ...prev,
          tasks: prev.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
        }));
      }
    },
    [isAuthenticated, orgId]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        const result = await api.deleteTask(id);
        if (result.error) {
          throw new Error(result.error.message);
        }
        mutate(`/api/tasks?orgId=${orgId}`);
      } else {
        setLocalWorkspace((prev) => ({
          ...prev,
          tasks: prev.tasks.filter((task) => task.id !== id),
        }));
      }
    },
    [isAuthenticated, orgId]
  );

  const getTasksByLeadId = useCallback(
    (leadId: string) => {
      return workspace.tasks
        .filter((task) => task.leadId === leadId)
        .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
    },
    [workspace.tasks]
  );

  // ==================== TEMPLATE OPERATIONS ====================

  const addTemplate = useCallback(
    async (template: Template) => {
      if (isAuthenticated) {
        const result = await api.createTemplate({
          channel: template.channel,
          name: template.name,
          subject: template.subject,
          body: template.body,
          tags: template.tags,
        });
        if (result.error) {
          throw new Error(result.error.message);
        }
        mutate(`/api/templates?orgId=${orgId}`);
      } else {
        setLocalWorkspace((prev) => ({
          ...prev,
          templates: [...prev.templates, template],
        }));
      }
    },
    [isAuthenticated, orgId]
  );

  const updateTemplate = useCallback(
    async (id: string, updates: Partial<Template>) => {
      if (isAuthenticated) {
        const result = await api.updateTemplate(id, updates);
        if (result.error) {
          throw new Error(result.error.message);
        }
        mutate(`/api/templates?orgId=${orgId}`);
      } else {
        setLocalWorkspace((prev) => ({
          ...prev,
          templates: prev.templates.map((template) =>
            template.id === id ? { ...template, ...updates } : template
          ),
        }));
      }
    },
    [isAuthenticated, orgId]
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      if (isAuthenticated) {
        const result = await api.deleteTemplate(id);
        if (result.error) {
          throw new Error(result.error.message);
        }
        mutate(`/api/templates?orgId=${orgId}`);
      } else {
        setLocalWorkspace((prev) => ({
          ...prev,
          templates: prev.templates.filter((template) => template.id !== id),
        }));
      }
    },
    [isAuthenticated, orgId]
  );

  const getTemplateById = useCallback(
    (id: string) => workspace.templates.find((template) => template.id === id),
    [workspace.templates]
  );

  // ==================== CADENCE OPERATIONS ====================

  const addCadencePolicy = useCallback((policy: CadencePolicy) => {
    setLocalWorkspace((prev) => ({
      ...prev,
      cadencePolicies: [...prev.cadencePolicies, policy],
    }));
  }, []);

  const getCadencePolicyById = useCallback(
    (id: string) => workspace.cadencePolicies.find((policy) => policy.id === id),
    [workspace.cadencePolicies]
  );

  // ==================== WORKSPACE OPERATIONS ====================

  const loadDemoWorkspace = useCallback((demoData: Workspace) => {
    setLocalWorkspace(demoData);
  }, []);

  const clearAll = useCallback(() => {
    clearWorkspace();
    setLocalWorkspace(emptyWorkspace);
    setHasLocalData(false);
  }, []);

  const importWorkspace = useCallback((newWorkspace: Workspace) => {
    setLocalWorkspace(newWorkspace);
  }, []);

  const migrateToCloud = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!isAuthenticated || !orgId) {
      return { success: false, message: "Not authenticated" };
    }

    if (!hasLocalData) {
      return { success: false, message: "No local data to migrate" };
    }

    try {
      const result = await api.migrateFromLocalStorage({
        leads: localWorkspace.leads.map((l) => ({
          ...l,
          createdAt: l.createdAt.toISOString(),
          updatedAt: l.updatedAt.toISOString(),
        })) as Parameters<typeof api.migrateFromLocalStorage>[0]["leads"],
        activities: localWorkspace.activities.map((a) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
        })) as Parameters<typeof api.migrateFromLocalStorage>[0]["activities"],
        tasks: localWorkspace.tasks.map((t) => ({
          ...t,
          dueAt: t.dueAt.toISOString(),
        })) as Parameters<typeof api.migrateFromLocalStorage>[0]["tasks"],
        templates: localWorkspace.templates as Parameters<typeof api.migrateFromLocalStorage>[0]["templates"],
        cadencePolicies: localWorkspace.cadencePolicies as Parameters<typeof api.migrateFromLocalStorage>[0]["cadencePolicies"],
      });

      if (result.error) {
        return { success: false, message: result.error.message };
      }

      // Clear local storage after successful migration
      clearWorkspace();
      setLocalWorkspace(emptyWorkspace);
      setHasLocalData(false);

      // Refresh API data
      mutate(`/api/leads?orgId=${orgId}`);
      mutate(`/api/tasks?orgId=${orgId}`);
      mutate(`/api/templates?orgId=${orgId}`);

      const stats = result.data?.imported;
      return {
        success: true,
        message: `Migrated ${stats?.leads || 0} leads, ${stats?.activities || 0} activities, ${stats?.tasks || 0} tasks`,
      };
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Migration failed",
      };
    }
  }, [isAuthenticated, orgId, hasLocalData, localWorkspace]);

  const refreshData = useCallback(() => {
    if (isAuthenticated && orgId) {
      mutate(`/api/leads?orgId=${orgId}`);
      mutate(`/api/tasks?orgId=${orgId}`);
      mutate(`/api/templates?orgId=${orgId}`);
    }
  }, [isAuthenticated, orgId]);

  const value: WorkspaceContextValue = {
    workspace,
    isLoading,
    error,
    isAuthenticated,
    hasLocalData,
    addLead,
    updateLead,
    deleteLead,
    getLeadById,
    addActivity,
    getActivitiesByLeadId,
    addTask,
    updateTask,
    deleteTask,
    getTasksByLeadId,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,
    addCadencePolicy,
    getCadencePolicyById,
    loadDemoWorkspace,
    clearAll,
    importWorkspace,
    migrateToCloud,
    refreshData,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
