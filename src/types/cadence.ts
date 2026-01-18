import { z } from "zod";
import { TaskChannelSchema } from "./task";

export const CadenceRuleSchema = z.object({
  dayOffset: z.number().min(0),
  channel: TaskChannelSchema,
  templateId: z.string().optional(),
  title: z.string().min(1, "Cadence rule title is required"),
});

export type CadenceRule = z.infer<typeof CadenceRuleSchema>;

export const CadencePolicySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Cadence policy name is required"),
  rules: z.array(CadenceRuleSchema),
});

export type CadencePolicy = z.infer<typeof CadencePolicySchema>;
