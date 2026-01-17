# Fortune-500 Upgrade Plan

## Current State Audit

### Framework & Version
- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x (strict mode enabled)
- **Build Tool**: Turbopack
- **Styling**: Tailwind CSS 4.x

### Package.json Scripts Status
✅ **Working**:
- `dev` - Development server
- `build` - Production build (currently failing)
- `start` - Production server
- `lint` - ESLint

❌ **Missing**:
- `typecheck` - TypeScript type checking
- `test` - Unit tests (Vitest)
- `test:e2e` - End-to-end tests (Playwright)

### Dependencies Analysis
**Production** (good foundation):
- `zod` ^4.3.5 - Schema validation ✅
- `date-fns` ^4.1.0 - Date manipulation ✅
- `nanoid` ^5.1.6 - ID generation ✅
- `lucide-react` ^0.562.0 - Icons ✅

**DevDependencies**:
- ESLint + Prettier configured ✅
- Tailwind CSS 4 ✅

**Missing**:
- Testing framework (Vitest)
- E2E testing (Playwright)
- React Testing Library

### Data/Storage Approach
**Current**: None (default Next.js scaffold)

**Planned**:
- Client-side localStorage with versioned schema
- Fallback-ready for indexedDB if needed
- JSON import/export for portability

### Known Issues
1. **Build Failure**: Google Fonts (Geist) fetch fails during build due to TLS
   - Impact: Blocks Vercel deployment
   - Fix: Remove Google Fonts or use fallback system fonts

2. **No type-checking script**: TypeScript errors won't be caught in CI

3. **No testing infrastructure**: Can't verify business logic or UI behavior

4. **Default Next.js content**: Generic landing page, no product functionality

5. **No Node version pinning**: Could cause deployment inconsistencies

## Implementation Plan

### Task 1: Fix Build Errors (CRITICAL)
**Goal**: Get `npm run build` passing with ZERO external dependencies

- Remove Google Fonts (Geist, Geist Mono) from layout.tsx
- Use system font stack: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
- Update Tailwind config to use system fonts
- Verify build succeeds locally
- **Commit**: `fix: remove Google Fonts to enable offline builds`

### Task 2: Standardize Scripts & Tooling
**Goal**: Complete npm scripts and development tooling

- Add `typecheck` script: `tsc --noEmit`
- Install Vitest + React Testing Library
- Add `test` script: `vitest run`
- Add `test:watch` script: `vitest`
- Install Playwright
- Add `test:e2e` script: `playwright test`
- Create `.nvmrc` with Node 20 (LTS)
- Add `engines.node` to package.json
- Update ESLint config if needed
- Create `.prettierrc` for consistent formatting
- **Commit**: `chore: add typecheck, test scripts and pin Node version`

### Task 3: Data Model & Zod Schemas
**Goal**: Type-safe data layer with runtime validation

Create `src/types/` with:
- `lead.ts` - Lead type & schema
- `activity.ts` - Activity type & schema
- `task.ts` - Task type & schema
- `template.ts` - Template type & schema
- `cadence.ts` - CadencePolicy type & schema
- `workspace.ts` - Workspace import/export schema

**Lead Schema**:
```typescript
{
  id: string (nanoid)
  fullName: string
  email?: string
  phone?: string
  source?: string
  destinationOrServiceIntent?: string
  budgetRange?: string
  timeline?: string
  notes?: string
  stage: "New" | "Contacted" | "Qualified" | "ProposalSent" | "Booked" | "Lost"
  createdAt: Date
  updatedAt: Date
}
```

**Activity Schema**:
```typescript
{
  id: string
  leadId: string
  type: "note" | "call" | "email" | "sms" | "status_change"
  body: string
  createdAt: Date
}
```

**Task Schema**:
```typescript
{
  id: string
  leadId: string
  title: string
  dueAt: Date
  status: "todo" | "done"
  channel?: "email" | "sms" | "call"
  templateId?: string
}
```

**Template Schema**:
```typescript
{
  id: string
  channel: "email" | "sms" | "call"
  name: string
  subject?: string
  body: string
  tags?: string[]
}
```

**CadencePolicy Schema**:
```typescript
{
  id: string
  name: string
  rules: Array<{
    dayOffset: number
    channel: "email" | "sms" | "call"
    templateId?: string
    title: string
  }>
}
```

- **Commit**: `feat: add TypeScript types and Zod schemas for data model`

### Task 4: Local-First Storage Layer
**Goal**: Versioned localStorage with migration support

Create `src/lib/storage/`:
- `schema.ts` - Storage version and migration types
- `storage.ts` - Storage abstraction layer
- `migrations.ts` - Schema migrations

Features:
- Version 1 schema
- Auto-migration on version mismatch
- Clear error handling
- Export workspace as JSON
- Import workspace with validation

- **Commit**: `feat: implement versioned local storage layer`

### Task 5: Core UI - Leads Dashboard
**Goal**: Professional leads list with search and filters

Create `src/app/leads/page.tsx`:
- Table/list view with lead info
- Search by name/email
- Filter by stage
- "New Lead" button → modal/page
- Empty state with "Load Demo Workspace" CTA
- Loading states
- Mobile-responsive

- **Commit**: `feat: add leads dashboard with search and filters`

### Task 6: Core UI - Pipeline View
**Goal**: Visual kanban-style stage management

Create `src/app/pipeline/page.tsx`:
- Column per stage with counts
- Lead cards in each column
- Move between stages (click/drag)
- Accessible keyboard navigation
- Empty state per column
- Mobile: horizontal scroll or stacked

- **Commit**: `feat: add pipeline kanban view`

### Task 7: Core UI - Lead Detail Page
**Goal**: Full lead management in one place

Create `src/app/leads/[id]/page.tsx`:
- Lead info display + edit mode
- Activity timeline (reverse chronological)
- Add activity (note, call logged)
- Tasks list with checkbox to complete
- "Generate Follow-up Plan" button
- Delete lead action
- Back navigation

- **Commit**: `feat: add lead detail page with activity and tasks`

### Task 8: Templates & Import/Export
**Goal**: Reusable communication templates and data portability

Create `src/app/templates/page.tsx`:
- List templates by channel
- View template content
- Copy to clipboard action
- Simple inline editor (optional)

Create `src/app/settings/page.tsx`:
- Export workspace → JSON download
- Import workspace → file upload + validation
- Clear workspace → confirmation dialog
- Version display

- **Commit**: `feat: add templates and import/export functionality`

### Task 9: Deterministic Cadence Engine
**Goal**: Rules-based follow-up task generation

Create `src/lib/cadence/`:
- `engine.ts` - Generate tasks from cadence policy
- `default-cadence.ts` - Default 5-touch policy
- `default-templates.ts` - Email/SMS templates

Default Cadence:
- Day 0: Email "Thanks + Next Steps"
- Day 1: SMS "Quick check-in"
- Day 3: Call task "Discovery call"
- Day 5: Email "Options recap"
- Day 8: SMS "Final touch"

Rules:
- Don't duplicate existing tasks
- Stop if stage is Booked or Lost
- Deterministic (testable)

- **Commit**: `feat: implement deterministic follow-up cadence engine`

### Task 10: Demo Data & Fixtures
**Goal**: Instant product tour

Create `fixtures/demo-workspace.json`:
- 8-10 sample leads across all stages
- Activity history for each
- Some with tasks (completed and pending)
- Templates pre-loaded

Create `src/lib/demo-data.ts`:
- Load demo workspace function
- Clear existing data warning

- **Commit**: `feat: add demo workspace with sample leads and templates`

### Task 11: Unit Tests (Vitest)
**Goal**: Verify core business logic

Create tests:
- `src/types/__tests__/schemas.test.ts` - Zod validation
- `src/lib/storage/__tests__/storage.test.ts` - Storage operations
- `src/lib/cadence/__tests__/engine.test.ts` - Cadence generation

Test coverage:
- Valid/invalid data validation
- Import workspace with malformed JSON
- Cadence rules (no duplicates, stops on Booked/Lost)
- Storage versioning

- **Commit**: `test: add unit tests for schemas, storage, and cadence`

### Task 12: E2E Tests (Playwright)
**Goal**: Smoke test critical user paths

Create `tests/e2e/`:
- `smoke.spec.ts` - App loads, navigation works
- `leads.spec.ts` - Create lead, load demo workspace
- `pipeline.spec.ts` - Move lead between stages
- `cadence.spec.ts` - Generate follow-up plan creates tasks
- `import-export.spec.ts` - Export downloads JSON

- **Commit**: `test: add Playwright e2e smoke tests`

### Task 13: Documentation
**Goal**: Clear onboarding and architectural context

**README.md**:
- Hero: 1-2 sentence pitch
- Screenshot/GIF of pipeline view
- Quickstart (npm ci, dev, build)
- Load demo workspace instructions
- Import/export guide
- Privacy note (local-first)
- Vercel deploy button + instructions

**docs/architecture.md**:
- Data flow diagram (text)
- Storage choice rationale
- Cadence engine logic
- Testing strategy

**docs/privacy.md**:
- What data is stored (leads, activities, tasks)
- Where it's stored (localStorage, never sent to server)
- How to export/delete
- No analytics, no tracking

- **Commit**: `docs: add README, architecture, and privacy documentation`

### Task 14: GitHub Actions CI
**Goal**: Automated quality checks on every push

Create `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

- **Commit**: `ci: add GitHub Actions workflow for lint, typecheck, test, build`

### Task 15: Final Polish & Verification
**Goal**: Ensure all acceptance criteria pass

- Run all scripts locally:
  - `npm ci` ✅
  - `npm run lint` ✅
  - `npm run typecheck` ✅
  - `npm test` ✅
  - `npm run build` ✅
- Test Vercel preview deploy (no env vars)
- 2-minute demo run-through
- Accessibility audit (keyboard nav, labels)
- Mobile responsive check
- Create `.env.example` (empty or commented)
- Update metadata in layout.tsx (title, description)

- **Commit**: `chore: final polish and metadata updates`

## Success Criteria Checklist

### Clean Machine Verification
- [ ] `npm ci` succeeds
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (all tests)
- [ ] `npm run build` succeeds (no errors)

### Vercel Readiness
- [ ] Deploy succeeds with NO environment variables
- [ ] No external API calls required
- [ ] All functionality works in production build

### MVP Demo (< 2 minutes)
- [ ] Load demo workspace
- [ ] View leads in dashboard
- [ ] View pipeline with stages
- [ ] Open lead detail
- [ ] View activity timeline
- [ ] Generate follow-up plan
- [ ] View generated tasks
- [ ] View templates
- [ ] Copy template to clipboard
- [ ] Export workspace JSON
- [ ] Import workspace JSON

### UX Quality
- [ ] Empty states designed
- [ ] Loading states where needed
- [ ] Error states with helpful messages
- [ ] Mobile-friendly layout
- [ ] Accessible (labels, keyboard nav, focus states)

### Repo Maturity
- [ ] README with screenshot/GIF above fold
- [ ] docs/architecture.md (1 page)
- [ ] docs/privacy.md
- [ ] GitHub Actions CI passing
- [ ] .env.example exists (empty/optional)

## Risk Mitigation

**Risk**: Build complexity grows
**Mitigation**: Keep dependencies minimal, avoid heavy UI frameworks

**Risk**: Storage bugs lose user data
**Mitigation**: Versioning + export/import + comprehensive tests

**Risk**: Accessibility overlooked
**Mitigation**: Test keyboard nav and screen reader labels early

**Risk**: Demo doesn't work
**Mitigation**: Test demo workspace load in multiple browsers

## Estimated Breakdown

Small, focused commits:
1. Build fix - 5 min
2. Scripts & tooling - 15 min
3. Data model - 20 min
4. Storage layer - 30 min
5. Leads dashboard - 45 min
6. Pipeline view - 45 min
7. Lead detail - 45 min
8. Templates & settings - 30 min
9. Cadence engine - 30 min
10. Demo data - 20 min
11. Unit tests - 40 min
12. E2E tests - 40 min
13. Documentation - 30 min
14. CI - 10 min
15. Final polish - 30 min

**Total**: ~6 hours of focused implementation

## Notes

- No AI features (keep it deterministic and testable)
- No external APIs (local-first MVP)
- No authentication (single-user local app)
- No backend (static export compatible)
- Generic industry-agnostic copy throughout
