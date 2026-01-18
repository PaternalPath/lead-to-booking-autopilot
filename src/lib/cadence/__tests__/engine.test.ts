import { describe, it, expect } from "vitest";
import { generateCadenceTasks, getCadenceExplanation } from "../engine";
import { Lead, LeadStage } from "@/types/lead";
import { Task } from "@/types/task";
import { CadencePolicy } from "@/types/cadence";
import { addDays } from "date-fns";

describe("Cadence Engine", () => {
  const mockLead: Lead = {
    id: "lead-1",
    fullName: "Test User",
    stage: "New" as LeadStage,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };

  const mockCadence: CadencePolicy = {
    id: "test-cadence",
    name: "Test 3-Touch Cadence",
    rules: [
      {
        dayOffset: 0,
        channel: "email",
        templateId: "email-1",
        title: "Send welcome email",
      },
      {
        dayOffset: 2,
        channel: "sms",
        templateId: "sms-1",
        title: "Quick check-in",
      },
      {
        dayOffset: 5,
        channel: "call",
        title: "Follow-up call",
      },
    ],
  };

  describe("generateCadenceTasks", () => {
    it("should generate tasks for a new lead with no existing tasks", () => {
      const result = generateCadenceTasks({
        lead: mockLead,
        cadencePolicy: mockCadence,
        existingTasks: [],
        baseDate: new Date("2026-01-10"),
      });

      expect(result.tasks).toHaveLength(3);
      expect(result.skipped).toBe(0);
      expect(result.stopped).toBe(false);

      // Check first task
      expect(result.tasks[0].title).toBe("Send welcome email");
      expect(result.tasks[0].channel).toBe("email");
      expect(result.tasks[0].templateId).toBe("email-1");
      expect(result.tasks[0].leadId).toBe("lead-1");
      expect(result.tasks[0].status).toBe("todo");
      expect(result.tasks[0].dueAt.toISOString().split("T")[0]).toBe("2026-01-10");

      // Check second task (2 days offset)
      expect(result.tasks[1].title).toBe("Quick check-in");
      expect(result.tasks[1].dueAt.toISOString().split("T")[0]).toBe("2026-01-12");

      // Check third task (5 days offset)
      expect(result.tasks[2].title).toBe("Follow-up call");
      expect(result.tasks[2].dueAt.toISOString().split("T")[0]).toBe("2026-01-15");
    });

    it("should skip duplicate tasks", () => {
      const baseDate = new Date("2026-01-10");
      const existingTasks: Task[] = [
        {
          id: "task-1",
          leadId: "lead-1",
          title: "Send welcome email",
          dueAt: baseDate, // Same day as first rule (offset 0)
          status: "todo",
          channel: "email",
          templateId: "email-1",
        },
      ];

      const result = generateCadenceTasks({
        lead: mockLead,
        cadencePolicy: mockCadence,
        existingTasks,
        baseDate,
      });

      expect(result.tasks).toHaveLength(2); // Only 2 new tasks, not 3
      expect(result.skipped).toBe(1);
      expect(result.tasks[0].title).toBe("Quick check-in"); // First task is the second rule
    });

    it("should stop generating tasks for Booked leads", () => {
      const bookedLead: Lead = {
        ...mockLead,
        stage: "Booked" as LeadStage,
      };

      const result = generateCadenceTasks({
        lead: bookedLead,
        cadencePolicy: mockCadence,
        existingTasks: [],
      });

      expect(result.tasks).toHaveLength(0);
      expect(result.stopped).toBe(true);
      expect(result.reason).toContain("Booked");
    });

    it("should stop generating tasks for Lost leads", () => {
      const lostLead: Lead = {
        ...mockLead,
        stage: "Lost" as LeadStage,
      };

      const result = generateCadenceTasks({
        lead: lostLead,
        cadencePolicy: mockCadence,
        existingTasks: [],
      });

      expect(result.tasks).toHaveLength(0);
      expect(result.stopped).toBe(true);
      expect(result.reason).toContain("Lost");
    });

    it("should not create duplicates even if title, channel, and due date match", () => {
      const baseDate = new Date("2026-01-10");
      const existingTasks: Task[] = [
        {
          id: "task-1",
          leadId: "lead-1",
          title: "Send welcome email",
          dueAt: new Date("2026-01-10T14:30:00Z"), // Different time, same day
          status: "todo",
          channel: "email",
        },
      ];

      const result = generateCadenceTasks({
        lead: mockLead,
        cadencePolicy: mockCadence,
        existingTasks,
        baseDate: new Date("2026-01-10T08:00:00Z"),
      });

      expect(result.skipped).toBe(1);
      expect(result.tasks).toHaveLength(2);
    });

    it("should create task if due date is different day (not a duplicate)", () => {
      const baseDate = new Date("2026-01-10");
      const existingTasks: Task[] = [
        {
          id: "task-1",
          leadId: "lead-1",
          title: "Send welcome email",
          dueAt: new Date("2026-01-09"), // Different day
          status: "todo",
          channel: "email",
        },
      ];

      const result = generateCadenceTasks({
        lead: mockLead,
        cadencePolicy: mockCadence,
        existingTasks,
        baseDate,
      });

      expect(result.skipped).toBe(0);
      expect(result.tasks).toHaveLength(3); // All tasks created
    });

    it("should not consider tasks for different leads as duplicates", () => {
      const baseDate = new Date("2026-01-10");
      const existingTasks: Task[] = [
        {
          id: "task-1",
          leadId: "different-lead", // Different lead
          title: "Send welcome email",
          dueAt: baseDate,
          status: "todo",
          channel: "email",
        },
      ];

      const result = generateCadenceTasks({
        lead: mockLead,
        cadencePolicy: mockCadence,
        existingTasks,
        baseDate,
      });

      expect(result.skipped).toBe(0);
      expect(result.tasks).toHaveLength(3);
    });

    it("should be deterministic (same inputs produce same outputs)", () => {
      const baseDate = new Date("2026-01-10");
      const existingTasks: Task[] = [];

      const result1 = generateCadenceTasks({
        lead: mockLead,
        cadencePolicy: mockCadence,
        existingTasks,
        baseDate,
      });

      const result2 = generateCadenceTasks({
        lead: mockLead,
        cadencePolicy: mockCadence,
        existingTasks,
        baseDate,
      });

      expect(result1.tasks).toHaveLength(result2.tasks.length);
      expect(result1.skipped).toBe(result2.skipped);
      expect(result1.stopped).toBe(result2.stopped);

      // Compare task properties (except id which is randomly generated)
      result1.tasks.forEach((task1, index) => {
        const task2 = result2.tasks[index];
        expect(task1.title).toBe(task2.title);
        expect(task1.channel).toBe(task2.channel);
        expect(task1.dueAt.toISOString()).toBe(task2.dueAt.toISOString());
      });
    });
  });

  describe("getCadenceExplanation", () => {
    it("should return explanation with touch count and duration", () => {
      const explanation = getCadenceExplanation(mockCadence);

      expect(explanation).toContain("3-touch");
      expect(explanation).toContain("5 days");
    });

    it("should handle single-rule cadence", () => {
      const singleRuleCadence: CadencePolicy = {
        id: "single",
        name: "Single Touch",
        rules: [
          {
            dayOffset: 0,
            channel: "email",
            title: "Welcome",
          },
        ],
      };

      const explanation = getCadenceExplanation(singleRuleCadence);
      expect(explanation).toContain("1-touch");
      expect(explanation).toContain("0 days");
    });
  });
});
