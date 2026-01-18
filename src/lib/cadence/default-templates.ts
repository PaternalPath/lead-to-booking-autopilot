import { Template } from "@/types/template";

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: "email-welcome",
    channel: "email",
    name: "Welcome & Next Steps",
    subject: "Great to connect! Here's what's next",
    body: `Hi [Name],

Thank you for reaching out! I'm excited to help you plan your upcoming trip.

Based on our conversation, I understand you're interested in [Service Intent] with a timeline of [Timeline]. I'll put together some personalized options for you within the next 24-48 hours.

In the meantime, here are a few things to consider:
• Your ideal budget range
• Preferred travel dates (with some flexibility if possible)
• Any must-have experiences or accommodations

Feel free to reply to this email with any questions or additional details.

Looking forward to creating an amazing experience for you!

Best regards,
[Your Name]`,
    tags: ["welcome", "first-contact"],
  },
  {
    id: "email-options-recap",
    channel: "email",
    name: "Options Recap",
    subject: "Your travel options - let's discuss!",
    body: `Hi [Name],

I've put together a few great options based on your preferences for [Service Intent].

Here's a quick recap of what I've found:
• Option 1: [Brief description]
• Option 2: [Brief description]
• Option 3: [Brief description]

All options are within your [Budget Range] budget and align with your [Timeline] timeframe.

I'd love to walk you through these options in detail. Would you have 15-20 minutes for a quick call this week?

Let me know what works best for you!

Best,
[Your Name]`,
    tags: ["follow-up", "options"],
  },
  {
    id: "sms-quick-checkin",
    channel: "sms",
    name: "Quick Check-in",
    body: `Hi [Name], just checking in on your [Service Intent] plans! Any questions I can help with? - [Your Name]`,
    tags: ["check-in", "casual"],
  },
  {
    id: "sms-final-touch",
    channel: "sms",
    name: "Final Touch",
    body: `Hi [Name], I know you're busy! Just wanted to make sure you got my email about your [Service Intent] options. Still here to help when you're ready! - [Your Name]`,
    tags: ["follow-up", "gentle-reminder"],
  },
  {
    id: "email-booking-confirmation",
    channel: "email",
    name: "Booking Confirmation",
    subject: "Your trip is confirmed!",
    body: `Hi [Name],

Exciting news - your trip is officially booked!

Here are your confirmation details:
• Service: [Service Intent]
• Dates: [Dates]
• Confirmation number: [Confirmation Number]

I'll be sending you a detailed itinerary within 24 hours with all the important information you'll need.

If you have any questions before your trip, I'm always here to help!

Safe travels,
[Your Name]`,
    tags: ["booking", "confirmation"],
  },
  {
    id: "call-discovery",
    channel: "call",
    name: "Discovery Call",
    body: `Call agenda:
• Thank them for their interest
• Ask about their travel experience preferences
• Understand budget and timeline in detail
• Discuss any special occasions or requirements
• Set expectations for next steps
• Schedule follow-up if needed

Key questions:
- What inspired this trip?
- Have you traveled to similar destinations before?
- What's most important to you for this trip?
- Are there any concerns I should address?`,
    tags: ["discovery", "consultation"],
  },
  {
    id: "call-options-review",
    channel: "call",
    name: "Options Review Call",
    body: `Call agenda:
• Recap their preferences
• Present 2-3 curated options
• Highlight pros/cons of each
• Answer questions and address concerns
• Discuss next steps (booking, deposits, etc.)
• Set decision timeline

Be prepared to discuss:
- Pricing details and what's included
- Cancellation/change policies
- Payment schedules
- Any current promotions or value-adds`,
    tags: ["options", "consultation"],
  },
];
