"use client";

import type { Lead, Workflow, Template, Activity } from "@/types";

const STORAGE_VERSION = "1.0.0";
const STORAGE_KEYS = {
  VERSION: "app_version",
  LEADS: "leads",
  WORKFLOWS: "workflows",
  TEMPLATES: "templates",
  ACTIVITIES: "activities",
  INITIALIZED: "app_initialized",
} as const;

export interface AppData {
  leads: Lead[];
  workflows: Workflow[];
  templates: Template[];
  activities: Activity[];
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function getStorageVersion(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(STORAGE_KEYS.VERSION);
}

export function setStorageVersion(version: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.VERSION, version);
}

export function isInitialized(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === "true";
}

export function setInitialized(value: boolean): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, value ? "true" : "false");
}

export function getLeads(): Lead[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(STORAGE_KEYS.LEADS);
  return data ? JSON.parse(data) : [];
}

export function setLeads(leads: Lead[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
}

export function getWorkflows(): Workflow[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
  return data ? JSON.parse(data) : [];
}

export function setWorkflows(workflows: Workflow[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(workflows));
}

export function getTemplates(): Template[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  return data ? JSON.parse(data) : [];
}

export function setTemplates(templates: Template[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
}

export function getActivities(): Activity[] {
  if (!isBrowser()) return [];
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
  return data ? JSON.parse(data) : [];
}

export function setActivities(activities: Activity[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
}

export function getAllData(): AppData {
  return {
    leads: getLeads(),
    workflows: getWorkflows(),
    templates: getTemplates(),
    activities: getActivities(),
  };
}

export function setAllData(data: AppData): void {
  setLeads(data.leads);
  setWorkflows(data.workflows);
  setTemplates(data.templates);
  setActivities(data.activities);
}

export function resetAllData(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.LEADS);
  localStorage.removeItem(STORAGE_KEYS.WORKFLOWS);
  localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
  localStorage.removeItem(STORAGE_KEYS.ACTIVITIES);
  setInitialized(false);
}

export function exportData(): string {
  const data = getAllData();
  return JSON.stringify(
    {
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      data,
    },
    null,
    2
  );
}

export function importData(jsonString: string): void {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.data) {
      setAllData(parsed.data);
      setStorageVersion(parsed.version || STORAGE_VERSION);
      setInitialized(true);
    }
  } catch (error) {
    console.error("Failed to import data:", error);
    throw new Error("Invalid data format");
  }
}

export { STORAGE_VERSION };
