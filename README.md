# Lead → Booking Autopilot

A modern, full-featured demo application showcasing automated lead nurturing and booking workflows. Built with Next.js, TypeScript, and Tailwind CSS.

## Overview

Lead → Booking Autopilot is a demonstration of an intelligent lead management system that automates the journey from initial contact to confirmed booking. This application provides a complete workflow automation platform for managing travel bookings, customer interactions, and follow-up sequences.

**Note:** This is a demo application running in demo mode. All data is stored locally in your browser's localStorage, and no real emails or SMS messages are sent.

## Features

### 📊 Dashboard
- **KPI Metrics**: Track leads across all pipeline stages (New, Qualified, Consult Booked, Quote Sent, Booked)
- **Task Management**: View tasks due today and this week
- **Activity Feed**: Monitor recent lead interactions and status changes

### 👥 Lead Management
- **Lead Pipeline**: Visual representation of leads across different stages
- **Advanced Filtering**: Search and filter leads by stage, name, destination, and more
- **Lead Details**: Comprehensive lead profiles with contact info, travel preferences, and activity timeline
- **Notes System**: Add and track notes for each lead interaction
- **Stage Management**: Easily update lead stages with automatic activity logging

### 🔄 Workflow Automation
- **Visual Workflow Builder**: Create multi-step automation sequences
- **Step Types**:
  - **Email**: Send templated email communications
  - **SMS**: Send templated text messages
  - **Wait**: Add delays between actions
  - **Task**: Create manual tasks for team members
- **Drag & Reorder**: Easily reorganize workflow steps
- **Active/Inactive Toggle**: Control which workflows are running

### 📧 Template Management
- **Email Templates**: Create rich email templates with variable substitution
- **SMS Templates**: Design concise SMS messages
- **Live Preview**: See how templates look with sample data
- **Template Variables**: Support for dynamic content:
  - `{{firstName}}` - Lead's first name
  - `{{lastName}}` - Lead's last name
  - `{{destination}}` - Travel destination
  - `{{dates}}` - Travel dates
  - `{{budget}}` - Budget amount

### ⚙️ Settings & Data Management
- **Data Export**: Download all data as JSON for backup or migration
- **Reset Demo Data**: Restore original demo dataset
- **Statistics Dashboard**: View current data counts and app version
- **Privacy**: All data stored locally with no external transmission

## Screenshots

*[Placeholder for application screenshots]*

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lead-to-booking-autopilot.git
cd lead-to-booking-autopilot
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

The application will automatically seed demo data on first load.

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create optimized production build
- `npm start` - Start production server (requires build first)
- `npm run lint` - Run ESLint to check code quality

## Deploying to Vercel

This application is optimized for deployment on Vercel:

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Import to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Click "Deploy"

3. **Configure** (if needed):
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

That's it! Vercel will automatically deploy your application and provide a production URL.

### Environment Variables

No environment variables are required for the demo mode. For production integration:

- `EMAIL_PROVIDER_API_KEY` - API key for email service (future)
- `SMS_PROVIDER_API_KEY` - API key for SMS service (future)
- `CRM_INTEGRATION_KEY` - CRM integration key (future)

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed technical documentation.

### Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Icons**: lucide-react
- **Date Handling**: date-fns
- **ID Generation**: nanoid
- **Validation**: Zod

### Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard page
│   ├── leads/            # Lead management pages
│   ├── workflows/        # Workflow management pages
│   ├── templates/        # Template management pages
│   └── settings/         # Settings page
├── components/           # React components
│   ├── layout/          # Layout components (Sidebar, Header)
│   └── ui/              # UI components (Toast, etc.)
├── lib/                 # Utility functions
│   ├── storage/         # localStorage utilities
│   └── seed-data.ts     # Demo data generation
├── types/               # TypeScript type definitions
│   ├── lead.ts
│   ├── workflow.ts
│   ├── template.ts
│   └── activity.ts
└── hooks/               # Custom React hooks
```

## Data & Privacy

- **Local Storage Only**: All data is stored in browser localStorage
- **No Server Communication**: No data is transmitted to external servers
- **Demo Mode**: Email and SMS sending is simulated, not real
- **Data Portability**: Export/import data as JSON
- **Privacy First**: No tracking, analytics, or third-party scripts

## Future Enhancements

- Real email integration (SendGrid, Mailgun, etc.)
- Real SMS integration (Twilio, etc.)
- CRM integrations (Salesforce, HubSpot)
- Team collaboration features
- Advanced analytics and reporting
- Calendar integration for consultations
- Document management
- Payment processing integration

## Contributing

This is a demo project. For production use, please fork and customize to your needs.

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please open an issue on GitHub.

---

**Built with ❤️ using Next.js and TypeScript**
