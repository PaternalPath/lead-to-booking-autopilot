export type ActivityType =
  | "stage_change"
  | "note_added"
  | "email_sent"
  | "sms_sent"
  | "task_created"
  | "lead_created";

export interface Activity {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
