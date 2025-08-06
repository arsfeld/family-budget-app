# Family Budget App - CLAUDE Development Guide

## Project Overview

This is a **Family Budget Application** - a streamlined family budget overview tool focused on monthly income and fixed expenses. Built as a single-page dashboard that provides at-a-glance financial summaries without complex transaction tracking.

**Core Concept**: Families can create multiple budget scenarios to compare different financial situations, with emphasis on monthly salaries and fixed costs rather than individual expense tracking.

## Tech Stack & Architecture

### Frontend/Backend

- **Next.js 15** with App Router (React 19)
- **TypeScript** with strict mode enabled
- **Tailwind CSS** for styling with **Aceternity UI** components
- **Framer Motion** for advanced animations and interactions
- **Server Actions** enabled for form handling

### Database & Auth

- **PostgreSQL** with **Prisma ORM** for type-safe database operations
- **NextAuth.js** with family-based authentication system
- **bcryptjs** for password hashing

### Development Environment

- **Docker Compose** for consistent development setup
- **Just** task runner for automation (`justfile`)
- **ESLint + Prettier** for code quality
- **TensorFlow.js** for local AI inference

### Key Features

- **Family-centric multi-user system** - Users belong to families, data is family-scoped
- **Multiple budget scenarios** - Create different "what-if" financial overviews
- **Shared expense handling** - Percentage-based cost splitting
- **Single-page dashboard** - All key info visible at once
- **Export capabilities** - Print-friendly layouts

## Development Workflow

### Essential Commands (Use Just)

```bash
# First time setup
just setup        # Creates .env, starts services, seeds database

# Daily development
just dev          # Start development environment (app + DB)
just down         # Stop all services
just logs         # View logs in follow mode
just restart-app  # Restart app after code changes

# Database operations
just db-setup     # Run migrations and seed data
just db-reset     # Fresh database start
just db-studio    # Open Prisma Studio GUI

# Code quality
just check        # Run ESLint and TypeScript checks
just format       # Format code with Prettier

# Deployment
just build        # Build production Docker image
just deploy       # Deploy to Fly.io
```

### Project Structure

```
family-budget-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages (login, signup)
│   ├── (dashboard)/       # Main dashboard page
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── providers.tsx      # Context providers
├── components/            # React components
│   └── ui/aceternity/     # Aceternity UI components
├── lib/                   # Utility functions
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database client
│   ├── prisma.ts         # Prisma client setup
│   ├── utils.ts          # General utilities
│   └── aceternity-utils.ts # Aceternity UI utilities
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts          # Sample data seeding
├── justfile              # Task automation
├── docker-compose.yml    # Development environment
└── Dockerfile           # Multi-stage build (dev/prod)
```

## Database Schema (Key Models)

```prisma
// Core family-based authentication
Family -> User (1:many)

// Budget scenarios system
Family -> MonthlyOverview (1:many) // Multiple budget scenarios
MonthlyOverview -> UserIncome (1:many)
MonthlyOverview -> UserExpense (1:many)

// Categorization
Family -> Category (1:many)
Category -> UserExpense (1:many)
```

**Important**: All data is scoped to families. Users belong to families, and all budget data is family-specific.

## Development Guidelines

### Code Standards

- **TypeScript strict mode** - No implicit any, proper typing required
- **ESLint rules**: Follow Next.js + TypeScript recommended practices
- **Prettier formatting**: 2-space indentation, single quotes, no semicolons
- **Tailwind CSS**: Use utility classes, mobile-first responsive design

### Authentication System

- **Family-based auth**: Users sign up and automatically create a family
- **NextAuth.js**: JWT strategy with custom user session extensions
- **Route protection**: Middleware protects dashboard routes
- **Session shape**: Includes `user.familyId` for data scoping

### Database Operations

- **Always use Prisma Client**: Type-safe database operations
- **Family scoping**: All queries must filter by user's familyId
- **Migrations**: Use `just db-migrate` for schema changes
- **Seeding**: Sample data available via `just db-setup`

### API Development

- **Server Actions**: Prefer for form submissions
- **API Routes**: For complex operations or external integrations
- **Error handling**: Use proper HTTP status codes and error responses
- **Validation**: Use Zod schemas for input validation

### UI/UX Principles

- **Single-page focus**: Dashboard shows all key info on one screen
- **Monthly overview**: Focus on fixed income/expenses, not individual transactions
- **Scenario switching**: Easy toggle between different budget scenarios
- **Responsive design**: Mobile-first, works on all screen sizes
- **Print-friendly**: CSS optimized for printing monthly overviews

## Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/family_budget"

# Authentication
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional AI features
OPENAI_API_KEY="your-openai-key"
```

### Docker Services

- **app**: Next.js application (port 3000)
- **db**: PostgreSQL 16 (port 5432)

## Testing & Quality Assurance

### Available Test Commands

```bash
npm run test          # Run Jest tests
npm run test:watch    # Run tests in watch mode
npm run lint          # ESLint checking
npm run typecheck     # TypeScript checking
npm run format        # Prettier formatting
npm run format:check  # Check formatting
```

### Code Quality Checks

- **TypeScript**: Strict mode enabled, no implicit any
- **ESLint**: Next.js + TypeScript recommended rules
- **Prettier**: Consistent code formatting with Tailwind plugin
- **Prisma**: Database schema validation and type generation

## Deployment

### Fly.io Deployment

- **Production ready**: Dockerfile with multi-stage builds
- **Environment**: Set production secrets via `fly secrets set`
- **Database**: Use Fly Postgres or external PostgreSQL
- **SSL**: Automatic via Fly.io platform

### Build Process

1. **Dependencies**: npm install with package-lock.json
2. **Database**: Prisma generate for client types
3. **Next.js**: Production build with standalone output
4. **Docker**: Multi-stage build for optimal image size

## Common Patterns & Best Practices

### Data Fetching

```typescript
// Always scope by family
const data = await db.monthlyOverview.findMany({
  where: { familyId: user.familyId },
})
```

### Form Handling

```typescript
// Use Server Actions for form submissions
async function createBudget(formData: FormData) {
  'use server'
  // Validation with Zod
  // Database operations with Prisma
}
```

### Component Organization

- **Page components**: In app/ directory
- **Reusable components**: In components/ directory
- **Form components**: Handle validation and submission
- **Display components**: Pure presentation, no business logic

## Troubleshooting

### Common Issues

1. **Database connection**: Check Docker containers running
2. **Prisma errors**: Run `just db-generate` after schema changes
3. **Type errors**: Ensure Prisma client is generated
4. **Port conflicts**: Use `just down` to stop all services

### Debug Commands

```bash
just logs           # View all service logs
just shell          # Access app container shell
just db-studio      # Open database GUI
docker compose ps   # Check service status
```

## Key Files to Understand

### Configuration

- `/package.json` - Dependencies and scripts
- `/justfile` - Development task automation
- `/docker-compose.yml` - Development environment
- `/prisma/schema.prisma` - Database schema
- `/.eslintrc.json` - Linting rules
- `/.prettierrc` - Code formatting

### Core Application

- `/app/layout.tsx` - Root layout and providers
- `/app/(dashboard)/dashboard/page.tsx` - Main dashboard
- `/lib/auth.ts` - NextAuth configuration
- `/lib/db.ts` - Database client setup
- `/middleware.ts` - Route protection

### Documentation

- `/README.md` - Quick start guide
- `/DX_GUIDE.md` - Detailed development instructions
- `/TECHNICAL_ROADMAP.md` - Architecture and implementation details
- `/PRODUCT.md` - Feature specifications

## UI Component System (Aceternity UI)

The application uses **Aceternity UI** components for enhanced user experience with animations and modern interactions:

### Core Components

- **CardSpotlight** - Interactive cards with spotlight hover effects for income, expenses, and summaries
- **StatefulButton** - Buttons with built-in loading and success states
- **FloatingNavbar** - Auto-hiding navigation bar with smooth transitions
- **ScenarioTabs** - Animated tabs for switching between budget scenarios
- **AnimatedTooltip** - Contextual help tooltips with smooth animations
- **MultiStepLoader** - Visual loading states for async operations
- **ExpenseTimeline** - Timeline view for expense history

### Usage Example

```tsx
import {
  IncomeCardSpotlight,
  StatefulButton,
  AnimatedTooltip
} from '@/components/ui/aceternity'

// Card with spotlight effect
<IncomeCardSpotlight className="p-6">
  <h3>Total Income</h3>
  <p>$8,500</p>
</IncomeCardSpotlight>

// Button with loading state
<StatefulButton
  onClick={handleSave}
  loading={saving}
  loadingText="Saving..."
  successText="Saved!"
>
  Save Changes
</StatefulButton>
```

## Development Philosophy

This application prioritizes **simplicity and clarity** over feature complexity:

- **Single-page overview** rather than multiple screens
- **Monthly fixed costs** rather than detailed transaction tracking
- **Family-based sharing** rather than individual accounts
- **Visual clarity** rather than complex analytics
- **Quick updates** rather than detailed data entry

Focus on the core use case: families who want a clear monthly financial overview without the complexity of full expense tracking applications.

## Docker Compose Tips

- **To run any command inside docker compose, use `just exec`**

## Development Command Memory

- To start / restart the dev environment, use `just dev`