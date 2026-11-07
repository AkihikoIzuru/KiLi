# KiLi Assistant

A calm, personal AI workspace powered by your models.

## 🎯 Features

- ✅ **Real-time Streaming Chat** - Direct integration with 9Router gateway
- ✅ **Multi-user Support** - Secure authentication and user isolation
- ✅ **Persistent Conversations** - All chats saved to database
- ✅ **Dynamic Model Selection** - Auto-load models from your gateway
- ✅ **Beautiful UI** - Custom design system with dark/light theme
- ✅ **Mobile Responsive** - Works perfectly on all devices

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS v4 + custom design system
- **Database:** PostgreSQL (Supabase)
- **Auth:** NextAuth.js v5
- **ORM:** Prisma
- **Icons:** Lucide React
- **Deployment:** Vercel

## 📦 Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier)
- 9Router gateway running

### Installation

```bash
# Clone repository
git clone https://github.com/AkihikoIzuru/KiLi.git
cd KiLi

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your actual values

# Initialize database
npm run db:generate
npm run db:push

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create `.env.local` with:

```env
# 9Router Configuration
NINE_ROUTER_BASE_URL=https://your-router.com/v1
NINE_ROUTER_API_KEY=your-api-key

# Database (Supabase)
POSTGRES_URL="postgresql://..."
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

### Get Supabase Credentials

1. Create project at [supabase.com](https://supabase.com)
2. Go to Settings → Database → Connection String
3. Copy "Transaction" mode connection string
4. Update `POSTGRES_*` variables in `.env.local`

### Generate NextAuth Secret

```bash
openssl rand -base64 32
```

## 📚 Documentation

- **Setup Guide:** [PHASE_B_INSTALL.md](./PHASE_B_INSTALL.md)
- **Implementation Status:** [STATUS.md](./STATUS.md)
- **Complete Guide:** [PHASE_B_COMPLETE.md](./PHASE_B_COMPLETE.md)

## 🗂️ Project Structure

```
src/
├── app/
│   ├── api/              # Server-side API routes
│   ├── layout.tsx        # Root layout with SessionProvider
│   ├── page.tsx          # Main chat interface
│   └── globals.css       # Design system
├── components/
│   └── auth-modal.tsx    # Login/register modal
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Database client
│   └── types.ts          # TypeScript types
└── prisma/
    └── schema.prisma     # Database schema
```

## 🚀 Deployment

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel --prod
```

## 📊 Roadmap

- [x] **Phase A:** Basic streaming chat
- [x] **Phase B:** Authentication & persistence
- [ ] **Phase C:** File attachments & rich content
- [ ] **Phase D:** Agent runtime with tools
- [ ] **Phase E:** Production hardening

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Design inspired by modern AI chat interfaces
- Powered by [9Router](https://github.com/your-router) for model gateway
- Built with [Next.js](https://nextjs.org/) and [Vercel](https://vercel.com/)

---

**KiLi Assistant** - Your AI companion, powered by your models 🤖✨
