# Shoofly

A Next.js 16 marketplace platform with a role-based frontend shell. Supports three user roles: Client, Vendor, and Admin.

## Tech Stack

- **Framework**: Next.js 16.2.1 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **ORM**: Prisma v7 with PostgreSQL adapter (`@prisma/adapter-pg`)
- **Database**: PostgreSQL (Replit built-in)
- **Auth**: bcryptjs-based password hashing
- **Runtime**: Node.js 20

## Project Structure

```
app/               # Next.js app directory
  admin/           # Admin ops pages
  client/          # Client app pages
  vendor/          # Vendor app pages
  api/             # API routes
  generated/prisma # Auto-generated Prisma client (gitignored)
components/        # Shared React components
lib/               # Utilities: prisma client, auth, session, services
prisma/
  schema.prisma    # Database schema
  migrations/      # SQL migration files
  seed.ts          # Database seeder
public/            # Static assets
docs/              # Project documentation and audit reports
```

## Key Models

- **User** — roles: CLIENT, VENDOR, ADMIN
- **Category / VendorCategory** — service categories
- **Request** — client service requests with status flow
- **Bid / BidImage** — vendor bids on requests
- **DeliveryTracking** — delivery status updates
- **Transaction** — wallet/escrow transactions
- **Notification** — in-app notifications
- **WithdrawalRequest** — vendor withdrawal requests
- **PlatformSetting** — commission and radius config

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (set by Replit database) |

## Development

```bash
npm run dev      # Start dev server on port 5000
npm run build    # Production build
npm run start    # Start production server
npm run seed     # Seed the database
```

## Deployment

- **Type**: Autoscale
- **Build**: `npm run build`
- **Run**: `npm run start`
- Port: 5000

## Architecture Notes

- Prisma client is generated to `app/generated/prisma/` and gitignored
- `prisma.config.ts` configures the migrations path and seed command
- `lib/prisma.ts` creates a singleton Prisma client using the pg pool adapter
- Next.js dev server runs on `0.0.0.0:5000` for Replit proxy compatibility
