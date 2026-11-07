# Phase B Implementation Plan

## 🎯 Goal: Conversations and Persistence

Make conversations survive page reloads, add user accounts, and enable conversation management.

## 📋 Phase B Checklist

### 1. Database Setup
- [ ] Choose database (PostgreSQL recommended)
- [ ] Setup database provider (Vercel Postgres / Supabase / local)
- [ ] Create schema (users, conversations, messages)
- [ ] Setup Prisma ORM
- [ ] Create migrations

### 2. Authentication
- [ ] Choose auth provider (NextAuth.js v5 / Clerk / Supabase Auth)
- [ ] Setup auth routes
- [ ] Add login/signup UI
- [ ] Protect API routes
- [ ] Add session management

### 3. Conversation CRUD
- [ ] `POST /api/conversations` - Create new conversation
- [ ] `GET /api/conversations` - List user's conversations
- [ ] `GET /api/conversations/:id` - Get conversation with messages
- [ ] `PATCH /api/conversations/:id` - Rename conversation
- [ ] `DELETE /api/conversations/:id` - Delete conversation

### 4. Message Persistence
- [ ] Save user messages to database
- [ ] Save assistant responses to database
- [ ] Load message history when switching conversations
- [ ] Update chat endpoint to save streaming responses

### 5. Frontend Integration
- [ ] Update new chat to create DB record
- [ ] Update chat list to load from API
- [ ] Update message loading to fetch from DB
- [ ] Add rename conversation UI
- [ ] Add delete conversation confirmation
- [ ] Update search to query database

## 🛠️ Tech Stack Recommendation

### Option A: Vercel Stack (Recommended)
```
Database: Vercel Postgres (PostgreSQL)
ORM: Prisma
Auth: NextAuth.js v5 (Auth.js)
Deployment: Vercel
```

**Pros:**
- Seamless Vercel integration
- Free tier available
- Good DX with Prisma
- NextAuth well-documented

**Cons:**
- Vendor lock-in to Vercel
- Need to manage auth yourself

### Option B: Supabase Stack
```
Database: Supabase PostgreSQL
ORM: Prisma or Supabase client
Auth: Supabase Auth
Deployment: Vercel (frontend)
```

**Pros:**
- All-in-one solution
- Built-in auth
- Real-time capabilities
- Generous free tier

**Cons:**
- Another service to manage
- Learning curve for Supabase APIs

### Option C: Local Development First
```
Database: PostgreSQL (Docker)
ORM: Prisma
Auth: NextAuth.js v5
Deployment: TBD
```

**Pros:**
- Full control
- No external dependencies during dev
- Easy to migrate later

**Cons:**
- Need Docker setup
- More initial setup

## 📊 Database Schema (Draft)

```prisma
// schema.prisma

model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  image         String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  conversations Conversation[]
}

model Conversation {
  id        String    @id @default(cuid())
  title     String
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([userId, updatedAt])
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String       // "user" or "assistant"
  content        String       @db.Text
  model          String?      // which model generated this (for assistant messages)
  createdAt      DateTime     @default(now())

  @@index([conversationId, createdAt])
}
```

## 🚀 Implementation Order

### Step 1: Database Setup (1-2 hours)
1. Choose provider (recommend Vercel Postgres for simplicity)
2. Install Prisma
3. Create schema
4. Run migrations
5. Test connection

### Step 2: Auth Setup (2-3 hours)
1. Install NextAuth.js v5
2. Setup auth routes
3. Add login UI (modal or separate page)
4. Test auth flow
5. Protect API routes with middleware

### Step 3: Backend CRUD (2-3 hours)
1. Create conversation endpoints
2. Update chat endpoint to save messages
3. Add pagination for message loading
4. Add user validation to all endpoints
5. Test with Postman/Thunder Client

### Step 4: Frontend Integration (3-4 hours)
1. Update sidebar to load real conversations
2. Update chat view to load/save messages
3. Add rename functionality
4. Add delete with confirmation
5. Update search to use backend
6. Handle loading/error states

### Step 5: Testing & Polish (1-2 hours)
1. Test all flows
2. Fix edge cases
3. Update documentation
4. Create migration guide from Phase A

## 🔐 Security Considerations

- [ ] All database queries scoped to authenticated user
- [ ] SQL injection prevention (Prisma handles this)
- [ ] Rate limiting on conversation creation
- [ ] Message content validation
- [ ] Conversation ownership verification
- [ ] Secure session storage

## 📝 UI Changes Needed

### Login Screen
- Modal over app or separate page?
- Email/password or OAuth?
- "Continue as guest" option?

### Sidebar Updates
- Real conversation loading
- Skeleton loaders
- Empty state
- Error state
- Delete confirmation modal
- Rename inline edit

### Chat Updates
- Load message history on conversation switch
- Show loading while fetching
- Handle empty conversations
- Persist streaming responses

## ⚠️ Breaking Changes from Phase A

- New chat now creates DB record
- Messages are persisted immediately
- Switching conversations loads from DB
- No more mock data in sidebar
- Auth required (or add guest mode)

## 🤔 Decisions Needed

### 1. Auth Strategy
**Question:** Require login immediately, or allow guest mode?

**Option A: Login Required**
- Pros: Simpler, no guest data migration, secure by default
- Cons: Friction for first-time users

**Option B: Guest Mode + Optional Login**
- Pros: Try before commit, better onboarding
- Cons: Complex guest→user migration, localStorage limits

**Recommendation:** Start with login required, add guest mode in Phase E if needed.

### 2. Database Provider
**Question:** Which provider?

**Recommendation:** Vercel Postgres for this project because:
- Already deploying to Vercel
- Free tier sufficient
- Simple setup
- Good Prisma integration

### 3. Title Generation
**Question:** How to create conversation titles?

**Options:**
- A: Use first user message (truncated)
- B: AI-generated title from first message
- C: Let user set title manually
- D: "Untitled conversation" + date

**Recommendation:** Start with A (first message truncated), add AI generation later.

## 📦 New Dependencies Needed

```json
{
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "next-auth": "^5.0.0-beta.22",
    "@auth/prisma-adapter": "^2.0.0",
    "bcrypt": "^5.1.1"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "@types/bcrypt": "^5.0.0"
  }
}
```

## 🎯 Definition of Done (Phase B)

Phase B is complete when:
- [x] User can login/logout
- [x] Conversations persist across page reloads
- [x] Message history loads correctly
- [x] New chat creates DB record
- [x] Rename conversation works
- [x] Delete conversation works
- [x] All queries scoped to user
- [x] No mock data in production
- [x] Build succeeds
- [x] Design still preserved

## 📚 Next Steps

Ready to implement? Here's what we'll do:

1. **Confirm approach**: Which database provider?
2. **Setup Prisma**: Install and configure
3. **Create schema**: Define tables
4. **Setup auth**: NextAuth.js v5
5. **Build endpoints**: CRUD operations
6. **Update frontend**: Real data integration

Let me know if you want to:
- A) Start with Vercel Postgres + NextAuth (recommended)
- B) Use Supabase all-in-one
- C) Local PostgreSQL first
- D) Different approach

---

**Ready to continue with Phase B?** 🚀
