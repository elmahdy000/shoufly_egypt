# 🚀 Running Shoofly Application

## Quick Start

### Option 1: Using npm (Recommended)
```bash
npm run dev
```

The application will start on **http://localhost:5000** with the server running on **http://0.0.0.0:5000**

### Option 2: Using batch script (Windows)
```bash
start-dev.bat
```

### Option 3: Build and start production
```bash
npm run build
npm start
```

---

## Prerequisites

✅ **Node.js 20+**
```bash
node --version
```

✅ **PostgreSQL 14+** (running on localhost:5432)
```bash
psql --version
```

✅ **Environment variables** (.env configured)
```bash
cat .env | head -5
```

---

## Database Setup

### First Time Setup

1. **Reset database with seed data**:
```bash
npm run db:reset
```

This will:
- ✅ Run migrations
- ✅ Seed test data (users, categories, brands, etc.)
- ✅ Create 11 test users with login credentials

2. **Verify database**:
```bash
npm run prisma:studio
```

Opens Prisma Studio on http://localhost:5555

### Test Credentials

After running `npm run db:reset`, login with:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shoofly.com | password123 |
| Client | client1@shoofly.com | password123 |
| Vendor | vendor1@shoofly.com | password123 |
| Delivery | delivery1@shoofly.com | password123 |

---

## Development Server

### Starting the Server

```bash
npm run dev
```

**Output** (when successful):
```
⚡ Ready in 2.5s
► Local:    http://localhost:5000
► Network:  http://0.0.0.0:5000
```

### Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| **App** | http://localhost:5000 | Main application |
| **Prisma Studio** | http://localhost:5555 | Database GUI (separate command) |
| **API** | http://localhost:5000/api | API endpoints |

### API Examples

```bash
# Health check
curl http://localhost:5000/api/health

# Get categories
curl http://localhost:5000/api/categories

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client1@shoofly.com","password":"password123"}'
```

---

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (port 5000) |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Run database seed |
| `npm run db:reset` | Reset + migrate + seed (full setup) |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm test` | Run all tests |
| `npm run test:e2e` | Run Playwright E2E tests |

---

## Environment Configuration

### Required Variables (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/shoofly

# Session/Auth (min 32 characters)
SESSION_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_SECRET=your-jwt-secret-key

# Optional: Redis for production rate limiting
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional: Payment gateways
PAYMOB_API_KEY=your_key
FAWRY_MERCHANT_CODE=your_code

# Environment
NODE_ENV=development
```

### Optional Variables

```env
# Allow JWT auth via X-Session-Token header (dev only)
ALLOW_HEADER_AUTH=true

# Redis configuration
REDIS_PASSWORD=optional_password
REDIS_DB=0
```

---

## Troubleshooting

### Port Already in Use
```bash
# Change port in next.config.ts or use different port:
npm run dev -- -p 3000
```

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432

Solution:
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env
3. Verify database exists: createdb shoofly
```

### Redis Connection Error
```
⚠️ Redis unreachable, using in-memory fallback

Solution:
- Optional for development (auto-fallback works)
- For production: start Redis server
- Or: set REDIS_HOST to valid server
```

### Node Modules Missing
```bash
npm install
```

### Build Error: Module not found
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

---

## Development Tips

### Hot Reload
- Changes to `.ts/.tsx/.css` files auto-reload
- No need to restart server
- Database changes require manual check

### Database Changes
1. Modify `prisma/schema.prisma`
2. Run: `npm run db:migrate` (creates migration)
3. Auto-synced to local database

### Debugging
```bash
# Enable verbose logging
DEBUG=* npm run dev
```

### Testing
```bash
# Run all tests
npm test

# Run specific test
npm run test:client

# E2E testing with UI
npm run test:e2e:ui
```

---

## Status Check

Verify everything is working:

```bash
# 1. Check Node.js
node --version

# 2. Check npm
npm --version

# 3. Check database
npm run db:check

# 4. Setup database
npm run db:reset

# 5. Start server
npm run dev

# 6. Test API
curl http://localhost:5000/api/health
```

---

## Next Steps

After starting the server:

1. ✅ **Open browser**: http://localhost:5000
2. ✅ **Login**: Use test credentials above
3. ✅ **Check database**: `npm run prisma:studio`
4. ✅ **Start developing**: Edit files in `/app` and `/lib`
5. ✅ **Test API**: Use Postman or `shoofly-postman-collection.json`

---

## Documentation

- **Backend Analysis**: See [detailed report](SEEDING_FIXED.md)
- **Database Seeding**: See [SEEDING_IMPLEMENTATION_SUMMARY.md](SEEDING_IMPLEMENTATION_SUMMARY.md)
- **Build Errors**: See [BUILD_FIX_REDIS.md](BUILD_FIX_REDIS.md)
- **API Endpoints**: Check `/app/api/` directory

---

## Support

If you encounter issues:

1. Check `.env` configuration
2. Verify PostgreSQL is running
3. Run `npm run db:reset` for clean state
4. Check build output for errors
5. Review logs in browser console

---

**Ready to develop! 🎉**

The application is designed to support:
- ✅ Multi-role system (Client, Vendor, Admin, Delivery)
- ✅ Request marketplace with bidding
- ✅ Payment processing (Paymob, Fawry)
- ✅ Real-time notifications
- ✅ GPS-based delivery tracking
- ✅ Financial management & withdrawals

Happy coding! 🚀
