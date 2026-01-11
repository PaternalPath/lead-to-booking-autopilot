# Architecture Documentation

## Overview

Lead → Booking Autopilot is built using modern web technologies with a focus on simplicity, type safety, and developer experience. This document explains the technical architecture and key design decisions.

## Technology Stack

### Core Framework
- **Next.js 16.1.1** with App Router
  - Server-side rendering (SSR) and static site generation (SSG)
  - File-based routing
  - Built-in optimization for images, fonts, and scripts
  - Turbopack for fast builds

### Language & Type Safety
- **TypeScript 5**
  - Strict type checking enabled
  - Full type coverage across the application
  - Interface-based design for data models

### Styling
- **Tailwind CSS 4**
  - Utility-first CSS framework
  - JIT (Just-In-Time) compilation
  - Custom design tokens for consistent theming
  - Responsive design built-in

### Key Dependencies
- **lucide-react**: Modern icon library
- **date-fns**: Lightweight date manipulation
- **nanoid**: Secure unique ID generation
- **zod**: Runtime type validation

## Application Structure

### Pages & Routing

The application uses Next.js App Router with the following structure:

```
/app
├── page.tsx                 # Root redirect to /dashboard
├── layout.tsx              # Root layout with ToastProvider
├── /dashboard
│   └── page.tsx            # Dashboard with KPIs and activity feed
├── /leads
│   ├── page.tsx            # Lead list with search and filters
│   └── /[id]
│       └── page.tsx        # Lead detail with timeline
├── /workflows
│   ├── page.tsx            # Workflow list
│   └── /[id]
│       └── page.tsx        # Workflow editor
├── /templates
│   ├── page.tsx            # Template list
│   └── /[id]
│       └── page.tsx        # Template editor with preview
└── /settings
    └── page.tsx            # Settings and data management
```

### Component Architecture

#### Layout Components

**AppLayout** (`src/components/layout/app-layout.tsx`)
- Main application wrapper
- Initializes demo data on first load via `useDataInit` hook
- Manages sidebar visibility (desktop/mobile)
- Renders header and main content area

**Sidebar** (`src/components/layout/sidebar.tsx`)
- Navigation menu with active state tracking
- Responsive: collapsible on mobile
- Shows demo mode indicator at bottom

**Header** (`src/components/layout/header.tsx`)
- Page title display
- Mobile menu toggle button

#### UI Components

**Toast System** (`src/components/ui/toast.tsx`)
- Context-based notification system
- Three types: success, error, info
- Auto-dismiss after 4 seconds
- Stack multiple toasts
- Accessible close buttons

### Type System

All data models are defined in `src/types/` with strong TypeScript interfaces:

#### Lead Types (`types/lead.ts`)
```typescript
type LeadStage = "New" | "Qualified" | "Consult Booked" | "Quote Sent" | "Booked" | "Dormant"
type LeadSource = "Website" | "Referral" | "Social Media" | "Email Campaign" | "Direct" | "Other"

interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  stage: LeadStage
  source: LeadSource
  owner: string
  destination?: string
  dates?: string
  budget?: string
  notes: string
  nextActionAt?: string
  createdAt: string
  updatedAt: string
}
```

#### Workflow Types (`types/workflow.ts`)
```typescript
type WorkflowStepType = "Email" | "SMS" | "Wait" | "Task"

interface WorkflowStep {
  id: string
  type: WorkflowStepType
  order: number
  templateId?: string
  waitDays?: number
  taskDescription?: string
  enabled: boolean
}

interface Workflow {
  id: string
  name: string
  description: string
  trigger: string
  steps: WorkflowStep[]
  active: boolean
  createdAt: string
  updatedAt: string
}
```

#### Template Types (`types/template.ts`)
```typescript
type TemplateType = "Email" | "SMS"

interface Template {
  id: string
  name: string
  type: TemplateType
  subject?: string  // Only for Email type
  body: string
  createdAt: string
  updatedAt: string
}
```

#### Activity Types (`types/activity.ts`)
```typescript
type ActivityType = "stage_change" | "note_added" | "email_sent" | "sms_sent" | "task_created" | "lead_created"

interface Activity {
  id: string
  leadId: string
  type: ActivityType
  description: string
  metadata?: Record<string, unknown>
  createdAt: string
}
```

## State Management & Persistence

### localStorage Strategy

The application uses browser localStorage for all data persistence:

**Storage Module** (`src/lib/storage/index.ts`)
- Provides centralized access to localStorage
- Type-safe getter/setter functions
- Versioning support for future migrations
- SSR-safe (checks for browser environment)
- Export/import functionality

**Storage Keys:**
- `leads` - Array of Lead objects
- `workflows` - Array of Workflow objects
- `templates` - Array of Template objects
- `activities` - Array of Activity objects
- `app_version` - Storage schema version
- `app_initialized` - First-run flag

### Data Initialization

**useDataInit Hook** (`src/hooks/use-data-init.ts`)
- Runs once on app mount
- Checks if data already exists
- Seeds demo data on first load
- Sets initialization flag

**Demo Data Generation** (`src/lib/seed-data.ts`)
- `generateDemoLeads()` - Creates 12 sample leads across all stages
- `generateDemoTemplates()` - Creates 6 templates (4 email, 2 SMS)
- `generateDemoWorkflows()` - Creates 2 automation workflows
- `generateDemoActivities()` - Generates activity history for leads

### React State Patterns

The application follows these React state management patterns:

1. **Lazy Initialization**: State is initialized with a function to avoid re-computation
   ```typescript
   const [leads] = useState<Lead[]>(() => getLeads())
   ```

2. **Controlled Components**: All form inputs are controlled via state

3. **Optimistic Updates**: UI updates immediately, then persists to localStorage

4. **No useEffect for Initial Data**: Data loading happens in state initializers to avoid setState in useEffect

## Data Flow

### Read Operations
```
Component Mount
  ↓
State Initializer
  ↓
Storage Helper (getLeads, getWorkflows, etc.)
  ↓
localStorage.getItem()
  ↓
JSON.parse()
  ↓
Return typed data
```

### Write Operations
```
User Action (e.g., update lead stage)
  ↓
Event Handler
  ↓
Update Local State (React setState)
  ↓
Storage Helper (setLeads, setWorkflows, etc.)
  ↓
JSON.stringify()
  ↓
localStorage.setItem()
  ↓
Create Activity Entry
  ↓
Show Toast Notification
```

### Cross-Entity Updates

When an action affects multiple data types (e.g., changing lead stage creates an activity):

1. Update primary entity (Lead)
2. Create related entity (Activity)
3. Persist both to storage
4. Update all relevant state
5. Show success notification

## Features Implementation

### Dashboard
- Aggregates data from localStorage on mount
- Computes KPI metrics from lead stages
- Filters tasks by date ranges
- Displays latest 10 activities

### Lead Management
- **List View**: Client-side filtering by search query and stage
- **Detail View**: Loads single lead by ID, displays related activities
- **Stage Changes**: Updates lead, creates activity, persists both
- **Notes**: Appends to existing notes field, creates activity entry

### Workflow Editor
- **CRUD Operations**: Create, read, update workflows
- **Step Management**: Add, remove, reorder steps
- **Validation**: Ensures required fields before save
- **Template Selection**: Dropdown populated from templates filtered by type

### Template Editor
- **Live Preview**: Resolves variables with sample data in real-time
- **Variable System**: Simple string replacement (e.g., `{{firstName}}` → "Jane")
- **Type-Specific Fields**: Shows subject field only for email templates

### Settings
- **Export**: Serializes all data to JSON with version metadata
- **Reset**: Clears storage and re-seeds demo data
- **Statistics**: Computes counts from current data

## Responsive Design

The application uses Tailwind's responsive utilities:

- **Mobile First**: Base styles for mobile, enhanced for larger screens
- **Breakpoints**:
  - `sm:` - 640px (tablet)
  - `md:` - 768px
  - `lg:` - 1024px (desktop)
  - `xl:` - 1280px

- **Mobile Adaptations**:
  - Sidebar: Hidden on mobile, overlay when toggled
  - Tables: Horizontal scroll on small screens
  - Grid layouts: Stack vertically on mobile, multi-column on desktop

## Performance Considerations

1. **Lazy Initialization**: Data loaded only once on component mount
2. **Memoization**: Not currently needed due to small data size
3. **Code Splitting**: Automatic via Next.js dynamic routes
4. **Static Generation**: Dashboard and list pages pre-rendered where possible
5. **Client-Side Navigation**: Instant page transitions with Next.js router

## Security Considerations

### Current State (Demo Mode)
- No authentication/authorization
- All data client-side only
- No sensitive information stored
- No external API calls

### Production Considerations
When moving to production, consider:
- **Authentication**: Implement NextAuth.js or similar
- **API Routes**: Use Next.js API routes for server-side operations
- **Database**: Replace localStorage with PostgreSQL, MongoDB, etc.
- **Validation**: Add server-side validation with Zod schemas
- **Rate Limiting**: Protect API endpoints
- **HTTPS**: Enforce secure connections
- **CSP**: Implement Content Security Policy headers

## Testing Strategy

### Recommended Approach
- **Unit Tests**: Test utility functions (storage, data generation)
- **Component Tests**: React Testing Library for UI components
- **E2E Tests**: Playwright for critical user flows
- **Type Safety**: TypeScript catches many errors at compile time

### Key Test Scenarios
- Data persistence and retrieval
- Form validation and submission
- Lead stage transitions
- Template variable substitution
- Workflow step reordering
- Export/import functionality

## Deployment

### Vercel Deployment
The application is optimized for Vercel:

1. **Automatic Builds**: Triggered on git push
2. **Edge Network**: Global CDN distribution
3. **Preview Deployments**: Per-branch URLs
4. **Zero Config**: Works out of the box

### Build Process
```bash
npm run build
```

Output:
- Static pages: Pre-rendered HTML
- Dynamic routes: Server-rendered on demand
- Assets: Optimized and hashed
- Client bundles: Minified JavaScript

## Future Architecture Enhancements

### Recommended Improvements

1. **Backend API**
   - Next.js API Routes or tRPC
   - Prisma ORM for database access
   - RESTful or GraphQL endpoints

2. **Real-time Updates**
   - WebSocket or Server-Sent Events
   - Pusher, Ably, or custom solution
   - Multi-user collaboration

3. **State Management**
   - Consider Zustand or Jotai for complex state
   - React Query for server state
   - Separate client and server state

4. **Testing**
   - Vitest for unit tests
   - Testing Library for components
   - Playwright for E2E

5. **Monitoring**
   - Sentry for error tracking
   - Vercel Analytics for performance
   - Custom logging infrastructure

6. **Email/SMS Integration**
   - SendGrid, Postmark for email
   - Twilio, MessageBird for SMS
   - Queue system for async processing

## Conclusion

This architecture provides a solid foundation for a demo application while being extensible for production use. The type-safe, component-based approach ensures maintainability and developer experience, while the localStorage-based persistence keeps the demo simple and portable.
