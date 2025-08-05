# Developer Experience Guide

## Prerequisites

- Docker & Docker Compose
- Just (command runner) - Install with `brew install just` or `cargo install just`
- Node.js 20+ (for local development without Docker)
- Git

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd family-budget-app

# Start the development environment
just dev

# The app will be available at http://localhost:3000
```

## Development Setup

### Using Docker Compose (Recommended)

The project uses Docker Compose for a consistent development environment.

```bash
# Start all services (app, database, etc.)
just dev

# Stop all services
just down

# View logs
just logs

# Restart services
just restart
```

### Local Development (Alternative)

If you prefer running the app locally:

```bash
# Install dependencies
just install

# Set up the database
just db-setup

# Run database migrations
just db-migrate

# Start the development server
just local-dev
```

## Project Structure

```
family-budget-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/           # Authentication pages
│   └── (dashboard)/      # Main app pages
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
│   ├── db.ts             # Database client
│   └── auth.ts           # Authentication helpers
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── Dockerfile            # Multi-stage Dockerfile (dev & prod)
├── scripts/              # Utility scripts
├── .env.example          # Environment variables template
├── docker-compose.yml    # Docker Compose configuration
├── justfile             # Task automation
└── fly.toml             # Fly.io deployment config
```

## Available Commands

The streamlined `justfile` focuses on essential development commands:

### Quick Start

```bash
just setup            # First-time setup (creates .env, starts services, seeds db)
just fresh            # Clean start (removes everything and starts fresh)
```

### Daily Development

```bash
just dev              # Start development environment
just down             # Stop all services
just logs             # View logs (follow mode)
just restart-app      # Restart app after code changes
just shell            # Access app container for debugging
```

### Database

```bash
just db-setup         # Run migrations and seed database
just db-reset         # Reset database (fresh start)
just db-studio        # Open Prisma Studio (database GUI)
```

### Code Quality

```bash
just check            # Run linter and type checking
just format           # Format code with Prettier
```

### Deployment

```bash
just build            # Build production Docker image
just deploy           # Deploy to Fly.io
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/family_budget"

# Authentication
AUTH_SECRET="your-secret-key-here"
AUTH_URL="http://localhost:3000"

# AI Features (optional)
OPENAI_API_KEY="your-openai-key"

# Storage (for backups)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
S3_BUCKET="family-budget-backups"
```

## Docker Compose Services

The `docker-compose.yml` defines these services:

```yaml
services:
  app:    # Next.js application (development mode)
  db:     # PostgreSQL database
```

For production, build and run the Docker image directly:
```bash
just build  # Builds production image
just prod   # Runs production container
```

## Development Workflow

### 1. Making Changes

```bash
# Create a new feature branch
git checkout -b feature/your-feature

# Start development environment
just dev

# Make your changes...

# Run quality checks
just quality

# Commit changes
git add .
git commit -m "feat: your feature description"
```

### 2. Database Changes

When modifying the database schema:

```bash
# Edit prisma/schema.prisma

# Create migration
just db-migrate-create "add_budget_notes"

# Apply migration
just db-migrate

# Generate Prisma client
just db-generate
```

### 3. Testing

```bash
# Run tests before pushing
just test

# Run specific test file
just test-file "app/api/budgets/route.test.ts"
```

## Debugging

### Viewing Logs

```bash
# All services
just logs

# Specific service
docker compose logs -f app
docker compose logs -f db
```

### Database Issues

```bash
# Check database connection
just db-shell
\l  # List databases
\dt # List tables

# Reset if needed
just db-reset
just db-migrate
just db-seed
```

### Container Issues

```bash
# Rebuild containers
just rebuild

# Clean everything and start fresh
just clean
just dev
```

## Production Deployment

### Deploy to Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Authenticate: `fly auth login`
3. Deploy:

```bash
# First time setup
fly launch

# Subsequent deploys
just deploy

# Deploy to preview
just deploy-preview
```

### Environment Configuration

Set production secrets:

```bash
fly secrets set AUTH_SECRET="your-production-secret"
fly secrets set DATABASE_URL="your-production-db-url"
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   just down
   docker compose down -v
   just dev
   ```

2. **Database connection errors**
   ```bash
   just db-reset
   just db-migrate
   ```

3. **Dependencies out of sync**
   ```bash
   just rebuild
   ```

4. **Clean start**
   ```bash
   just clean
   just install
   just dev
   ```

## Best Practices

1. **Always use Just commands** - They ensure consistency
2. **Run quality checks before committing** - `just quality`
3. **Use Docker for development** - Ensures environment parity
4. **Keep migrations small** - Easier to review and rollback
5. **Test database changes locally** - Use `just db-reset` liberally

## Getting Help

- Check logs first: `just logs`
- Run diagnostics: `just doctor`
- See all commands: `just --list`
- Project documentation: See README.md

## VSCode Setup

Recommended extensions:
- Docker
- Prisma
- ESLint
- Prettier
- Tailwind CSS IntelliSense

Settings (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```