"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Workspace } from "@/types/workspace";
import { Lead } from "@/types/lead";
import { Activity } from "@/types/activity";
import { Task } from "@/types/task";
import { Template } from "@/types/template";
import { CadencePolicy } from "@/types/cadence";
import { loadWorkspace, saveWorkspace, clearWorkspace } from "@/lib/storage/storage";

interface WorkspaceContextValue {
  workspace: Workspace;
  isLoading: boolean;
  error: string | null;

  // Lead operations
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  getLeadById: (id: string) => Lead | undefined;

  // Activity operations
  addActivity: (activity: Activity) => void;
  getActivitiesByLeadId: (leadId: string) => Activity[];

  // Task operations
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByLeadId: (leadId: string) => Task[];

  // Template operations
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  getTemplateById: (id: string) => Template | undefined;

  // Cadence policy operations
  addCadencePolicy: (policy: CadencePolicy) => void;
  getCadencePolicyById: (id: string) => CadencePolicy | undefined;

  // Workspace operations
  loadDemoWorkspace: (demoData: Workspace) => void;
  clearAll: () => void;
  importWorkspace: (workspace: Workspace) => void;
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

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace>(emptyWorkspace);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load workspace on mount
  useEffect(() => {
    try {
      const loaded = loadWorkspace();
      if (loaded) {
        setWorkspace(loaded);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workspace");
      console.error("Failed to load workspace:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save workspace whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        saveWorkspace(workspace);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save workspace");
        console.error("Failed to save workspace:", err);
      }
    }
  }, [workspace, isLoading]);

  // Lead operations
  const addLead = useCallback((lead: Lead) => {
    setWorkspace((prev) => ({
      ...prev,
      leads: [...prev.leads, lead],
    }));
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setWorkspace((prev) => ({
      ...prev,
      leads: prev.leads.map((lead) =>
        lead.id === id ? { ...lead, ...updates, updatedAt: new Date() } : lead
      ),
    }));
  }, []);

  const deleteLead = useCallback((id: string) => {
    setWorkspace((prev) => ({
      ...prev,
      leads: prev.leads.filter((lead) => lead.id !== id),
      activities: prev.activities.filter((activity) => activity.leadId !== id),
      tasks: prev.tasks.filter((task) => task.leadId !== id),
    }));
  }, []);

  const getLeadById = useCallback(
    (id: string) => {
      return workspace.leads.find((lead) => lead.id === id);
    },
    [workspace.leads]
  );

  // Activity operations
  const addActivity = useCallback((activity: Activity) => {
    setWorkspace((prev) => ({
      ...prev,
      activities: [...prev.activities, activity],
    }));
  }, []);

  const getActivitiesByLeadId = useCallback(
    (leadId: string) => {
      return workspace.activities
        .filter((activity) => activity.leadId === leadId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    },
    [workspace.activities]
  );

  // Task operations
  const addTask = useCallback((task: Task) => {
    setWorkspace((prev) => ({
      ...prev,
      tasks: [...prev.tasks, task],
    }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  }, []);

  const getTasksByLeadId = useCallback(
    (leadId: string) => {
      return workspace.tasks
        .filter((task) => task.leadId === leadId)
        .sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
    },
    [workspace.tasks]
  );

  // Template operations
  const addTemplate = useCallback((template: Template) => {
    setWorkspace((prev) => ({
      ...prev,
      templates: [...prev.templates, template],
    }));
  }, []);

  const updateTemplate = useCallback((id: string, updates: Partial<Template>) => {
    setWorkspace((prev) => ({
      ...prev,
      templates: prev.templates.map((template) =>
        template.id === id ? { ...template, ...updates } : template
      ),
    }));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setWorkspace((prev) => ({
      ...prev,
      templates: prev.templates.filter((template) => template.id !== id),
    }));
  }, []);

  const getTemplateById = useCallback(
    (id: string) => {
      return workspace.templates.find((template) => template.id === id);
    },
    [workspace.templates]
  );

  // Cadence policy operations
  const addCadencePolicy = useCallback((policy: CadencePolicy) => {
    setWorkspace((prev) => ({
      ...prev,
      cadencePolicies: [...prev.cadencePolicies, policy],
    }));
  }, []);

  const getCadencePolicyById = useCallback(
    (id: string) => {
      return workspace.cadencePolicies.find((policy) => policy.id === id);
    },
    [workspace.cadencePolicies]
  );

  // Workspace operations
  const loadDemoWorkspace = useCallback((demoData: Workspace) => {
    setWorkspace(demoData);
  }, []);

  const clearAll = useCallback(() => {
    clearWorkspace();
    setWorkspace(emptyWorkspace);
  }, []);

  const importWorkspace = useCallback((newWorkspace: Workspace) => {
    setWorkspace(newWorkspace);
  }, []);

  const value: WorkspaceContextValue = {
    workspace,
    isLoading,
    error,
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
