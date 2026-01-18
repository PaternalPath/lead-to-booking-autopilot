import { nanoid } from "nanoid";
import { subDays, addDays } from "date-fns";
import { Workspace } from "@/types/workspace";
import { Lead, LeadStage } from "@/types/lead";
import { Activity } from "@/types/activity";
import { Task } from "@/types/task";
import { DEFAULT_TEMPLATES } from "./cadence/default-templates";
import { DEFAULT_CADENCE } from "./cadence/default-cadence";

export function loadDemoWorkspace(): Workspace {
  const now = new Date();

  // Create sample leads across all stages
  const leads: Lead[] = [
    {
      id: nanoid(),
      fullName: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "(555) 123-4567",
      source: "Website",
      destinationOrServiceIntent: "European river cruise for anniversary",
      budgetRange: "$8k-10k",
      timeline: "Next 6-8 months",
      notes: "Celebrating 25th wedding anniversary. Interested in wine-focused itineraries.",
      stage: "Qualified" as LeadStage,
      createdAt: subDays(now, 5),
      updatedAt: subDays(now, 1),
    },
    {
      id: nanoid(),
      fullName: "Michael Chen",
      email: "m.chen@example.com",
      phone: "(555) 234-5678",
      source: "Referral",
      destinationOrServiceIntent: "Family trip to Japan",
      budgetRange: "$12k-15k",
      timeline: "Spring 2026",
      notes: "Family of 4 (kids ages 8 and 12). First time to Japan.",
      stage: "ProposalSent" as LeadStage,
      createdAt: subDays(now, 12),
      updatedAt: subDays(now, 2),
    },
    {
      id: nanoid(),
      fullName: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "(555) 345-6789",
      source: "Social Media",
      destinationOrServiceIntent: "Luxury safari in Tanzania",
      budgetRange: "$15k-20k",
      timeline: "Next year (flexible)",
      notes: "Honeymoon trip. Interested in photography opportunities.",
      stage: "Contacted" as LeadStage,
      createdAt: subDays(now, 3),
      updatedAt: subDays(now, 3),
    },
    {
      id: nanoid(),
      fullName: "James Patterson",
      email: "jpatterson@example.com",
      source: "Referral",
      destinationOrServiceIntent: "Corporate retreat in Costa Rica",
      budgetRange: "$30k-40k",
      timeline: "Q3 2026",
      notes: "Team of 15-20 people. Mix of adventure and team building.",
      stage: "Booked" as LeadStage,
      createdAt: subDays(now, 20),
      updatedAt: subDays(now, 1),
    },
    {
      id: nanoid(),
      fullName: "Lisa Thompson",
      email: "lisa.t@example.com",
      phone: "(555) 456-7890",
      source: "Website",
      destinationOrServiceIntent: "Beach vacation in Caribbean",
      budgetRange: "$4k-6k",
      timeline: "This winter",
      notes: "Looking for all-inclusive resort. Traveling with elderly parent.",
      stage: "New" as LeadStage,
      createdAt: subDays(now, 1),
      updatedAt: subDays(now, 1),
    },
    {
      id: nanoid(),
      fullName: "David Kim",
      phone: "(555) 567-8901",
      source: "Phone inquiry",
      destinationOrServiceIntent: "Golf trip to Scotland",
      timeline: "Summer 2026",
      notes: "Initial inquiry. Need to follow up with detailed information.",
      stage: "New" as LeadStage,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      fullName: "Amanda Foster",
      email: "a.foster@example.com",
      source: "Referral",
      destinationOrServiceIntent: "Multi-city Europe tour",
      budgetRange: "$10k-12k",
      timeline: "Fall 2026",
      notes: "Budget didn't align with expectations. May circle back later.",
      stage: "Lost" as LeadStage,
      createdAt: subDays(now, 30),
      updatedAt: subDays(now, 15),
    },
    {
      id: nanoid(),
      fullName: "Robert Martinez",
      email: "r.martinez@example.com",
      phone: "(555) 678-9012",
      source: "Past client",
      destinationOrServiceIntent: "Antarctic expedition cruise",
      budgetRange: "$20k+",
      timeline: "2027",
      notes: "Repeat client. Very interested but timeline is far out.",
      stage: "Contacted" as LeadStage,
      createdAt: subDays(now, 7),
      updatedAt: subDays(now, 4),
    },
  ];

  // Create sample activities for some leads
  const activities: Activity[] = [
    // Sarah Johnson
    {
      id: nanoid(),
      leadId: leads[0].id,
      type: "email",
      body: "Sent initial welcome email with European river cruise overview.",
      createdAt: subDays(now, 5),
    },
    {
      id: nanoid(),
      leadId: leads[0].id,
      type: "call",
      body: "Discovery call completed. Discussed wine preferences and mobility considerations. They prefer Rhine or Danube routes.",
      createdAt: subDays(now, 3),
    },
    {
      id: nanoid(),
      leadId: leads[0].id,
      type: "email",
      body: "Sent 3 curated river cruise options with pricing breakdown.",
      createdAt: subDays(now, 1),
    },
    // Michael Chen
    {
      id: nanoid(),
      leadId: leads[1].id,
      type: "note",
      body: "Client referred by past customer (James Patterson). High quality lead.",
      createdAt: subDays(now, 12),
    },
    {
      id: nanoid(),
      leadId: leads[1].id,
      type: "call",
      body: "Great discovery call. Family is excited about Japan. Kids love anime and they want cultural experiences + some adventure.",
      createdAt: subDays(now, 9),
    },
    {
      id: nanoid(),
      leadId: leads[1].id,
      type: "email",
      body: "Sent detailed 14-day Japan itinerary proposal with kid-friendly activities.",
      createdAt: subDays(now, 2),
    },
    {
      id: nanoid(),
      leadId: leads[1].id,
      type: "status_change",
      body: "Moved from Qualified to Proposal Sent",
      createdAt: subDays(now, 2),
    },
    // Emily Rodriguez
    {
      id: nanoid(),
      leadId: leads[2].id,
      type: "email",
      body: "Welcome email sent with Tanzania safari overview.",
      createdAt: subDays(now, 3),
    },
    {
      id: nanoid(),
      leadId: leads[2].id,
      type: "sms",
      body: "Quick check-in text sent. Awaiting response.",
      createdAt: subDays(now, 2),
    },
    // James Patterson (Booked)
    {
      id: nanoid(),
      leadId: leads[3].id,
      type: "note",
      body: "Booking confirmed! Deposit received. Team retreat March 15-20, 2026.",
      createdAt: subDays(now, 1),
    },
    // Lisa Thompson
    {
      id: nanoid(),
      leadId: leads[4].id,
      type: "note",
      body: "New lead from website contact form. Looking for winter Caribbean vacation.",
      createdAt: subDays(now, 1),
    },
  ];

  // Create sample tasks
  const tasks: Task[] = [
    // Sarah Johnson
    {
      id: nanoid(),
      leadId: leads[0].id,
      title: "Follow up on river cruise options",
      dueAt: addDays(now, 2),
      status: "todo",
      channel: "call",
    },
    // Michael Chen
    {
      id: nanoid(),
      leadId: leads[1].id,
      title: "Follow up on Japan proposal",
      dueAt: addDays(now, 3),
      status: "todo",
      channel: "email",
      templateId: "email-options-recap",
    },
    // Emily Rodriguez
    {
      id: nanoid(),
      leadId: leads[2].id,
      title: "Discovery call",
      dueAt: addDays(now, 1),
      status: "todo",
      channel: "call",
      templateId: "call-discovery",
    },
    {
      id: nanoid(),
      leadId: leads[2].id,
      title: "Send Tanzania safari options",
      dueAt: addDays(now, 4),
      status: "todo",
      channel: "email",
    },
    // James Patterson (Booked - completed tasks)
    {
      id: nanoid(),
      leadId: leads[3].id,
      title: "Send Costa Rica proposal",
      dueAt: subDays(now, 5),
      status: "done",
      channel: "email",
    },
    {
      id: nanoid(),
      leadId: leads[3].id,
      title: "Follow-up call on proposal",
      dueAt: subDays(now, 3),
      status: "done",
      channel: "call",
    },
    // Lisa Thompson
    {
      id: nanoid(),
      leadId: leads[4].id,
      title: "Send welcome email",
      dueAt: now,
      status: "todo",
      channel: "email",
      templateId: "email-welcome",
    },
    {
      id: nanoid(),
      leadId: leads[4].id,
      title: "Quick SMS check-in",
      dueAt: addDays(now, 1),
      status: "todo",
      channel: "sms",
      templateId: "sms-quick-checkin",
    },
    // David Kim
    {
      id: nanoid(),
      leadId: leads[5].id,
      title: "Send welcome email",
      dueAt: now,
      status: "todo",
      channel: "email",
      templateId: "email-welcome",
    },
    // Robert Martinez
    {
      id: nanoid(),
      leadId: leads[7].id,
      title: "Send Antarctic expedition information",
      dueAt: addDays(now, 5),
      status: "todo",
      channel: "email",
    },
  ];

  return {
    version: 1,
    leads,
    activities,
    tasks,
    templates: DEFAULT_TEMPLATES,
    cadencePolicies: [DEFAULT_CADENCE],
  };
}
