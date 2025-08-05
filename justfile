# Family Budget App - Essential Commands

# Show available commands (default)
default:
    @just --list

# Development
# -----------

# Start development environment
dev:
    docker compose up -d
    @echo "🚀 App running at http://localhost:3000"
    @echo "📊 Database at localhost:5432"

# Stop all services  
down:
    docker compose down

# View logs (follow mode)
logs:
    docker compose logs -f

# Restart app container (useful after code changes)
restart-app:
    docker compose restart app

# Access app shell for debugging
shell:
    docker compose exec app sh

# Database
# --------

# Run migrations and seed database
db-setup:
    docker compose exec app npx prisma migrate dev --name initial
    docker compose exec app npx prisma db seed
    @echo "✅ Database ready with sample data!"

# Reset database (fresh start)
db-reset:
    docker compose exec app npx prisma migrate reset --force

# Open Prisma Studio (database GUI)
db-studio:
    docker compose exec app npx prisma studio

# Quick Setup
# -----------

# First time setup (create .env, start services, setup db)
setup:
    @if [ ! -f .env ]; then cp .env.example .env; echo "📝 Created .env file"; fi
    docker compose up -d
    @sleep 5  # Wait for services
    @just db-setup
    @echo "✅ Development environment ready!"
    @echo "👉 Visit http://localhost:3000"

# Clean start (remove everything and start fresh)
fresh:
    docker compose down -v
    rm -rf node_modules .next
    @just setup

# Utilities
# ---------

# Check code quality
check:
    docker compose exec app npm run lint
    docker compose exec app npm run typecheck

# Format code
format:
    docker compose exec app npm run format

# Build for production
build:
    docker build --target prod -t family-budget-app:latest .

# Deploy to Fly.io
deploy:
    fly deploy