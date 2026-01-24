import { describe, it, expect } from "vitest";
import { loadDemoWorkspace } from "../demo-data";
import { WorkspaceSchema } from "@/types/workspace";
import { LEAD_STAGES } from "@/types/lead";

describe("loadDemoWorkspace", () => {
  describe("Data Structure", () => {
    it("should return a valid workspace matching WorkspaceSchema", () => {
      const workspace = loadDemoWorkspace();
      const result = WorkspaceSchema.safeParse(workspace);

      expect(result.success).toBe(true);
    });

    it("should include leads in all 6 stages", () => {
      const workspace = loadDemoWorkspace();
      const stagesInWorkspace = new Set(workspace.leads.map((lead) => lead.stage));

      for (const stage of LEAD_STAGES) {
        expect(stagesInWorkspace.has(stage)).toBe(true);
      }
    });

    it("should include activities for multiple leads", () => {
      const workspace = loadDemoWorkspace();
      const leadIdsWithActivities = new Set(workspace.activities.map((a) => a.leadId));

      expect(leadIdsWithActivities.size).toBeGreaterThan(1);
    });

    it("should include tasks with various statuses", () => {
      const workspace = loadDemoWorkspace();
      const statuses = new Set(workspace.tasks.map((t) => t.status));

      expect(statuses.has("todo")).toBe(true);
      expect(statuses.has("done")).toBe(true);
    });

    it("should include default templates", () => {
      const workspace = loadDemoWorkspace();

      expect(workspace.templates.length).toBeGreaterThan(0);
    });

    it("should include default cadence policy", () => {
      const workspace = loadDemoWorkspace();

      expect(workspace.cadencePolicies.length).toBeGreaterThan(0);
    });
  });

  describe("Data Relationships", () => {
    it("should have activities referencing valid lead IDs", () => {
      const workspace = loadDemoWorkspace();
      const leadIds = new Set(workspace.leads.map((l) => l.id));

      for (const activity of workspace.activities) {
        expect(leadIds.has(activity.leadId)).toBe(true);
      }
    });

    it("should have tasks referencing valid lead IDs", () => {
      const workspace = loadDemoWorkspace();
      const leadIds = new Set(workspace.leads.map((l) => l.id));

      for (const task of workspace.tasks) {
        expect(leadIds.has(task.leadId)).toBe(true);
      }
    });

    it("should have tasks referencing valid template IDs where specified", () => {
      const workspace = loadDemoWorkspace();
      const templateIds = new Set(workspace.templates.map((t) => t.id));

      const tasksWithTemplates = workspace.tasks.filter((t) => t.templateId);
      expect(tasksWithTemplates.length).toBeGreaterThan(0);

      for (const task of tasksWithTemplates) {
        expect(templateIds.has(task.templateId!)).toBe(true);
      }
    });
  });

  describe("Date Handling", () => {
    it("should create leads with createdAt as Date objects", () => {
      const workspace = loadDemoWorkspace();

      for (const lead of workspace.leads) {
        expect(lead.createdAt).toBeInstanceOf(Date);
      }
    });

    it("should create tasks with dueAt as Date objects", () => {
      const workspace = loadDemoWorkspace();

      for (const task of workspace.tasks) {
        expect(task.dueAt).toBeInstanceOf(Date);
      }
    });

    it("should ensure updatedAt >= createdAt for all leads", () => {
      const workspace = loadDemoWorkspace();

      for (const lead of workspace.leads) {
        expect(lead.updatedAt.getTime()).toBeGreaterThanOrEqual(lead.createdAt.getTime());
      }
    });
  });
});
