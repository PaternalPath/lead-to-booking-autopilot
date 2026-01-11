import { nanoid } from "nanoid";
import type { Lead, Workflow, Template, Activity } from "@/types";

export function generateDemoLeads(): Lead[] {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: nanoid(),
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@example.com",
      phone: "(555) 123-4567",
      stage: "New",
      source: "Website",
      owner: "Demo Agent",
      destination: "Italy",
      dates: "September 15-25, 2026",
      budget: "$8,000",
      notes: "Interested in wine country tours",
      nextActionAt: new Date(now.getTime() + dayMs).toISOString(),
      createdAt: new Date(now.getTime() - 2 * dayMs).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * dayMs).toISOString(),
    },
    {
      id: nanoid(),
      firstName: "Michael",
      lastName: "Chen",
      email: "m.chen@example.com",
      phone: "(555) 234-5678",
      stage: "Qualified",
      source: "Referral",
      owner: "Demo Agent",
      destination: "Japan",
      dates: "October 10-20, 2026",
      budget: "$10,000",
      notes: "Honeymoon trip, interested in cultural experiences",
      nextActionAt: new Date(now.getTime() + 2 * dayMs).toISOString(),
      createdAt: new Date(now.getTime() - 5 * dayMs).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * dayMs).toISOString(),
    },
    {
      id: nanoid(),
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily.r@example.com",
      phone: "(555) 345-6789",
      stage: "Consult Booked",
      source: "Social Media",
      owner: "Demo Agent",
      destination: "Costa Rica",
      dates: "July 5-15, 2026",
      budget: "$5,000",
      notes: "Family trip with 2 kids, ages 8 and 10",
      nextActionAt: now.toISOString(),
      createdAt: new Date(now.getTime() - 7 * dayMs).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * dayMs).toISOString(),
    },
    {
      id: nanoid(),
      firstName: "David",
      lastName: "Thompson",
      email: "david.t@example.com",
      phone: "(555) 456-7890",
      stage: "Quote Sent",
      source: "Email Campaign",
      owner: "Demo Agent",
      destination: "Greece",
      dates: "August 20-30, 2026",
      budget: "$12,000",
      notes: "Anniversary celebration, luxury hotels preferred",
      nextActionAt: new Date(now.getTime() + 3 * dayMs).toISOString(),
      createdAt: new Date(now.getTime() - 10 * dayMs).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * dayMs).toISOString(),
    },
    {
      id: nanoid(),
      firstName: "Jessica",
      lastName: "Martinez",
      email: "jess.m@example.com",
      phone: "(555) 567-8901",
      stage: "Booked",
      source: "Website",
      owner: "Demo Agent",
      destination: "Hawaii",
      dates: "June 1-8, 2026",
      budget: "$6,500",
      notes: "Beach resort, snorkeling activities",
      nextActionAt: new Date(now.getTime() + 30 * dayMs).toISOString(),
      createdAt: new Date(now.getTime() - 15 * dayMs).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * dayMs).toISOString(),
    },
    {
      id: nanoid(),
      firstName: "Robert",
      lastName: "Wilson",
      email: "rob.w@example.com",
      phone: "(555) 678-9012",
      stage: "New",
      source: "Direct",
      owner: "Demo Agent",
      destination: "France",
      dates: "May 15-25, 2026",
      budget: "$9,000",
      notes: "Paris and Provence, food and art focus",
      nextActionAt: new Date(now.getTime() + 1 * dayMs).toISOString(),
      createdAt: new Date(now.getTime() - 1 * dayMs).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * dayMs).toISOString(),
    },
    {
      id: nanoid(),
      firstName: "Amanda",
      lastName: "Lee",
      email: "amanda.lee@example.com",
      phone: "(555) 789-0123",
      stage: "Qualified",
      source: "Referral",
      owner: "Demo Agent",
      destination: "Thailand",
      dates: "November 5-18, 2026",
      budget: "$7,500",
      notes: "Adventure and relaxation mix, interested in islands",
      nextActionAt: new Date(now.getTime() + 4 * dayMs).toISOString(),
      createdAt: new Date(now.getTime() - 6 * dayMs).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * dayMs).toISOString(),
    },
    {
      id: nanoid(),
      firstName: "Christopher",
      lastName: "Brown",
      email: "chris.b@example.com",
      phone: "(555) 890-1234",
      stage: "Dormant",
      source: "Social Media",
      owner: "Demo Agent",
      destination: "Spain",
      dates: "TBD",
      budget: "$8,500",
      notes: "Interested but not ready to book yet",
      nextActionAt: new Date(now.getTime() + 14 * dayMs).toISOString(),
      createdAt: new Date(now.getTime() - 30 * dayMs).toISOString(),
      updatedAt: new Date(now.getTime() - 20 * dayMs).toISOString(),
    },
    {
      id: nanoid(),
      firstName: "Nicole",
      lastName: "Garcia",
      email: "nicole.g@example.com",
      phone: "(555) 901-2345",
      stage: "Quote Sent",
      source: "Website",
      owner: "Demo Agent",
      destination: "New Zealand",
      dates: "March 10-25, 2026",
      budget: "$15,000",
      notes: "Adventure activities, both islands",
      nextActionAt: new Date(now.getTime() + 2 * dayMs).toISOString(),
      createdAt: new Date(now.getTime() - 8 * dayMs).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * dayMs).toISOString(),
    },
    {
      id: nanoid(),
      firstName: "James",
      lastName: "Anderson",
      email: "james.a@example.com",
      phone: "(555) 012-3456",
      stage: "Consult Booked",
      source: "Email Campaign",
      owner: "Demo Agent",
      destination: "Iceland",
      dates: "September 1-10, 2026",
      budget: "$7,000",
      notes: "Northern lights, golden circle tour",
      nextActionAt: new Date(now.getTime() + 1 * dayMs).toISOString(),
      createdAt: new Date(now.getTime() - 4 * dayMs).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * dayMs).toISOString(),
    },
    {
      id: nanoid(),
      firstName: "Lisa",
      lastName: "Taylor",
      email: "lisa.t@example.com",
      phone: "(555) 123-9876",
      stage: "New",
      source: "Other",
      owner: "Demo Agent",
      destination: "Portugal",
      dates: "April 15-25, 2026",
      budget: "$6,000",
      notes: "Lisbon and Algarve coast",
      nextActionAt: now.toISOString(),
      createdAt: new Date(now.getTime() - 1 * dayMs).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * dayMs).toISOString(),
    },
    {
      id: nanoid(),
      firstName: "Kevin",
      lastName: "White",
      email: "kevin.w@example.com",
      phone: "(555) 234-8765",
      stage: "Qualified",
      source: "Website",
      owner: "Demo Agent",
      destination: "Peru",
      dates: "October 1-12, 2026",
      budget: "$8,000",
      notes: "Machu Picchu trek, cultural immersion",
      nextActionAt: new Date(now.getTime() + 3 * dayMs).toISOString(),
      createdAt: new Date(now.getTime() - 9 * dayMs).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * dayMs).toISOString(),
    },
  ];
}

export function generateDemoTemplates(): Template[] {
  return [
    {
      id: nanoid(),
      name: "Welcome Email",
      type: "Email",
      subject: "Thanks for your interest, {{firstName}}!",
      body: `Hi {{firstName}},\n\nThank you for reaching out to us about your upcoming trip to {{destination}}!\n\nWe're excited to help you plan an unforgettable experience. One of our travel specialists will be in touch within 24 hours to discuss your travel dates ({{dates}}) and preferences.\n\nIn the meantime, feel free to reply with any questions.\n\nBest regards,\nExample Travel Co.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: nanoid(),
      name: "Consultation Reminder",
      type: "Email",
      subject: "Your consultation is coming up, {{firstName}}",
      body: `Hi {{firstName}},\n\nThis is a friendly reminder about your upcoming travel consultation.\n\nWe'll be discussing your trip to {{destination}} and creating a custom itinerary that fits your budget of {{budget}}.\n\nLooking forward to speaking with you!\n\nBest regards,\nExample Travel Co.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: nanoid(),
      name: "Quote Follow-up",
      type: "Email",
      subject: "Your custom quote for {{destination}}",
      body: `Hi {{firstName}},\n\nI hope you had a chance to review the custom quote we sent for your {{destination}} trip.\n\nI wanted to reach out to see if you have any questions or if there's anything we can adjust to better fit your needs.\n\nThe availability for your dates ({{dates}}) is looking good, but I recommend booking soon to secure the best options.\n\nLet me know how I can help!\n\nBest regards,\nExample Travel Co.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: nanoid(),
      name: "Booking Confirmation",
      type: "Email",
      subject: "Congratulations! Your {{destination}} trip is confirmed",
      body: `Hi {{firstName}},\n\nFantastic news - your trip to {{destination}} is officially confirmed!\n\nYou'll receive a detailed itinerary within the next 48 hours with all your booking confirmations, activities, and important travel information.\n\nWe're so excited for your adventure!\n\nBest regards,\nExample Travel Co.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: nanoid(),
      name: "Quick Check-in",
      type: "SMS",
      body: "Hi {{firstName}}! Just checking in on your {{destination}} trip plans. Any questions? Reply anytime! - Example Travel Co.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: nanoid(),
      name: "Booking Reminder",
      type: "SMS",
      body: "Hi {{firstName}}, availability for {{destination}} during {{dates}} is limited. Let's lock in your spot! - Example Travel Co.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function generateDemoWorkflows(): Workflow[] {
  const templates = generateDemoTemplates();

  return [
    {
      id: nanoid(),
      name: "New Lead Nurture",
      description: "Automatic follow-up sequence for new leads",
      trigger: "Lead created",
      active: true,
      steps: [
        {
          id: nanoid(),
          type: "Email",
          order: 0,
          templateId: templates[0].id,
          enabled: true,
        },
        {
          id: nanoid(),
          type: "Wait",
          order: 1,
          waitDays: 2,
          enabled: true,
        },
        {
          id: nanoid(),
          type: "Task",
          order: 2,
          taskDescription: "Call lead to schedule consultation",
          enabled: true,
        },
        {
          id: nanoid(),
          type: "Wait",
          order: 3,
          waitDays: 3,
          enabled: true,
        },
        {
          id: nanoid(),
          type: "SMS",
          order: 4,
          templateId: templates[4].id,
          enabled: true,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: nanoid(),
      name: "Quote Follow-up",
      description: "Follow-up after sending a quote",
      trigger: "Quote sent",
      active: true,
      steps: [
        {
          id: nanoid(),
          type: "Wait",
          order: 0,
          waitDays: 2,
          enabled: true,
        },
        {
          id: nanoid(),
          type: "Email",
          order: 1,
          templateId: templates[2].id,
          enabled: true,
        },
        {
          id: nanoid(),
          type: "Wait",
          order: 2,
          waitDays: 3,
          enabled: true,
        },
        {
          id: nanoid(),
          type: "Task",
          order: 3,
          taskDescription: "Call to address any concerns",
          enabled: true,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function generateDemoActivities(leads: Lead[]): Activity[] {
  const activities: Activity[] = [];

  leads.forEach((lead) => {
    activities.push({
      id: nanoid(),
      leadId: lead.id,
      type: "lead_created",
      description: "Lead created",
      createdAt: lead.createdAt,
    });

    if (lead.stage !== "New") {
      activities.push({
        id: nanoid(),
        leadId: lead.id,
        type: "stage_change",
        description: `Stage changed to ${lead.stage}`,
        metadata: { newStage: lead.stage },
        createdAt: new Date(
          new Date(lead.createdAt).getTime() + 24 * 60 * 60 * 1000
        ).toISOString(),
      });
    }

    if (lead.notes) {
      activities.push({
        id: nanoid(),
        leadId: lead.id,
        type: "note_added",
        description: "Note added",
        metadata: { note: lead.notes },
        createdAt: new Date(
          new Date(lead.createdAt).getTime() + 12 * 60 * 60 * 1000
        ).toISOString(),
      });
    }
  });

  return activities.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
