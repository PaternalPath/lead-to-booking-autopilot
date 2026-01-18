import { nanoid } from "nanoid";
import { addDays } from "date-fns";
import { Task } from "@/types/task";
import { Lead } from "@/types/lead";
import { CadencePolicy } from "@/types/cadence";

export interface GenerateCadenceTasksOptions {
  lead: Lead;
  cadencePolicy: CadencePolicy;
  existingTasks: Task[];
  baseDate?: Date;
}

export interface GenerateCadenceTasksResult {
  tasks: Task[];
  skipped: number;
  stopped: boolean;
  reason?: string;
}

/**
 * Generates follow-up tasks for a lead based on a cadence policy.
 *
 * Features:
 * - Deterministic: same inputs always produce same outputs
 * - No duplicates: won't create tasks that already exist
 * - Smart stopping: stops if lead is Booked or Lost
 * - Testable: pure function with clear inputs/outputs
 */
export function generateCadenceTasks(
  options: GenerateCadenceTasksOptions
): GenerateCadenceTasksResult {
  const { lead, cadencePolicy, existingTasks, baseDate = new Date() } = options;

  // Stop if lead is already Booked or Lost
  if (lead.stage === "Booked" || lead.stage === "Lost") {
    return {
      tasks: [],
      skipped: 0,
      stopped: true,
      reason: `Lead is already ${lead.stage}. No follow-up tasks needed.`,
    };
  }

  const newTasks: Task[] = [];
  let skippedCount = 0;

  for (const rule of cadencePolicy.rules) {
    // Calculate due date based on day offset
    const dueDate = addDays(baseDate, rule.dayOffset);

    // Check if a similar task already exists
    // We consider a task "similar" if it has the same:
    // - leadId
    // - title
    // - channel
    // - due date (within same day)
    const isDuplicate = existingTasks.some((existingTask) => {
      if (existingTask.leadId !== lead.id) return false;
      if (existingTask.title !== rule.title) return false;
      if (existingTask.channel !== rule.channel) return false;

      // Check if due dates are on the same day
      const existingDueDay = existingTask.dueAt.toISOString().split("T")[0];
      const newDueDay = dueDate.toISOString().split("T")[0];
      if (existingDueDay !== newDueDay) return false;

      return true;
    });

    if (isDuplicate) {
      skippedCount++;
      continue;
    }

    // Create new task
    const task: Task = {
      id: nanoid(),
      leadId: lead.id,
      title: rule.title,
      dueAt: dueDate,
      status: "todo",
      channel: rule.channel,
      templateId: rule.templateId,
    };

    newTasks.push(task);
  }

  return {
    tasks: newTasks,
    skipped: skippedCount,
    stopped: false,
  };
}

/**
 * Gets a human-readable explanation of why a cadence was used.
 */
export function getCadenceExplanation(cadencePolicy: CadencePolicy): string {
  const touchCount = cadencePolicy.rules.length;
  const duration = Math.max(...cadencePolicy.rules.map((r) => r.dayOffset));

  return `This ${touchCount}-touch cadence spreads follow-ups over ${duration} days, combining emails, calls, and SMS to maximize engagement while respecting your lead's time. Each touchpoint is strategically timed based on industry best practices.`;
}
