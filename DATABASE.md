# Database Architecture

## Overview

The Family Budget App uses **PostgreSQL** as its primary database with **Prisma ORM** for database access.

## Why PostgreSQL?

We chose PostgreSQL over SQLite for several reasons:

1. **Concurrent Access**: Multiple users can read/write simultaneously
2. **Rich Data Types**: Native support for JSON, arrays, and decimal types
3. **Better Performance**: Optimized for web applications
4. **Scalability**: Can handle growth from family to multi-family use
5. **Deployment**: Well-supported on all cloud platforms

## Database Stack

- **PostgreSQL 16**: Primary database
- **Prisma ORM**: Type-safe database client
- **Docker**: Consistent development environment
- **Fly.io Postgres**: Managed production database

## Prisma Benefits

Prisma provides excellent developer experience:

- **Type Safety**: Generated TypeScript types from schema
- **Migrations**: Version-controlled schema changes
- **Studio**: GUI for viewing and editing data
- **Query Builder**: Intuitive and type-safe queries

## Development Setup

```bash
# Start PostgreSQL via Docker
just dev

# Run migrations
just db-migrate

# Seed database
just db-seed

# Open Prisma Studio
just db-studio
```

## Production Deployment

For production on Fly.io:

```bash
# Create Fly.io Postgres cluster
fly postgres create

# Get connection string
fly postgres attach --app family-budget

# Set as secret
fly secrets set DATABASE_URL="<connection-string>"
```

## Backup Strategy

1. **Development**: Local PostgreSQL dumps

   ```bash
   just db-backup
   ```

2. **Production**: Fly.io automated backups
   - Daily snapshots
   - Point-in-time recovery
   - Cross-region replication (optional)

## Schema Management

All schema changes go through Prisma migrations:

```bash
# Create migration
just db-migrate-create "add_user_preferences"

# Apply migration
just db-migrate

# Reset database (dev only)
just db-reset
```

## Connection Management

Prisma handles connection pooling automatically:

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

// Singleton pattern for development
export const db = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db
}
```

## Performance Considerations

1. **Indexes**: Added on frequently queried fields
2. **Connection Pooling**: Handled by Prisma
3. **Query Optimization**: Use Prisma's `include` and `select`
4. **Caching**: Consider Redis for frequently accessed data

## SQLite vs PostgreSQL

While SQLite with Litestream is simpler, PostgreSQL is better for our use case:

| Feature           | SQLite  | PostgreSQL   |
| ----------------- | ------- | ------------ |
| Setup             | Simpler | Docker/Cloud |
| Concurrent Users  | Limited | Excellent    |
| Data Types        | Basic   | Rich         |
| Full-Text Search  | Basic   | Advanced     |
| JSON Support      | Limited | Native       |
| Decimal Precision | Limited | Excellent    |

## Future Considerations

- **Read Replicas**: For scaling read operations
- **Connection Pooler**: PgBouncer for high traffic
- **Caching Layer**: Redis for performance
- **Time-Series Data**: Consider TimescaleDB extension
