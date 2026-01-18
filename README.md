# Lead Autopilot

> A local-first lead pipeline and follow-up cadence tool for travel advisors and service professionals.

![Lead Autopilot Screenshot](./docs/screenshot-pipeline.png)

**Lead Autopilot** helps you manage your lead pipeline, automate follow-up cadences, and never miss an opportunity. Built with privacy in mind—all your data stays on your device.

## ✨ Features

- **Lead Management**: Track leads from first contact through booking
- **Visual Pipeline**: Kanban-style board with 6 stages (New → Contacted → Qualified → Proposal Sent → Booked/Lost)
- **Smart Follow-ups**: Deterministic 5-touch cadence generates tasks automatically
- **Templates**: Pre-written email, SMS, and call scripts ready to copy
- **Activity Timeline**: Log notes, calls, emails, and status changes
- **Local-First**: Zero dependencies on external APIs or servers
- **Import/Export**: Portable JSON format for backups and migrations
- **Demo Workspace**: Instant sample data to explore features

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm ci

# Run development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Load Demo Data

1. Navigate to **Settings** page
2. Click **"Load Demo Workspace"**
3. Explore 8 sample leads across all pipeline stages

## 📊 Demo Workflow (< 2 minutes)

1. **Load demo workspace** (Settings → Load Demo Workspace)
2. **View leads** (Leads page shows all leads with search/filter)
3. **Explore pipeline** (Pipeline page shows kanban board)
4. **Open a lead** (Click any lead to see details)
5. **Generate follow-up plan** (Click "Generate Plan" button)
6. **View templates** (Templates page → click copy icon)
7. **Export data** (Settings → Export Workspace)

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Styling**: Tailwind CSS 4
- **Validation**: Zod schemas with TypeScript
- **Storage**: localStorage (browser-based)
- **Icons**: Lucide React
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Build**: Turbopack

## 📦 Import/Export

### Export Workspace

Navigate to **Settings** → click **"Export Workspace"**. Downloads a JSON file with all your data:

```json
{
  "version": 1,
  "leads": [...],
  "activities": [...],
  "tasks": [...],
  "templates": [...],
  "cadencePolicies": [...]
}
```

### Import Workspace

Navigate to **Settings** → click **"Import Workspace"** → select your JSON file.

Data is validated with Zod schemas. Invalid files will show clear error messages.

## 🔐 Privacy & Data Storage

**Lead Autopilot is 100% local-first.** All data is stored in your browser's localStorage. Nothing is sent to external servers.

- ✅ No external APIs required
- ✅ No analytics or tracking
- ✅ No user accounts or authentication
- ✅ Works completely offline (after initial load)

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

## 🚢 Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/lead-to-booking-autopilot)

### Manual Deployment

1. **Import repository** into Vercel
2. **Build Command**: `npm run build`
3. **Output Directory**: `.next`
4. **Environment Variables**: None required! ✨
5. **Deploy**

The app requires NO environment variables and NO external services.

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

## 🤝 Contributing

This is a demo project showcasing local-first architecture and Fortune-500 quality standards:

- ✅ Zero build errors
- ✅ 100% type-safe
- ✅ 42 unit tests passing
- ✅ 11 E2E smoke tests
- ✅ Fully documented
- ✅ CI/CD ready
- ✅ Mobile-friendly
- ✅ Accessible (WCAG)

## 📝 License

MIT License - feel free to use this as a starting point for your own projects!

## 🗺️ Roadmap (Future Ideas)

- [ ] Drag-and-drop pipeline cards
- [ ] Custom cadence policies
- [ ] Email integration (OAuth)
- [ ] Calendar sync
- [ ] Multi-workspace support
- [ ] Team collaboration features
- [ ] Advanced reporting/analytics

---

**Built with ❤️ for travel advisors and service professionals**
