# Family Budget App

A streamlined family budget overview tool for tracking monthly income and fixed expenses. Built with Next.js, PostgreSQL, and Prisma.

[![Deploy to Fly.io](https://fly.io/deploy-button.svg)](https://fly.io/deploy?repo=https://github.com/arsfeld/family-budget-app)

## Features

- 🏠 Family-centric multi-user system
- 💰 Multiple budget scenarios
- 📊 Single-page dashboard
- 🔒 Secure authentication with NextAuth.js
- 📱 Mobile-responsive design
- 🖨️ Print-friendly layouts

## Tech Stack

- **Frontend/Backend**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with shadcn/ui
- **Development**: Docker Compose, Just task runner

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd family-budget-app

# Install Just (if not already installed)
# macOS: brew install just
# Linux: cargo install just

# One-command setup
just setup
```

The app will be available at http://localhost:3000 with sample data!

## 📋 Prerequisites

- Docker & Docker Compose
- Just (command runner)
- Node.js 20+ (optional, for local development)
- Fly CLI (for deployment)

## 🛠️ Development

### Essential Commands

```bash
# View all available commands
just

# Development
just dev          # Start services
just down         # Stop services
just logs         # View logs
just restart-app  # Restart after code changes

# Database
just db-setup     # Run migrations & seed
just db-reset     # Fresh database
just db-studio    # Open database GUI

# Quick setup
just setup        # First time setup
just fresh        # Clean everything & start fresh

# Code quality
just check        # Lint & typecheck
just format       # Format code
```

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with family-based auth
- **Styling**: Tailwind CSS
- **AI**: TensorFlow.js for local inference

## 📁 Project Structure

```
family-budget-app/
├── app/                # Next.js app directory
├── components/         # React components
├── lib/               # Utilities and configs
├── prisma/            # Database schema
├── docker/            # Docker configurations
├── public/            # Static assets
└── justfile           # Task automation
```

## 🚢 Deployment

### Deploy to Fly.io

```bash
# First time
fly launch

# Subsequent deploys
just deploy

# Deploy preview
just deploy-preview
```

### Production Environment

```bash
# Build production image
just build

# Run production locally
just prod

# View production logs
just prod-logs
```

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available options:

- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: Authentication secret key
- `OPENAI_API_KEY`: Optional, for AI features

### Docker Services

- `app`: Next.js application
- `db`: PostgreSQL database
- `redis`: Optional caching layer
- `adminer`: Optional database GUI

## 📚 Documentation

- [Developer Experience Guide](./DX_GUIDE.md) - Detailed development instructions
- [Technical Roadmap](./TECHNICAL_ROADMAP.md) - Architecture and implementation details
- [Product Documentation](./PRODUCT.md) - Feature specifications

## 🧪 Testing

```bash
# Run all tests
just test

# Run in watch mode
just test-watch

# Run specific test
just test-file "app/api/budgets/route.test.ts"
```

## 🐛 Troubleshooting

```bash
# Check system dependencies
just doctor

# Reset database
just db-reset

# Clean and rebuild
just clean
just rebuild
```

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Run quality checks: `just pre-commit`
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
