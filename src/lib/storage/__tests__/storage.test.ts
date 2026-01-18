import { describe, it, expect } from "vitest";
import { exportWorkspace, importWorkspace, StorageError } from "../storage";
import { Workspace } from "@/types/workspace";

describe("Storage Import/Export", () => {
  const validWorkspace: Workspace = {
    version: 1,
    leads: [
      {
        id: "lead-1",
        fullName: "Test Lead",
        email: "test@example.com",
        stage: "New",
        createdAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-01-01T00:00:00Z"),
      },
    ],
    activities: [
      {
        id: "activity-1",
        leadId: "lead-1",
        type: "note",
        body: "Test activity",
        createdAt: new Date("2026-01-01T12:00:00Z"),
      },
    ],
    tasks: [
      {
        id: "task-1",
        leadId: "lead-1",
        title: "Test task",
        dueAt: new Date("2026-01-05T00:00:00Z"),
        status: "todo",
      },
    ],
    templates: [],
    cadencePolicies: [],
  };

  describe("exportWorkspace", () => {
    it("should export workspace as JSON string", () => {
      const json = exportWorkspace(validWorkspace);

      expect(typeof json).toBe("string");
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it("should export workspace with proper formatting", () => {
      const json = exportWorkspace(validWorkspace);

      // Should be pretty-printed (contain newlines)
      expect(json).toContain("\n");
      expect(json).toContain("  "); // Indentation
    });

    it("should include all workspace fields", () => {
      const json = exportWorkspace(validWorkspace);
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty("version");
      expect(parsed).toHaveProperty("leads");
      expect(parsed).toHaveProperty("activities");
      expect(parsed).toHaveProperty("tasks");
      expect(parsed).toHaveProperty("templates");
      expect(parsed).toHaveProperty("cadencePolicies");
    });

    it("should throw error for invalid workspace", () => {
      const invalidWorkspace = {
        version: "not-a-number",
        leads: "not-an-array",
      } as unknown as Workspace;

      expect(() => exportWorkspace(invalidWorkspace)).toThrow(StorageError);
    });
  });

  describe("importWorkspace", () => {
    it("should import valid workspace JSON", () => {
      const json = exportWorkspace(validWorkspace);
      const imported = importWorkspace(json);

      expect(imported.version).toBe(validWorkspace.version);
      expect(imported.leads).toHaveLength(1);
      expect(imported.leads[0].fullName).toBe("Test Lead");
    });

    it("should parse dates correctly", () => {
      const json = exportWorkspace(validWorkspace);
      const imported = importWorkspace(json);

      expect(imported.leads[0].createdAt).toBeInstanceOf(Date);
      expect(imported.leads[0].updatedAt).toBeInstanceOf(Date);
      expect(imported.activities[0].createdAt).toBeInstanceOf(Date);
      expect(imported.tasks[0].dueAt).toBeInstanceOf(Date);
    });

    it("should throw error for invalid JSON", () => {
      const invalidJson = "{ invalid json }";

      expect(() => importWorkspace(invalidJson)).toThrow(StorageError);
    });

    it("should throw error for JSON with invalid schema", () => {
      const invalidWorkspace = JSON.stringify({
        version: 1,
        leads: [
          {
            id: "lead-1",
            // Missing required fullName
            stage: "New",
          },
        ],
        activities: [],
        tasks: [],
        templates: [],
        cadencePolicies: [],
      });

      expect(() => importWorkspace(invalidWorkspace)).toThrow(StorageError);
    });

    it("should throw error for JSON with wrong structure", () => {
      const wrongStructure = JSON.stringify({
        someOtherField: "value",
      });

      expect(() => importWorkspace(wrongStructure)).toThrow(StorageError);
    });

    it("should handle empty workspace", () => {
      const emptyWorkspace: Workspace = {
        version: 1,
        leads: [],
        activities: [],
        tasks: [],
        templates: [],
        cadencePolicies: [],
      };

      const json = exportWorkspace(emptyWorkspace);
      const imported = importWorkspace(json);

      expect(imported.leads).toHaveLength(0);
      expect(imported.activities).toHaveLength(0);
      expect(imported.tasks).toHaveLength(0);
    });

    it("should preserve all data fields during export/import cycle", () => {
      const json = exportWorkspace(validWorkspace);
      const imported = importWorkspace(json);

      // Check lead fields
      expect(imported.leads[0].id).toBe(validWorkspace.leads[0].id);
      expect(imported.leads[0].fullName).toBe(validWorkspace.leads[0].fullName);
      expect(imported.leads[0].email).toBe(validWorkspace.leads[0].email);
      expect(imported.leads[0].stage).toBe(validWorkspace.leads[0].stage);

      // Check activity fields
      expect(imported.activities[0].id).toBe(validWorkspace.activities[0].id);
      expect(imported.activities[0].leadId).toBe(validWorkspace.activities[0].leadId);
      expect(imported.activities[0].type).toBe(validWorkspace.activities[0].type);
      expect(imported.activities[0].body).toBe(validWorkspace.activities[0].body);

      // Check task fields
      expect(imported.tasks[0].id).toBe(validWorkspace.tasks[0].id);
      expect(imported.tasks[0].leadId).toBe(validWorkspace.tasks[0].leadId);
      expect(imported.tasks[0].title).toBe(validWorkspace.tasks[0].title);
      expect(imported.tasks[0].status).toBe(validWorkspace.tasks[0].status);
    });

    it("should handle workspace with optional fields", () => {
      const workspaceWithOptionals: Workspace = {
        version: 1,
        leads: [
          {
            id: "lead-2",
            fullName: "Lead with Optionals",
            email: "optional@example.com",
            phone: "(555) 123-4567",
            source: "Referral",
            destinationOrServiceIntent: "Beach vacation",
            budgetRange: "$5k",
            timeline: "Next month",
            notes: "Some notes",
            stage: "Qualified",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        activities: [],
        tasks: [],
        templates: [],
        cadencePolicies: [],
      };

      const json = exportWorkspace(workspaceWithOptionals);
      const imported = importWorkspace(json);

      expect(imported.leads[0].phone).toBe("(555) 123-4567");
      expect(imported.leads[0].source).toBe("Referral");
      expect(imported.leads[0].budgetRange).toBe("$5k");
      expect(imported.leads[0].timeline).toBe("Next month");
      expect(imported.leads[0].notes).toBe("Some notes");
    });
  });
});
