# Quick Start Guide - TicTacMaster with Convex & Clerk

## 🚀 Setup Checklist

### 1. Install Dependencies
```bash
# Delete node_modules and lock file if you have install errors
rm -rf node_modules
rm bun.lock

# Install packages
bun install
```

### 2. Set Up Clerk Authentication
1. Go to https://clerk.com and sign up
2. Create a new application
3. Go to **JWT Templates** → **New template** → Select **Convex**
4. ⚠️ **DO NOT RENAME** the JWT template - it MUST be called "convex"
5. Copy the **Issuer URL** (e.g., `https://verb-noun-00.clerk.accounts.dev`)
6. Go to **API Keys** and copy:
   - Publishable Key (starts with `pk_test_...`)
   - Secret Key (starts with `sk_test_...`)

### 3. Set Up Convex Backend
```bash
# Run Convex setup (one-time)
npx convex dev
```

This will:
- Create a Convex account (if needed)
- Create a new project
- Give you a `CONVEX_URL` (e.g., `https://xxx.convex.cloud`)

### 4. Configure Environment Variables
Create/update `.env.local` with your keys:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_JWT_ISSUER_DOMAIN=https://verb-noun-00.clerk.accounts.dev
```

### 5. Add Environment Variable to Convex Dashboard
1. Go to your Convex Dashboard
2. Settings → Environment Variables
3. Add: `CLERK_JWT_ISSUER_DOMAIN` = `https://verb-noun-00.clerk.accounts.dev`

### 6. Start Development Servers

**Terminal 1 - Convex Backend:**
```bash
npx convex dev
```

**Terminal 2 - Next.js Frontend:**
```bash
bun run dev
```

### 7. Test It!
1. Open http://localhost:3000
2. Click "Sign Up" to create an account
3. Click "Create Game" to start a new game room
4. Copy the room code
5. Open a new incognito/private window
6. Sign in with a different account
7. Click "Join Game" and paste the room code
8. Play together in real-time! 🎮

## ✅ What Should Work

- ✅ Sign up / Sign in with Clerk
- ✅ Create game rooms
- ✅ Join games with room code
- ✅ Real-time gameplay (moves sync instantly)
- ✅ Real-time chat
- ✅ Leave/rematch games
- ✅ Multiple players (2-4)
- ✅ Different board sizes (3x3, 4x4, 5x5)

## 🐛 Troubleshooting

### "Not authenticated" errors
- Make sure you're signed in
- Check `CLERK_JWT_ISSUER_DOMAIN` in both `.env.local` AND Convex Dashboard
- Verify JWT template is named "convex" in Clerk

### "Missing NEXT_PUBLIC_CONVEX_URL"
- Make sure `.env.local` exists
- Restart both dev servers after adding env vars

### Game not updating in real-time
- Check that `npx convex dev` is running
- Check browser console for errors
- Make sure both players are signed in

### Bun install error with esbuild
```bash
# Delete and reinstall
rm -rf node_modules
rm bun.lock
bun install
```

If still fails, try:
```bash
npm install
```

## 📚 Documentation

- **Full Setup Guide**: `CONVEX_SETUP.md`
- **Migration Details**: `MIGRATION_COMPLETE.md`
- **Convex Docs**: https://docs.convex.dev
- **Clerk Docs**: https://clerk.com/docs

## 🎮 Game Features

### Implemented
- ✅ Real-time multiplayer (2-4 players)
- ✅ Multiple board sizes (3x3, 4x4, 5x5)
- ✅ In-game chat with profanity filter
- ✅ Room codes for private games
- ✅ Leaderboard tracking (wins, losses, draws, streaks)
- ✅ Rematch functionality
- ✅ Authentication with Clerk

### Backend Ready (Needs UI)
- 🔧 Tournaments
- 🔧 Matchmaking queue
- 🔧 Leaderboard page
- 🔧 Game history

### Coming Soon
- ⏳ AI opponent (single player)
- ⏳ Tournament UI
- ⏳ Matchmaking UI
- ⏳ Public game browser

## 🏗️ Architecture

```
Frontend (Next.js)
      ↓ ↑
   Convex Client
      ↓ ↑
Convex Backend (Real-time Database)
      ↓ ↑
   Clerk Auth
```

- **Frontend**: React/Next.js with TypeScript
- **Backend**: Convex (real-time database + functions)
- **Auth**: Clerk (JWT tokens)
- **Real-time**: WebSocket subscriptions (built into Convex)

## 💡 Tips

1. Keep `npx convex dev` running while developing
2. Convex auto-generates TypeScript types in `convex/_generated/`
3. Use `useQuery` for reading data (real-time)
4. Use `useMutation` for writing data
5. Always check authentication with `<Authenticated>` component

## 🆘 Need Help?

1. Check the error in browser console
2. Check Convex dashboard logs
3. Check that both dev servers are running
4. Verify environment variables are set correctly
5. Make sure you're signed in with Clerk

---

**Ready to play?** Start both servers and go to http://localhost:3000! 🎉