# Shoofly EGY

Next.js + Prisma + PostgreSQL application.

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL 14+ (local or remote)

## Environment Setup

1. Copy `.env.example` to `.env`.
2. Update values in `.env`:
   - `DATABASE_URL`
   - `JWT_SECRET`

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/shoofly?schema=public"
JWT_SECRET="replace-with-a-strong-random-secret"
```

## Database and Prisma

Run these commands in order:

```bash
npm ci
npm run db:check
npm run db:migrate
npm run db:seed
```

Or run all in one command:

```bash
npm run setup:db
```

Useful commands:

```bash
npm run prisma:studio
npm run db:reset
```

## Run App

```bash
npm run dev
```

App runs on `http://localhost:5000`.

## Validation

```bash
npm run build
npm run test
```
