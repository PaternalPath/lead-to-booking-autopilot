import { z } from "zod";
import { LeadSchema } from "./lead";
import { ActivitySchema } from "./activity";
import { TaskSchema } from "./task";
import { TemplateSchema } from "./template";
import { CadencePolicySchema } from "./cadence";

export const WorkspaceSchema = z.object({
  version: z.number(),
  leads: z.array(LeadSchema),
  activities: z.array(ActivitySchema),
  tasks: z.array(TaskSchema),
  templates: z.array(TemplateSchema),
  cadencePolicies: z.array(CadencePolicySchema),
});

export type Workspace = z.infer<typeof WorkspaceSchema>;
