export type TemplateType = "Email" | "SMS";

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  subject?: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  name: string;
  placeholder: string;
  defaultValue: string;
}

export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { name: "{{firstName}}", placeholder: "First name", defaultValue: "Jane" },
  { name: "{{lastName}}", placeholder: "Last name", defaultValue: "Smith" },
  { name: "{{destination}}", placeholder: "Destination", defaultValue: "Hawaii" },
  { name: "{{dates}}", placeholder: "Travel dates", defaultValue: "June 15-22" },
  { name: "{{budget}}", placeholder: "Budget", defaultValue: "$5,000" },
];
