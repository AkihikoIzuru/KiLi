# Phase B Installation Guide

## 🎯 Phase B: Adding Database & Authentication

Phase B adds persistent conversations and user authentication to AKII AI.

## 📋 Prerequisites

- Phase A completed and working
- Node.js installed
- Access to Vercel (for Postgres database) OR local PostgreSQL

## 🚀 Installation Steps

### 1. Install New Dependencies

```bash
npm install
```

New packages added:
- `@prisma/client` - Database ORM
- `prisma` - Database toolkit
- `next-auth` - Authentication
- `@auth/prisma-adapter` - NextAuth Prisma integration
- `bcryptjs` - Password hashing
- `@vercel/postgres` - Vercel Postgres client

### 2. Setup Database (Option A: Vercel Postgres)

#### a) Create Vercel Postgres Database

1. Go to [vercel.com](https://vercel.com)
2. Dashboard → Storage → Create Database
3. Select "Postgres"
4. Choose region closest to you
5. Copy connection strings

#### b) Update `.env.local`

Add these from Vercel dashboard:

```env
# Existing 9Router config...
NINE_ROUTER_BASE_URL=https://rf3wulm.abc-tunnel.us/v1
NINE_ROUTER_API_KEY=sk-2cfab90452cc5b73-ladahs-27eb12b9

# New: Database URLs (from Vercel)
POSTGRES_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb"
POSTGRES_PRISMA_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb"

# New: NextAuth Secret
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="generate-a-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

#### c) Generate Prisma Client

```bash
npm run db:generate
```

#### d) Push Database Schema

```bash
npm run db:push
```

You should see: ✔ Database schema created

### 3. Setup Database (Option B: Local PostgreSQL)

If you prefer local development:

```bash
# Install PostgreSQL (if not installed)
# Windows: Download from postgresql.org
# Mac: brew install postgresql
# Linux: sudo apt-get install postgresql

# Start PostgreSQL service

# Update .env.local
POSTGRES_URL="postgresql://postgres:password@localhost:5432/akii_ai"
POSTGRES_PRISMA_URL="postgresql://postgres:password@localhost:5432/akii_ai"
POSTGRES_URL_NON_POOLING="postgresql://postgres:password@localhost:5432/akii_ai"
```

Then run migrations:
```bash
npm run db:push
```

### 4. Generate NextAuth Secret

```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Add result to `NEXTAUTH_SECRET` in `.env.local`

### 5. Run Development Server

```bash
npm run dev
```

### 6. Test Database Connection

Optional - open Prisma Studio to view database:

```bash
npm run db:studio
```

Opens at http://localhost:5555

## ✅ Verification Checklist

After installation:

- [ ] `npm run dev` starts without errors
- [ ] No Prisma connection errors in terminal
- [ ] Can register new user (will add UI next)
- [ ] Database tables created (check Prisma Studio)

## 🗃️ Database Schema

Tables created:

### Users & Auth
- `User` - User accounts
- `Account` - OAuth accounts
- `Session` - User sessions
- `VerificationToken` - Email verification

### AKII AI Data
- `Conversation` - Chat conversations
- `Message` - Individual messages

## 📝 New API Endpoints

### Auth
- `POST /api/register` - Register new user
- `POST /api/auth/signin` - Login (NextAuth)
- `POST /api/auth/signout` - Logout (NextAuth)

### Conversations
- `GET /api/conversations` - List user's conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation with messages
- `PATCH /api/conversations/:id` - Rename conversation
- `DELETE /api/conversations/:id` - Delete conversation

All endpoints require authentication (except register).

## 🔧 Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Create migration (production)
npm run db:studio    # Open Prisma Studio
```

## 🐛 Troubleshooting

### "Can't reach database server"
- Check POSTGRES_URL is correct
- Verify database is running
- Check firewall/network settings

### "Prisma Client not generated"
```bash
npm run db:generate
```

### "NextAuth secret is not set"
- Generate secret: `openssl rand -base64 32`
- Add to .env.local as NEXTAUTH_SECRET

### "Migration failed"
- Delete `prisma/migrations` folder
- Run `npm run db:push` instead

## ⏭️ Next Steps

After successful installation:

1. **Add Login/Register UI** (coming next)
2. **Update chat to save messages**
3. **Update sidebar to load real conversations**
4. **Add rename/delete functionality**
5. **Test full flow**

See `PHASE_B_PLAN.md` for complete implementation plan.

---

**Phase B: Database & Auth - Setup Complete** ✅
