export type LeadStage =
  | "New"
  | "Qualified"
  | "Consult Booked"
  | "Quote Sent"
  | "Booked"
  | "Dormant";

export type LeadSource =
  | "Website"
  | "Referral"
  | "Social Media"
  | "Email Campaign"
  | "Direct"
  | "Other";

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  stage: LeadStage;
  source: LeadSource;
  owner: string;
  destination?: string;
  dates?: string;
  budget?: string;
  notes: string;
  nextActionAt?: string;
  createdAt: string;
  updatedAt: string;
}
