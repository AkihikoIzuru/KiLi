# Instalasi Phase A - Quick Start

## ✅ Perubahan yang Sudah Selesai

1. **API Routes** - Server-side streaming chat dan model discovery
2. **Frontend** - Manual streaming implementation untuk AI SDK v7
3. **TypeScript** - Type definitions dan error handling
4. **ESLint** - Config untuk Next.js 15 + ESLint 9

## 📦 Instalasi Dependencies

Jalankan command berikut:

```bash
# Install semua dependencies
npm install

# Install @eslint/eslintrc untuk ESLint compatibility
npm install --save-dev @eslint/eslintrc
```

## 🔐 Setup Environment Variables

Buat file `.env.local` di root project:

```bash
# 9Router Configuration (JANGAN COMMIT KE GIT!)
NINE_ROUTER_BASE_URL=https://rf3wulm.abc-tunnel.us/v1
NINE_ROUTER_API_KEY=masukkan-api-key-anda-disini
```

**Penting:** Ganti `masukkan-api-key-anda-disini` dengan API key 9Router yang sebenarnya.

## 🧪 Test Build

Verifikasi tidak ada error:

```bash
# Check linting
npm run lint

# Build production
npm run build
```

Jika sukses, tidak akan ada error TypeScript atau ESLint.

## 🚀 Run Development Server

```bash
npm run dev
```

Buka: http://localhost:3000

## ✨ Modul yang Digunakan (AI SDK v7)

```json
{
  "@ai-sdk/openai": "^4.0.110",  // Provider untuk 9Router
  "ai": "^7.0.164",               // AI SDK Core (streaming)
  "zod": "^4.6.7"                 // Validation
}
```

### Perubahan dari AI SDK v3 ke v7:

| Component | AI SDK v3 | AI SDK v7 (Sekarang) |
|-----------|-----------|----------------------|
| Import | `import { useChat } from "ai/react"` | Manual fetch + streaming |
| Provider | `openai.provider()` | `createOpenAI()` |
| State | `useChat` hook | Manual state management |
| Streaming | Automatic | Manual parsing |

## 🎯 Fitur yang Sudah Berjalan

- ✅ Streaming chat dari 9Router
- ✅ Dynamic model list dari gateway
- ✅ Stop generation (abort controller)
- ✅ Loading states dengan spinner
- ✅ Error handling lengkap
- ✅ Original AKII AI design preserved

## 🔍 Troubleshooting

### Error: "Server configuration missing"
```bash
# Pastikan .env.local ada dan berisi:
NINE_ROUTER_BASE_URL=https://...
NINE_ROUTER_API_KEY=sk-...

# Restart dev server setelah membuat/edit .env.local
```

### Error: ESLint config
```bash
# Install missing dependency:
npm install --save-dev @eslint/eslintrc

# Atau skip linting sementara:
npm run build -- --no-lint
```

### Error: Failed to fetch models
```bash
# Test 9Router connection:
curl -H "Authorization: Bearer YOUR_KEY" https://rf3wulm.abc-tunnel.us/v1/models

# Jika gagal, cek:
# 1. 9Router sedang berjalan?
# 2. Cloudflare Tunnel aktif?
# 3. API key benar?
```

## 📝 Testing Checklist

Setelah `npm run dev`, test:

1. [ ] Welcome screen muncul dengan 4 starter cards
2. [ ] Klik Settings - lihat jumlah models (jika connected)
3. [ ] Ketik pesan dan tekan Enter
4. [ ] Response streaming muncul dengan animasi
5. [ ] Klik tombol Stop saat streaming (icon berubah jadi Square)
6. [ ] Copy response button works
7. [ ] Dark/Light theme toggle works
8. [ ] Mobile responsive (resize browser)

## ⏭️ Next: Phase B

Phase B akan menambahkan:
- Authentication (login/register)
- PostgreSQL database
- Persistent conversations
- Message history
- CRUD conversations (create/rename/delete)

Lihat `README.md` untuk roadmap lengkap.
