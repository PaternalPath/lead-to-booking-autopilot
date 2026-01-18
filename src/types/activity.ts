import { z } from "zod";

export const ACTIVITY_TYPES = ["note", "call", "email", "sms", "status_change"] as const;

export const ActivityTypeSchema = z.enum(ACTIVITY_TYPES);

export type ActivityType = z.infer<typeof ActivityTypeSchema>;

export const ActivitySchema = z.object({
  id: z.string(),
  leadId: z.string(),
  type: ActivityTypeSchema,
  body: z.string().min(1, "Activity body is required"),
  createdAt: z.coerce.date(),
});

export type Activity = z.infer<typeof ActivitySchema>;

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  note: "Note",
  call: "Call",
  email: "Email",
  sms: "SMS",
  status_change: "Status Change",
};
