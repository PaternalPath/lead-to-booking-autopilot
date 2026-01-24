# Test Coverage Analysis

This document provides an analysis of the current test coverage in the Lead Autopilot codebase and proposes specific areas for improvement.

## Current Test Landscape

### Summary Statistics
| Category | Count | Status |
|----------|-------|--------|
| **Total Tests** | 68 | |
| Unit Tests (Vitest) | 55 | Tested |
| E2E Tests (Playwright) | 13 | Tested |
| React Components | 3 | **Not Unit Tested** |
| React Context | 1 | **Not Unit Tested** |
| Library Utilities | 4 | **Partially Tested** |

### Currently Tested Modules

| Module | Test File | Tests | Coverage |
|--------|-----------|-------|----------|
| Cadence Engine | `src/lib/cadence/__tests__/engine.test.ts` | 13 | Full |
| Storage (Import/Export) | `src/lib/storage/__tests__/storage.test.ts` | 15 | Full |
| Zod Schemas | `src/types/__tests__/schemas.test.ts` | 27 | Full |
| User Workflows | `tests/smoke.spec.ts` | 13 | E2E |

### Modules Without Tests

| Module | File | Lines | Risk Level |
|--------|------|-------|------------|
| WorkspaceContext | `src/contexts/WorkspaceContext.tsx` | 269 | **High** |
| NewLeadModal | `src/components/NewLeadModal.tsx` | 226 | **High** |
| LeadsList | `src/components/LeadsList.tsx` | 135 | Medium |
| Navigation | `src/components/Navigation.tsx` | ~78 | Low |
| Demo Data | `src/lib/demo-data.ts` | 316 | Medium |
| Migrations | `src/lib/storage/migrations.ts` | 22 | **High** |
| Default Cadence | `src/lib/cadence/default-cadence.ts` | ~50 | Low |
| Default Templates | `src/lib/cadence/default-templates.ts` | ~100 | Low |

---

## Proposed Test Improvements

### Priority 1: High Impact - WorkspaceContext (Critical)

**Why it matters**: `WorkspaceContext` is the central state management hub, handling all CRUD operations for leads, activities, tasks, templates, and cadence policies. A bug here affects the entire application.

**Proposed Tests** (`src/contexts/__tests__/WorkspaceContext.test.tsx`):

```typescript
describe("WorkspaceContext", () => {
  describe("Lead Operations", () => {
    it("should add a new lead to the workspace")
    it("should update an existing lead with new data")
    it("should update the updatedAt timestamp when updating a lead")
    it("should delete a lead and cascade delete related activities/tasks")
    it("should find a lead by ID")
    it("should return undefined for non-existent lead ID")
  })

  describe("Activity Operations", () => {
    it("should add an activity to the workspace")
    it("should filter activities by lead ID")
    it("should sort activities by createdAt descending (newest first)")
  })

  describe("Task Operations", () => {
    it("should add a task to the workspace")
    it("should update a task status")
    it("should delete a task")
    it("should filter tasks by lead ID")
    it("should sort tasks by dueAt ascending (soonest first)")
  })

  describe("Template Operations", () => {
    it("should add a template")
    it("should update a template")
    it("should delete a template")
    it("should find a template by ID")
  })

  describe("Workspace Lifecycle", () => {
    it("should load workspace from localStorage on mount")
    it("should save workspace to localStorage on changes")
    it("should handle localStorage errors gracefully")
    it("should clear workspace and localStorage")
    it("should import a new workspace")
    it("should load demo workspace")
  })

  describe("Error Handling", () => {
    it("should set error state when load fails")
    it("should set error state when save fails")
    it("should throw error when useWorkspace is used outside provider")
  })
})
```

**Estimated Tests**: ~22 tests

---

### Priority 2: High Impact - NewLeadModal Component

**Why it matters**: This component handles user input validation using Zod schemas. Form bugs can lead to invalid data entering the system.

**Proposed Tests** (`src/components/__tests__/NewLeadModal.test.tsx`):

```typescript
describe("NewLeadModal", () => {
  describe("Rendering", () => {
    it("should not render when isOpen is false")
    it("should render the modal when isOpen is true")
    it("should display all form fields")
    it("should show required indicator on Full Name field")
  })

  describe("Form Interaction", () => {
    it("should update form state when inputs change")
    it("should call onClose when close button is clicked")
    it("should call onClose when cancel button is clicked")
    it("should call onClose when backdrop is clicked")
  })

  describe("Form Submission", () => {
    it("should validate input using LeadSchema")
    it("should call onSave with valid lead data on submit")
    it("should generate unique ID for new lead")
    it("should set createdAt and updatedAt to current date")
    it("should reset form after successful submission")
    it("should display validation errors on invalid input")
  })

  describe("Accessibility", () => {
    it("should have proper labels for all inputs")
    it("should support keyboard navigation")
    it("should trap focus within modal when open")
  })
})
```

**Estimated Tests**: ~16 tests

---

### Priority 3: High Impact - Migrations Module

**Why it matters**: Data migrations run on every load. A bug in migrations can corrupt user data or cause data loss.

**Proposed Tests** (`src/lib/storage/__tests__/migrations.test.ts`):

```typescript
describe("Migrations", () => {
  describe("migrateWorkspace", () => {
    it("should return unchanged data when fromVersion equals toVersion")
    it("should apply single migration for version increment of 1")
    it("should apply multiple migrations in sequence for larger version jumps")
    it("should skip missing migration versions gracefully")
    it("should preserve data integrity through migration chain")
  })

  describe("Future Migration Preparation", () => {
    it("should handle v1 to v2 migration when defined")
    it("should transform data correctly for each migration step")
    it("should rollback-safe: migrated data can be validated against new schema")
  })
})
```

**Estimated Tests**: ~7 tests

---

### Priority 4: Medium Impact - LeadsList Component

**Why it matters**: Contains business logic for searching and filtering leads. Bugs here affect user productivity.

**Proposed Tests** (`src/components/__tests__/LeadsList.test.tsx`):

```typescript
describe("LeadsList", () => {
  describe("Rendering", () => {
    it("should render table with leads")
    it("should show empty state when no leads")
    it("should display correct stage badge colors")
    it("should format dates correctly")
  })

  describe("Search Functionality", () => {
    it("should filter leads by full name (case insensitive)")
    it("should filter leads by email (case insensitive)")
    it("should filter leads by phone number")
    it("should show 'no matches' message when search has no results")
    it("should clear search and show all leads")
  })

  describe("Stage Filtering", () => {
    it("should filter leads by selected stage")
    it("should show all leads when 'All Stages' is selected")
    it("should combine search and stage filters correctly")
  })

  describe("Actions", () => {
    it("should call onNewLead when 'New Lead' button is clicked")
    it("should link to lead detail page")
  })
})
```

**Estimated Tests**: ~14 tests

---

### Priority 5: Medium Impact - Demo Data Generator

**Why it matters**: Demo data is used for onboarding and testing. Invalid demo data would break the user's first experience.

**Proposed Tests** (`src/lib/__tests__/demo-data.test.ts`):

```typescript
describe("loadDemoWorkspace", () => {
  describe("Data Structure", () => {
    it("should return a valid workspace matching WorkspaceSchema")
    it("should include leads in all 6 stages")
    it("should include activities for multiple leads")
    it("should include tasks with various statuses")
    it("should include default templates")
    it("should include default cadence policy")
  })

  describe("Data Relationships", () => {
    it("should have activities referencing valid lead IDs")
    it("should have tasks referencing valid lead IDs")
    it("should have tasks referencing valid template IDs where specified")
  })

  describe("Date Handling", () => {
    it("should create leads with createdAt dates in the past")
    it("should create tasks with dueAt dates relative to now")
    it("should ensure updatedAt >= createdAt for all leads")
  })
})
```

**Estimated Tests**: ~11 tests

---

### Priority 6: Low Impact - Integration Tests

**Why it matters**: Ensures components work correctly together, catching issues that unit tests miss.

**Proposed Integration Tests** (`src/__tests__/integration/`):

```typescript
describe("Lead Lifecycle Integration", () => {
  it("should create lead, add activity, and update stage correctly")
  it("should cascade delete activities and tasks when lead is deleted")
  it("should persist changes across page reloads (via localStorage)")
})

describe("Cadence Integration", () => {
  it("should generate tasks and add them to workspace")
  it("should not duplicate tasks when running cadence twice")
  it("should mark cadence tasks with correct template references")
})

describe("Import/Export Integration", () => {
  it("should export workspace and import it back identically")
  it("should import workspace from external JSON file")
  it("should reject invalid import data with helpful error")
})
```

**Estimated Tests**: ~9 tests

---

## Coverage Gaps by Risk Level

### Critical (Must Fix)
1. **WorkspaceContext** - Central state management with no unit tests
2. **Migrations** - Data transformation with no tests (future migrations need validation)
3. **NewLeadModal** - User input validation not tested at unit level

### Important (Should Fix)
4. **LeadsList** - Search/filter logic not unit tested (relies on E2E)
5. **Demo Data** - Schema validation and relationship integrity not tested
6. **localStorage persistence** - Only tested via E2E, no unit tests for edge cases

### Nice to Have
7. **Navigation** - Simple component, adequately covered by E2E
8. **Default Templates/Cadence** - Static data, low bug potential
9. **Accessibility tests** - Would improve a11y confidence

---

## Recommended Implementation Order

1. **Week 1**: WorkspaceContext tests (highest impact, central to app)
2. **Week 1**: Migrations tests (critical for data safety)
3. **Week 2**: NewLeadModal tests (user input validation)
4. **Week 2**: Demo data tests (onboarding experience)
5. **Week 3**: LeadsList tests (search/filter logic)
6. **Week 3**: Integration tests (cross-module behavior)

---

## Test Coverage Goals

| Metric | Current | Target | Notes |
|--------|---------|--------|-------|
| Unit Tests | 55 | ~130 | +75 tests |
| E2E Tests | 13 | 20 | +7 workflow tests |
| Components Tested | 0/3 | 3/3 | All UI components |
| Contexts Tested | 0/1 | 1/1 | WorkspaceContext |
| Code Coverage | ~40% | 80%+ | Estimated |

---

## Next Steps

1. Set up code coverage reporting (e.g., `vitest --coverage`)
2. Add coverage thresholds to CI pipeline
3. Create test files for Priority 1 & 2 items
4. Document testing patterns for team consistency
