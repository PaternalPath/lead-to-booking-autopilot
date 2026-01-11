"use client";

import { useEffect } from "react";
import {
  isInitialized,
  setInitialized,
  setLeads,
  setWorkflows,
  setTemplates,
  setActivities,
  setStorageVersion,
  STORAGE_VERSION,
} from "@/lib/storage";
import {
  generateDemoLeads,
  generateDemoTemplates,
  generateDemoWorkflows,
  generateDemoActivities,
} from "@/lib/seed-data";

export function useDataInit() {
  useEffect(() => {
    if (!isInitialized()) {
      const leads = generateDemoLeads();
      const templates = generateDemoTemplates();
      const workflows = generateDemoWorkflows();
      const activities = generateDemoActivities(leads);

      setLeads(leads);
      setTemplates(templates);
      setWorkflows(workflows);
      setActivities(activities);
      setStorageVersion(STORAGE_VERSION);
      setInitialized(true);
    }
  }, []);
}
