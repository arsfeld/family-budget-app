# Family Budget Application - Technical Roadmap

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
  - Server components for better performance
  - Built-in API routes
  - Excellent TypeScript support
  - Easy deployment to Fly.io

### Backend/Database
- **Database**: PostgreSQL with Prisma ORM
  - PostgreSQL for robust relational data
  - Prisma for type-safe database access
  - Automatic migrations and schema management
  - Works perfectly with Docker and Fly.io
  
Note: Initially considered SQLite with Litestream, but PostgreSQL provides better concurrent access, richer data types, and is still simple to deploy with Docker/Fly.io. Prisma abstracts away database complexities while providing excellent developer experience.

### Styling
- **CSS**: Tailwind CSS
  - Rapid development
  - Mobile-first approach
  - Minimal bundle size

### Authentication
- **Auth**: Family-based authentication
  - Users belong to families
  - Signup creates a new family automatically
  - Multiple users per family
  - Family-scoped data access

### Deployment
- **Platform**: Fly.io
  - Persistent volume for SQLite
  - Automatic SSL
  - Global CDN
  - Simple deployment via `fly deploy`

## Architecture

```
family-budget-app/
├── app/
│   ├── api/
│   │   ├── overview/
│   │   ├── settings/
│   │   └── auth/
│   ├── page.tsx (single-page app)
│   └── layout.tsx
├── components/
│   ├── IncomeSection.tsx
│   ├── ExpenseSection.tsx
│   ├── SummarySection.tsx
│   └── SettingsModal.tsx
├── lib/
│   ├── db.ts
│   └── auth.ts
└── prisma/
    └── schema.prisma
```

## Database Schema

```sql
-- Families (core authentication unit)
families:
  - id
  - name
  - created_at

-- Users (belong to families)
users:
  - id
  - family_id
  - email
  - password_hash
  - name
  - created_at

-- Monthly Overviews (multiple scenarios per family)
monthly_overviews:
  - id
  - family_id
  - name (e.g., "Current", "Planned", "Conservative")
  - is_active
  - created_at

-- User Income (monthly salaries)
user_income:
  - id
  - overview_id
  - user_id
  - monthly_salary
  - additional_income
  - notes

-- User Expenses (monthly fixed costs)
user_expenses:
  - id
  - overview_id
  - user_id
  - category
  - amount
  - is_shared (boolean)
  - share_percentage (if shared)
  - notes

-- Expense Categories
categories:
  - id
  - family_id
  - name
  - icon
  - color
```

## Development Phases

### Phase 1: MVP Single-Page Overview (Week 1)
- [ ] Next.js project setup
- [ ] PostgreSQL database with Prisma
- [ ] **Family-based authentication**
- [ ] **Create family on user signup**
- [ ] **Single-page dashboard layout**
- [ ] Income section (monthly salaries)
- [ ] Expense section (fixed monthly costs)
- [ ] Summary section (totals and balance)
- [ ] Deploy to Fly.io

### Phase 2: Core Features (Week 2)
- [ ] Edit income/expenses inline
- [ ] Expense categories
- [ ] Shared expense handling
- [ ] Visual indicators (colors for positive/negative)
- [ ] Multiple overview scenarios
- [ ] Switch between scenarios
- [ ] Clone scenarios
- [ ] Responsive mobile layout

### Phase 3: Polish & Export (Week 3)
- [ ] Print-friendly CSS
- [ ] Export to PDF
- [ ] Simple data backup
- [ ] Settings modal
- [ ] Scenario comparison view

### Phase 4: Final Polish (Week 4)
- [ ] Performance optimization
- [ ] Error handling
- [ ] Loading states
- [ ] Help tooltips
- [ ] Accessibility improvements

## Deployment Configuration

### Fly.io Setup
```toml
# fly.toml
app = "family-budget"
primary_region = "ord"

[mounts]
  source = "data"
  destination = "/data"

[env]
  DATABASE_URL = "file:/data/budget.db"

[[services]]
  http_checks = []
  internal_port = 3000
  protocol = "tcp"
```


## Security Considerations
- Environment variables for secrets
- HTTPS only via Fly.io
- SQL injection prevention via Prisma
- Input validation
- Rate limiting on API routes

## Performance Goals
- Initial load: < 2s
- Add expense: < 500ms
- Dashboard render: < 1s
- Works offline (PWA)

## Monitoring
- Basic error logging
- Fly.io metrics
- Uptime monitoring
- Database backup verification

## Simplified Features

### Data Entry
- **Quick inline editing** for all values
- **Simple forms** for initial setup
- **Category management** for organizing expenses
- **Percentage-based sharing** for split costs

### Visual Design
- **Color-coded sections** - Income (green), Expenses (red), Balance (blue/red)
- **Progress bars** showing expense vs income ratio
- **Clean typography** optimized for readability
- **Minimal UI** - focus on the numbers


## Overview System

Families can create multiple overview scenarios to compare different financial situations.

### Key Concepts
- **Multiple scenarios** - Current, planned, conservative, etc.
- **Scenario cloning** - Copy any scenario as a starting point
- **Active scenario** - One primary view at a time
- **Quick switching** - Toggle between scenarios instantly

### API Endpoints
```typescript
// Overview management
GET    /api/overview/active           // Get active overview data
POST   /api/overview                  // Create new scenario
GET    /api/overview                  // List all scenarios
PUT    /api/overview/:id              // Update scenario data
POST   /api/overview/:id/clone        // Clone scenario
PUT    /api/overview/:id/activate     // Set as active
```


## Privacy & Security Considerations
- All AI processing respects user privacy
- Option to disable AI features entirely
- Local-first approach where possible
- Encrypted storage for sensitive financial data
- API keys stored securely in environment variables
- User data never used to train external models

## Performance Targets
- Page load: < 1s
- Data update: < 200ms
- Scenario switching: < 300ms
- Export generation: < 2s

## Future Enhancements
- Multi-family support
- Budget goals/alerts
- Mobile app (React Native)
- Collaborative budgeting
- Financial insights dashboard