import { z } from "zod";

export const TemplateChannelSchema = z.enum(["email", "sms", "call"]);

export type TemplateChannel = z.infer<typeof TemplateChannelSchema>;

export const TemplateSchema = z.object({
  id: z.string(),
  channel: TemplateChannelSchema,
  name: z.string().min(1, "Template name is required"),
  subject: z.string().optional().or(z.literal("")),
  body: z.string().min(1, "Template body is required"),
  tags: z.array(z.string()).optional(),
});

export type Template = z.infer<typeof TemplateSchema>;
