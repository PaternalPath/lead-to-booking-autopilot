# Lead Autopilot

> An enterprise-ready lead pipeline and follow-up cadence tool for travel advisors and service professionals.

![Lead Autopilot Screenshot](./docs/screenshot-pipeline.png)

**Lead Autopilot** helps you manage your lead pipeline, automate follow-up cadences, and never miss an opportunity. Works locally with zero setup, or connect to a database for team collaboration.

## ✨ Features

### Core Features
- **Lead Management**: Track leads from first contact through booking
- **Visual Pipeline**: Kanban-style board with 6 stages (New → Contacted → Qualified → Proposal Sent → Booked/Lost)
- **Smart Follow-ups**: Deterministic 5-touch cadence generates tasks automatically
- **Templates**: Pre-written email, SMS, and call scripts ready to copy
- **Activity Timeline**: Log notes, calls, emails, and status changes
- **Import/Export**: Portable JSON format for backups and migrations
- **Demo Workspace**: Instant sample data to explore features

### Enterprise Features (New!)
- **Multi-tenant Architecture**: Organizations with team workspaces
- **Authentication**: Email/password + OAuth (Google, GitHub)
- **Role-Based Access**: Owner, Admin, Member roles
- **PostgreSQL Backend**: Scalable data storage with Prisma ORM
- **API-First Design**: RESTful API for integrations
- **Data Migration**: Seamlessly move from local storage to cloud
- **Structured Logging**: Production-ready observability

## 🚀 Quick Start

### Option 1: Local-First Mode (No Setup Required)

```bash
# Install dependencies
npm ci

# Run development server
npm run dev

# Open http://localhost:3000
```

All data is stored in your browser's localStorage. Works completely offline!

### Option 2: Enterprise Mode (With Database)

```bash
# Install dependencies
npm ci

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your database URL and auth secrets
# DATABASE_URL="postgresql://..."
# NEXTAUTH_SECRET="your-secret"

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Run development server
npm run dev
```

## 🏢 Enterprise Setup

### Environment Variables

```bash
# Database (PostgreSQL - Neon, Supabase, or self-hosted)
DATABASE_URL="postgresql://user:password@host:5432/lead_autopilot"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

### Database Schema

The Prisma schema includes:
- **Users & Accounts**: NextAuth.js compatible authentication
- **Organizations**: Multi-tenant workspaces with member roles
- **Leads**: Full CRM lead management
- **Activities**: Audit trail of all interactions
- **Tasks**: Follow-up task management
- **Templates**: Reusable communication templates
- **Cadence Policies**: Automated follow-up rules

### API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth/*` | GET, POST | NextAuth.js authentication |
| `/api/leads` | GET, POST | List/create leads |
| `/api/leads/[id]` | GET, PATCH, DELETE | Lead operations |
| `/api/leads/[id]/activities` | GET, POST | Lead activities |
| `/api/tasks` | GET, POST | List/create tasks |
| `/api/tasks/[id]` | GET, PATCH, DELETE | Task operations |
| `/api/templates` | GET, POST | List/create templates |
| `/api/organizations` | GET, POST | List/create organizations |
| `/api/migrate` | POST | Migrate localStorage to database |

## 📊 Demo Workflow (< 2 minutes)

1. **Load demo workspace** (Settings → Load Demo Workspace)
2. **View leads** (Leads page shows all leads with search/filter)
3. **Explore pipeline** (Pipeline page shows kanban board)
4. **Open a lead** (Click any lead to see details)
5. **Generate follow-up plan** (Click "Generate Plan" button)
6. **View templates** (Templates page → click copy icon)
7. **Export data** (Settings → Export Workspace)

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router, React 19) |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS 4 |
| **Database** | PostgreSQL + Prisma ORM |
| **Authentication** | NextAuth.js (Auth.js) |
| **Validation** | Zod schemas |
| **Data Fetching** | SWR |
| **Icons** | Lucide React |
| **Testing** | Vitest (unit) + Playwright (E2E) |
| **Build** | Turbopack |
| **Logging** | Pino |

## 🔐 Privacy & Security

### Local Mode
- All data stored in browser localStorage
- Zero external API calls
- Works completely offline

### Enterprise Mode
- Data stored in your PostgreSQL database
- JWT-based session management
- Role-based access control
- Audit logging for compliance
- GDPR/CCPA friendly data portability

See [docs/privacy.md](./docs/privacy.md) for full details.

## 🏗️ Architecture

See [docs/architecture.md](./docs/architecture.md) for system design, data flow, and technical decisions.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Test Coverage
- 61+ unit tests (Vitest)
- Component tests with React Testing Library
- Zod schema validation tests
- E2E smoke tests (Playwright)

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/PaternalPath/lead-to-booking-autopilot)

**Local Mode**: No environment variables needed!

**Enterprise Mode**:
1. Add `DATABASE_URL` (use Vercel Postgres or external)
2. Add `NEXTAUTH_SECRET`
3. Optionally add OAuth credentials

### Other Platforms
- **Railway**: Full Postgres support
- **Render**: Web service + Postgres addon
- **AWS**: ECS/Fargate + RDS
- **Self-hosted**: Docker + any Postgres

## 📚 Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:e2e` | Run Playwright E2E tests |

## 🏆 Quality Standards

This project demonstrates Fortune-500 quality standards:

- ✅ Zero build errors
- ✅ 100% type-safe (TypeScript strict)
- ✅ 61+ tests passing
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Comprehensive documentation
- ✅ Mobile-responsive design
- ✅ Accessible (WCAG compliant)
- ✅ Enterprise-ready architecture

## 🗺️ Roadmap

### Completed
- [x] Multi-tenant organizations
- [x] Authentication (Email + OAuth)
- [x] PostgreSQL backend
- [x] Role-based access control
- [x] Data migration from localStorage
- [x] User onboarding flow
- [x] Component testing with React Testing Library

### Planned
- [ ] Drag-and-drop pipeline cards
- [ ] Custom cadence policies editor
- [ ] Email integration (OAuth send)
- [ ] Calendar sync (Google, Outlook)
- [ ] Team collaboration (real-time)
- [ ] Advanced reporting/analytics
- [ ] SSO/SAML support
- [ ] Webhook integrations

## 📝 License

MIT License - feel free to use this as a starting point for your own projects!

---

**Built with enterprise quality for travel advisors and service professionals**
