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

## Mobile App (Flutter)

### Prerequisites for Mobile Development
- Flutter SDK 3.9.2+
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)
- VS Code with Flutter extension

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile/shoofly_client
```

2. Install dependencies:
```bash
flutter pub get
```

3. Run the app:
```bash
flutter run
```

### Mobile App Structure
- `lib/main.dart`: Main entry point with BLoC providers
- `lib/presentation/`: UI screens and widgets
- `../shoofly_core/`: Shared business logic package

### Testing Mobile App
```bash
flutter test
```

### Building for Production
```bash
# Android APK
flutter build apk --release

# iOS (on macOS)
flutter build ios --release
```

## Project Structure

```
shoofly-egy/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # Admin pages
│   ├── client/            # Client pages
│   ├── vendor/            # Vendor pages
│   ├── delivery/          # Delivery pages
│   └── page.tsx           # Landing page
├── components/            # Shared React components
├── lib/                   # Utility libraries
├── mobile/                # Flutter mobile app
│   ├── shoofly_client/   # Client mobile app
│   └── shoofly_core/     # Shared business logic
├── prisma/                # Database schema and migrations
└── tests/                 # Test files
```

## API Documentation

API endpoints are available under `/api/*`. Use tools like Postman or Thunder Client to test endpoints.

Key endpoints:
- `/api/auth/*`: Authentication
- `/api/client/*`: Client operations
- `/api/vendor/*`: Vendor operations
- `/api/delivery/*`: Delivery operations
- `/api/admin/*`: Admin operations

## Development Guidelines

- Use TypeScript strict mode
- Follow ESLint rules
- Write tests for new features
- Use Prisma Studio for database inspection
- Test both web and mobile apps
