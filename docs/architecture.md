# Architecture Overview

This document outlines the technical architecture of Lead Autopilot, a local-first lead management application.

## System Design Principles

1. **Local-First**: All data storage and processing happens in the browser
2. **Zero External Dependencies**: No API calls, no backend servers, no authentication
3. **Type-Safe**: End-to-end TypeScript with runtime validation via Zod
4. **Deterministic**: Business logic produces predictable, testable outputs
5. **Progressive Enhancement**: Works offline after initial load

## Technology Stack

### Frontend

- **Next.js 16.1.1** (App Router) - React framework with SSR/SSG capabilities
- **React 19.2.3** - UI library with Server Components
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library

### Data & State

- **Zod 4.3.5** - Runtime schema validation
- **localStorage** - Browser-based persistent storage
- **React Context** - Global state management

### Development & Testing

- **TypeScript 5** - Static type checking
- **Vitest 4** - Unit testing framework
- **Playwright 1.57** - End-to-end testing
- **ESLint + Prettier** - Code quality and formatting

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│  (Next.js App Router Pages + React Components)              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ React Hooks
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  WorkspaceContext (React Context)            │
│  - CRUD operations for all entities                         │
│  - Auto-save to localStorage on changes                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                 ┌─────────┴─────────┐
                 │                   │
                 ▼                   ▼
┌──────────────────────┐   ┌────────────────────┐
│  Storage Layer       │   │  Cadence Engine    │
│  (storage.ts)        │   │  (engine.ts)       │
│  - Save/Load         │   │  - Generate tasks  │
│  - Import/Export     │   │  - Detect dupes    │
│  - Version migrate   │   │  - Stop rules      │
└──────┬───────────────┘   └────────────────────┘
       │
       ▼
┌──────────────────────┐
│   localStorage       │
│   (Browser API)      │
│   - Versioned JSON   │
│   - 5-10MB limit     │
└──────────────────────┘
```

## Storage Architecture

### Schema Versioning

Storage uses a versioned schema to enable future migrations:

```typescript
interface StoredData {
  version: number;        // Current: 1
  data: Workspace;        // Validated workspace
  lastUpdated: string;    // ISO timestamp
}
```

**Migration Strategy**: When `version` changes, `migrateWorkspace()` transforms old data to new schema.

### Data Model

Core entities:

1. **Lead**: Contact with stage, timeline, budget
2. **Activity**: Time-stamped event (note, call, email, SMS, status change)
3. **Task**: Actionable item with due date and status
4. **Template**: Reusable communication content
5. **CadencePolicy**: Rules for generating follow-up tasks

All entities use:
- `nanoid()` for unique IDs
- Zod schemas for validation
- `Date` objects (coerced from ISO strings on import)

### Storage Key

```typescript
const STORAGE_KEY = "lead-autopilot-workspace-v1";
```

Data stored as JSON string in `localStorage[STORAGE_KEY]`.

## Cadence Engine

### Design Goals

1. **Deterministic**: Same inputs → same outputs (testable)
2. **No Duplicates**: Skip tasks that already exist
3. **Smart Stopping**: Don't generate for Booked/Lost leads
4. **Day-Offset Based**: Tasks due at `baseDate + dayOffset`

### Algorithm

```typescript
function generateCadenceTasks({ lead, cadencePolicy, existingTasks, baseDate }) {
  // 1. Check if lead is terminal (Booked/Lost)
  if (lead.stage === "Booked" || lead.stage === "Lost") {
    return { stopped: true, reason: "..." };
  }

  // 2. For each rule in cadence policy:
  const newTasks = [];
  for (const rule of cadencePolicy.rules) {
    const dueDate = addDays(baseDate, rule.dayOffset);

    // 3. Check for duplicates (same lead, title, channel, day)
    if (isDuplicate(existingTasks, rule, dueDate)) {
      skippedCount++;
      continue;
    }

    // 4. Create task
    newTasks.push(createTask(lead, rule, dueDate));
  }

  return { tasks: newTasks, skipped: skippedCount };
}
```

### Default Cadence

5-touch policy over 8 days:

| Day | Channel | Template | Purpose |
|-----|---------|----------|---------|
| 0   | Email   | Welcome & Next Steps | Initial contact |
| 1   | SMS     | Quick Check-in | Engagement |
| 3   | Call    | Discovery Call | Qualification |
| 5   | Email   | Options Recap | Proposal |
| 8   | SMS     | Final Touch | Last attempt |

## Component Architecture

### Page Structure

```
src/app/
├── page.tsx                 # Leads dashboard (list + search)
├── pipeline/page.tsx        # Kanban board
├── leads/[id]/page.tsx      # Lead detail + tasks + activities
├── templates/page.tsx       # Template library
├── settings/page.tsx        # Import/export + demo data
└── layout.tsx               # Root layout with navigation
```

### Shared Components

```
src/components/
├── Navigation.tsx           # Top nav bar
├── LeadsList.tsx           # Table with search/filter
├── NewLeadModal.tsx        # Create lead form
```

### Context Providers

```
src/contexts/
└── WorkspaceContext.tsx    # Global state + CRUD operations
```

## Validation Strategy

### Runtime Validation (Zod)

Every data mutation passes through Zod:

```typescript
// Import workspace
const imported = WorkspaceSchema.parse(JSON.parse(jsonString));

// Create lead
const lead = LeadSchema.parse(formData);
```

**Benefits**:
- Catches invalid data at runtime
- Clear error messages for users
- Type inference (TypeScript types derived from schemas)

### Static Type Checking (TypeScript)

All code is strictly typed:

```typescript
export type Lead = z.infer<typeof LeadSchema>;
```

**Benefits**:
- Compile-time safety
- IDE autocomplete
- Refactoring confidence

## Testing Strategy

### Unit Tests (Vitest)

**Coverage**:
- Schema validation (all entities)
- Storage import/export (round-trip, error handling)
- Cadence engine (generation, duplicates, stopping)

**Total**: 42 tests

### E2E Tests (Playwright)

**Coverage**:
- App loading and navigation
- Demo workspace loading
- Lead CRUD operations
- Pipeline visualization
- Cadence generation
- Template copying
- Data export/import

**Total**: 11 smoke tests

## Performance Considerations

### Optimizations

1. **Lazy Loading**: Code split by route (Next.js automatic)
2. **No External Fonts**: System fonts reduce load time
3. **localStorage Caching**: Read once on mount, write on change
4. **React Context Memoization**: `useCallback` for stable references

### Scalability Limits

| Metric | Limit | Reason |
|--------|-------|--------|
| Leads | ~1000 | localStorage size + render performance |
| Activities | ~5000 | JSON parse/stringify time |
| Tasks | ~5000 | localStorage 5-10MB limit |

For > 1000 leads, recommend migrating to IndexedDB or server-based storage.

## Security Considerations

### No Backend = No Server-Side Attacks

- No SQL injection
- No XSS via server responses
- No CSRF tokens needed
- No authentication bypass

### Client-Side Risks

1. **XSS via User Input**: Mitigated by React's automatic escaping
2. **localStorage Tampering**: Users can edit their own data (acceptable for local-first)
3. **Data Loss**: Mitigated by export/import features

### Recommendations

- Add CSP headers in production
- Validate all user inputs (Zod already does this)
- Encourage regular exports (backups)

## Deployment Strategy

### Vercel (Recommended)

**Build Command**: `npm run build`
**Output Directory**: `.next`
**Environment Variables**: None required

The app is a static site with client-side hydration. No server functions, no API routes.

### Alternative Platforms

- **Netlify**: Works out-of-the-box
- **Cloudflare Pages**: Compatible
- **AWS S3 + CloudFront**: Static hosting
- **Self-hosted**: `npm run build && npm start`

## Future Enhancements

### Potential Improvements

1. **IndexedDB Migration**: Better performance for large datasets
2. **Service Worker**: Full offline support + background sync
3. **Web Crypto API**: Encrypt localStorage data
4. **File System Access API**: Direct file exports
5. **Multi-Workspace**: Separate datasets per project
6. **Sync Protocol**: Optional cloud backup (end-to-end encrypted)

### Architecture Changes Required

| Enhancement | Impact |
|-------------|--------|
| IndexedDB | Rewrite storage layer |
| Service Worker | Add offline manifest + caching strategy |
| Encryption | Add crypto lib + key management UI |
| Multi-Workspace | Namespace storage keys + workspace selector |
| Sync | Add conflict resolution + merge logic |

---

**Last Updated**: January 2026
**Architecture Version**: 1.0
