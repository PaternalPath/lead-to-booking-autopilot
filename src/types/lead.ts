import { z } from "zod";

export const LeadStageSchema = z.enum([
  "New",
  "Contacted",
  "Qualified",
  "ProposalSent",
  "Booked",
  "Lost",
]);

export type LeadStage = z.infer<typeof LeadStageSchema>;

export const LeadSchema = z.object({
  id: z.string(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  source: z.string().optional().or(z.literal("")),
  destinationOrServiceIntent: z.string().optional().or(z.literal("")),
  budgetRange: z.string().optional().or(z.literal("")),
  timeline: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  stage: LeadStageSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Lead = z.infer<typeof LeadSchema>;

export const LEAD_STAGES: LeadStage[] = [
  "New",
  "Contacted",
  "Qualified",
  "ProposalSent",
  "Booked",
  "Lost",
];

export const LEAD_STAGE_LABELS: Record<LeadStage, string> = {
  New: "New",
  Contacted: "Contacted",
  Qualified: "Qualified",
  ProposalSent: "Proposal Sent",
  Booked: "Booked",
  Lost: "Lost",
};
