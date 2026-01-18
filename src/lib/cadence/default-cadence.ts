import { CadencePolicy } from "@/types/cadence";

export const DEFAULT_CADENCE: CadencePolicy = {
  id: "default-5-touch",
  name: "Default 5-Touch Follow-up",
  rules: [
    {
      dayOffset: 0,
      channel: "email",
      templateId: "email-welcome",
      title: "Send welcome email",
    },
    {
      dayOffset: 1,
      channel: "sms",
      templateId: "sms-quick-checkin",
      title: "Quick SMS check-in",
    },
    {
      dayOffset: 3,
      channel: "call",
      templateId: "call-discovery",
      title: "Discovery call",
    },
    {
      dayOffset: 5,
      channel: "email",
      templateId: "email-options-recap",
      title: "Send options recap email",
    },
    {
      dayOffset: 8,
      channel: "sms",
      templateId: "sms-final-touch",
      title: "Final SMS touch",
    },
  ],
};
