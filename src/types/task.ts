import { z } from "zod";

export const TASK_STATUSES = ["todo", "done"] as const;

export const TaskStatusSchema = z.enum(TASK_STATUSES);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskChannelSchema = z.enum(["email", "sms", "call"]);

export type TaskChannel = z.infer<typeof TaskChannelSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  title: z.string().min(1, "Task title is required"),
  dueAt: z.coerce.date(),
  status: TaskStatusSchema,
  channel: TaskChannelSchema.optional(),
  templateId: z.string().optional(),
});

export type Task = z.infer<typeof TaskSchema>;
