# Phase A Setup Guide

## What's Been Implemented

Phase A (Basic Chat) is now complete:
- ✅ Server-side API routes for model discovery and streaming chat
- ✅ Real-time streaming responses via Vercel AI SDK
- ✅ Stop generation capability
- ✅ Loading and error states
- ✅ Dynamic model list from 9Router
- ✅ All secrets kept server-side (never exposed to browser)

The original AKII AI design has been fully preserved.

## Installation Steps

### 1. Install Dependencies

```bash
npm install
npm install ai @ai-sdk/openai zod
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```bash
# 9Router Configuration (server-side only)
NINE_ROUTER_BASE_URL=https://rf3wulm.abc-tunnel.us/v1
NINE_ROUTER_API_KEY=your-actual-api-key-here
```

**Important**: 
- Replace `your-actual-api-key-here` with your real 9Router API key
- Never commit `.env.local` to git (it's already in `.gitignore`)
- For Vercel deployment, add these as Environment Variables in project settings

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing the Connection

1. **Model Discovery**: Open Settings - you should see the model count if connected
2. **Chat**: Send a message - it should stream a real response from your 9Router
3. **Stop Generation**: Click the stop button while a response is streaming
4. **Error Handling**: If misconfigured, you'll see clear error messages

## What Works Now

- ✅ Real AI responses via 9Router
- ✅ Streaming text generation
- ✅ Dynamic model list from your gateway
- ✅ Stop generation mid-stream
- ✅ Error messages for configuration issues
- ✅ All original UI design preserved

## What's Still Mock Data

- ⚠️ Conversation history (not persisted to database)
- ⚠️ Switching between old chats (shows notice)
- ⚠️ File attachments (coming in Phase C)
- ⚠️ Research/Code modes with tools (coming in Phase D)

## Troubleshooting

### "Server configuration missing"
- Check that `.env.local` exists with both variables set
- Restart the dev server after creating/editing `.env.local`

### "Failed to fetch models"
- Verify your `NINE_ROUTER_BASE_URL` is correct
- Verify your `NINE_ROUTER_API_KEY` is valid
- Check that your 9Router is running and accessible
- Test the endpoint: `curl -H "Authorization: Bearer YOUR_KEY" https://your-router/v1/models`

### Models show but chat fails
- Your 9Router might not support the selected model
- Check browser console and server logs for details
- Try a different model from the dropdown

## Next Steps: Phase B

Phase B will add:
- Authentication
- PostgreSQL database
- Persistent conversations
- Message history
- Create/rename/delete conversations

See README.md for the full roadmap.

## Build Verification

Before deploying, always run:

```bash
npm run lint
npm run build
```

Fix any TypeScript or build errors before proceeding.
