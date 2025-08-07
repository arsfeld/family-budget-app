#!/bin/sh
set -e

echo "Installing dependencies for development..."
# Always run npm ci to ensure node_modules match package-lock.json
npm install

echo "Generating Prisma client..."
npx prisma generate

# Run database migrations if needed
echo "Running database migrations..."
npx prisma migrate deploy || true

echo "Starting development server..."
exec "$@"