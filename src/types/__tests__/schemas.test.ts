import { describe, it, expect } from "vitest";
import { LeadSchema, LEAD_STAGES } from "../lead";
import { ActivitySchema, ACTIVITY_TYPES } from "../activity";
import { TaskSchema, TASK_STATUSES } from "../task";
import { TemplateSchema } from "../template";
import { CadencePolicySchema } from "../cadence";
import { WorkspaceSchema } from "../workspace";

describe("Schema Validation", () => {
  describe("LeadSchema", () => {
    it("should validate a complete lead", () => {
      const validLead = {
        id: "lead-123",
        fullName: "John Doe",
        email: "john@example.com",
        phone: "(555) 123-4567",
        source: "Website",
        destinationOrServiceIntent: "Beach vacation",
        budgetRange: "$5k-7k",
        timeline: "Next 3 months",
        notes: "Prefers all-inclusive resorts",
        stage: "New",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = LeadSchema.safeParse(validLead);
      expect(result.success).toBe(true);
    });

    it("should validate a minimal lead (only required fields)", () => {
      const minimalLead = {
        id: "lead-456",
        fullName: "Jane Smith",
        stage: "Contacted",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = LeadSchema.safeParse(minimalLead);
      expect(result.success).toBe(true);
    });

    it("should reject lead with invalid stage", () => {
      const invalidLead = {
        id: "lead-789",
        fullName: "Invalid User",
        stage: "InvalidStage",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = LeadSchema.safeParse(invalidLead);
      expect(result.success).toBe(false);
    });

    it("should reject lead without required fields", () => {
      const incompleteLead = {
        id: "lead-999",
        // Missing fullName
        stage: "New",
      };

      const result = LeadSchema.safeParse(incompleteLead);
      expect(result.success).toBe(false);
    });

    it("should accept all valid stage values", () => {
      LEAD_STAGES.forEach((stage) => {
        const lead = {
          id: "test",
          fullName: "Test",
          stage,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = LeadSchema.safeParse(lead);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("ActivitySchema", () => {
    it("should validate a complete activity", () => {
      const validActivity = {
        id: "activity-1",
        leadId: "lead-1",
        type: "email",
        body: "Sent welcome email with options",
        createdAt: new Date(),
      };

      const result = ActivitySchema.safeParse(validActivity);
      expect(result.success).toBe(true);
    });

    it("should accept all valid activity types", () => {
      ACTIVITY_TYPES.forEach((type) => {
        const activity = {
          id: "test",
          leadId: "lead-1",
          type,
          body: "Test activity",
          createdAt: new Date(),
        };

        const result = ActivitySchema.safeParse(activity);
        expect(result.success).toBe(true);
      });
    });

    it("should reject activity with invalid type", () => {
      const invalidActivity = {
        id: "activity-2",
        leadId: "lead-1",
        type: "invalid_type",
        body: "Test",
        createdAt: new Date(),
      };

      const result = ActivitySchema.safeParse(invalidActivity);
      expect(result.success).toBe(false);
    });
  });

  describe("TaskSchema", () => {
    it("should validate a complete task", () => {
      const validTask = {
        id: "task-1",
        leadId: "lead-1",
        title: "Follow up call",
        dueAt: new Date("2026-02-01"),
        status: "todo",
        channel: "call",
        templateId: "template-1",
      };

      const result = TaskSchema.safeParse(validTask);
      expect(result.success).toBe(true);
    });

    it("should validate a minimal task (without optional fields)", () => {
      const minimalTask = {
        id: "task-2",
        leadId: "lead-2",
        title: "Send email",
        dueAt: new Date(),
        status: "todo",
      };

      const result = TaskSchema.safeParse(minimalTask);
      expect(result.success).toBe(true);
    });

    it("should accept all valid task statuses", () => {
      TASK_STATUSES.forEach((status) => {
        const task = {
          id: "test",
          leadId: "lead-1",
          title: "Test",
          dueAt: new Date(),
          status,
        };

        const result = TaskSchema.safeParse(task);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("TemplateSchema", () => {
    it("should validate an email template", () => {
      const emailTemplate = {
        id: "template-1",
        channel: "email",
        name: "Welcome Email",
        subject: "Welcome!",
        body: "Thank you for your interest...",
        tags: ["welcome", "first-contact"],
      };

      const result = TemplateSchema.safeParse(emailTemplate);
      expect(result.success).toBe(true);
    });

    it("should validate an SMS template (no subject)", () => {
      const smsTemplate = {
        id: "template-2",
        channel: "sms",
        name: "Quick Check-in",
        body: "Hi, just checking in!",
        tags: ["follow-up"],
      };

      const result = TemplateSchema.safeParse(smsTemplate);
      expect(result.success).toBe(true);
    });

    it("should validate a call script template", () => {
      const callTemplate = {
        id: "template-3",
        channel: "call",
        name: "Discovery Call",
        body: "1. Intro\n2. Questions\n3. Next steps",
      };

      const result = TemplateSchema.safeParse(callTemplate);
      expect(result.success).toBe(true);
    });
  });

  describe("CadencePolicySchema", () => {
    it("should validate a complete cadence policy", () => {
      const validPolicy = {
        id: "cadence-1",
        name: "5-Touch Follow-up",
        rules: [
          {
            dayOffset: 0,
            channel: "email",
            templateId: "template-1",
            title: "Send welcome email",
          },
          {
            dayOffset: 2,
            channel: "sms",
            title: "Quick check-in",
          },
        ],
      };

      const result = CadencePolicySchema.safeParse(validPolicy);
      expect(result.success).toBe(true);
    });

    it("should reject cadence policy with invalid rule", () => {
      const invalidPolicy = {
        id: "cadence-2",
        name: "Bad Cadence",
        rules: [
          {
            dayOffset: "not-a-number", // Should be number
            channel: "email",
            title: "Test",
          },
        ],
      };

      const result = CadencePolicySchema.safeParse(invalidPolicy);
      expect(result.success).toBe(false);
    });
  });

  describe("WorkspaceSchema", () => {
    it("should validate a complete workspace", () => {
      const validWorkspace = {
        version: 1,
        leads: [
          {
            id: "lead-1",
            fullName: "Test User",
            stage: "New",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        activities: [],
        tasks: [],
        templates: [],
        cadencePolicies: [],
      };

      const result = WorkspaceSchema.safeParse(validWorkspace);
      expect(result.success).toBe(true);
    });

    it("should validate an empty workspace", () => {
      const emptyWorkspace = {
        version: 1,
        leads: [],
        activities: [],
        tasks: [],
        templates: [],
        cadencePolicies: [],
      };

      const result = WorkspaceSchema.safeParse(emptyWorkspace);
      expect(result.success).toBe(true);
    });

    it("should reject workspace with invalid version", () => {
      const invalidWorkspace = {
        version: "1", // Should be number
        leads: [],
        activities: [],
        tasks: [],
        templates: [],
        cadencePolicies: [],
      };

      const result = WorkspaceSchema.safeParse(invalidWorkspace);
      expect(result.success).toBe(false);
    });

    it("should reject workspace with invalid lead data", () => {
      const invalidWorkspace = {
        version: 1,
        leads: [
          {
            id: "lead-1",
            // Missing required fullName
            stage: "New",
            createdAt: new Date(),
          },
        ],
        activities: [],
        tasks: [],
        templates: [],
        cadencePolicies: [],
      };

      const result = WorkspaceSchema.safeParse(invalidWorkspace);
      expect(result.success).toBe(false);
    });
  });
});
