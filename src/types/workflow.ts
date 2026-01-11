export type WorkflowStepType = "Email" | "SMS" | "Wait" | "Task";

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  order: number;
  templateId?: string;
  waitDays?: number;
  taskDescription?: string;
  enabled: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: string;
  steps: WorkflowStep[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
