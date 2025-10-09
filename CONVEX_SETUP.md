# Convex & Clerk Setup Guide for TicTacMaster

This document explains the Convex and Clerk integration setup for the TicTacMaster project.

## ✅ What Has Been Done

### 1. Package Dependencies Added
- `convex`: ^1.17.7 - Real-time backend database
- `@clerk/nextjs`: ^6.14.7 - Authentication provider

### 2. Removed Dependencies
- `socket.io-client` - Replaced with Convex real-time subscriptions

### 3. Files Created

#### Convex Configuration
- `convex/auth.config.ts` - Clerk JWT authentication configuration
- `convex/tsconfig.json` - TypeScript config for Convex functions
- `convex/schema.ts` - Database schema (users, games, leaderboard)

#### Convex Functions
- `convex/users.ts` - User management (create, get, update)
- `convex/games.ts` - Game logic (create, join, move, get)
- `convex/leaderboard.ts` - Leaderboard queries and rankings

#### Components
- `components/convex-client-provider.tsx` - Convex provider with Clerk auth

#### Middleware
- `middleware.ts` - Clerk authentication middleware

#### Environment
- `.env.local` - Environment variables template

### 4. Files Updated
- `app/layout.tsx` - Added ClerkProvider and ConvexClientProvider
- `app/page.tsx` - Added authentication UI (Sign In/Sign Up buttons, UserButton)
- `app/create-room/page.tsx` - Updated to use Convex mutations and require auth
- `package.json` - Added new dependencies, removed socket.io-client
- `.gitignore` - Added Convex generated files

### 5. Files Deleted
- `hooks/use-socket.tsx` - No longer needed
- `hooks/use-game-state.tsx` - No longer needed

## 📋 Next Steps - Setup Instructions

### Step 1: Install Dependencies
```bash
bun install
```

### Step 2: Set Up Clerk
1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Go to **JWT Templates** in the Clerk Dashboard
4. Click **New template** → Select **Convex**
5. **IMPORTANT**: Do NOT rename the JWT token. It must be called `convex`
6. Copy the **Issuer URL** (looks like `https://verb-noun-00.clerk.accounts.dev`)
7. Go to **API Keys** page and copy:
   - Publishable Key (starts with `pk_test_...`)
   - Secret Key (starts with `sk_test_...`)

### Step 3: Set Up Convex
1. Run the following command to initialize Convex:
```bash
npx convex dev
```

2. Follow the prompts to create a Convex account and project
3. Copy the `CONVEX_URL` that is generated (looks like `https://xxx.convex.cloud`)

### Step 4: Configure Environment Variables
Fill in your `.env.local` file with the values from Clerk and Convex:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
CLERK_JWT_ISSUER_DOMAIN=https://verb-noun-00.clerk.accounts.dev
```

### Step 5: Configure Convex Dashboard
1. Go to your Convex Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the `CLERK_JWT_ISSUER_DOMAIN` variable with your Clerk Issuer URL

### Step 6: Run the Development Server
```bash
bun run dev
```

In a separate terminal, keep Convex running:
```bash
npx convex dev
```

## 🎯 How It Works

### Real-time Updates with Convex
Convex provides automatic real-time subscriptions. When you use `useQuery` from `convex/react`, your component automatically subscribes to data changes:

```typescript
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function MyComponent() {
  // This automatically subscribes to real-time updates
  const game = useQuery(api.games.getGame, { gameId: "xyz" });
  
  return <div>{game?.status}</div>;
}
```

### Mutations
To modify data, use `useMutation`:

```typescript
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

function MyComponent() {
  const createGame = useMutation(api.games.createGame);
  
  const handleCreate = async () => {
    const gameId = await createGame({ roomCode: "ABC123" });
  };
  
  return <button onClick={handleCreate}>Create Game</button>;
}
```

### Authentication
- Users must sign in to create or join games
- Authentication is handled by Clerk + Convex
- Use `<Authenticated>`, `<Unauthenticated>`, and `<AuthLoading>` components to control UI
- Use `useConvexAuth()` hook to check auth state (not Clerk's `useAuth()`)

## 🗄️ Database Schema

### Users Table
- `clerkId`: User's Clerk ID
- `email`: User's email
- `username`: Display name
- `name`: Full name
- `imageUrl`: Profile picture
- `createdAt`: Timestamp

### Games Table
- `players`: Array of Clerk user IDs
- `board`: Array of moves (X, O, or null)
- `currentPlayer`: "X" or "O"
- `winner`: "X", "O", "draw", or undefined
- `status`: "waiting", "active", or "completed"
- `roomCode`: Optional room code for joining
- `createdAt` / `updatedAt`: Timestamps

### Leaderboard Table
- `userId`: Clerk user ID
- `username`: Display name
- `wins`: Number of wins
- `losses`: Number of losses
- `draws`: Number of draws
- `totalGames`: Total games played
- `winRate`: Win percentage
- `updatedAt`: Timestamp

## 🔧 Available Convex Functions

### User Functions (`convex/users.ts`)
- `getOrCreateUser()` - Get or create user from auth
- `getCurrentUser()` - Get current authenticated user
- `updateUserProfile({ username, name })` - Update user profile
- `getUserById({ clerkId })` - Get user by Clerk ID

### Game Functions (`convex/games.ts`)
- `createGame({ roomCode })` - Create a new game
- `joinGame({ roomCode })` - Join a game by room code
- `makeMove({ gameId, position })` - Make a move in the game
- `getGame({ gameId })` - Get game by ID
- `getGameByRoomCode({ roomCode })` - Get game by room code
- `getUserActiveGames()` - Get current user's active games
- `getUserGameHistory({ limit })` - Get game history

### Leaderboard Functions (`convex/leaderboard.ts`)
- `getTopPlayersByWins({ limit })` - Get top players by wins
- `getTopPlayersByWinRate({ limit, minGames })` - Get top players by win rate
- `getCurrentUserStats()` - Get current user's stats
- `getUserRankByWins()` - Get user's rank by wins
- `getUserRankByWinRate({ minGames })` - Get user's rank by win rate
- `getLeaderboardPaginated({ sortBy, offset, limit, minGames })` - Paginated leaderboard
- `searchLeaderboard({ username, limit })` - Search users

## 🚀 Key Benefits of Convex

1. **Real-time by Default**: No need to manually manage WebSocket connections
2. **Type Safety**: Full TypeScript support with generated types
3. **No Boilerplate**: No need for REST APIs or GraphQL resolvers
4. **Automatic Reactivity**: Components re-render when data changes
5. **Optimistic Updates**: Built-in support for optimistic UI updates
6. **Built-in Auth**: Seamless integration with Clerk

## 📚 Additional Resources

- [Convex Documentation](https://docs.convex.dev)
- [Clerk Documentation](https://clerk.com/docs)
- [Convex + Clerk Guide](https://docs.convex.dev/auth/clerk)

## ⚠️ Important Notes

1. The `convex/tsconfig.json` file is **required** for Convex to work properly
2. Always keep `npx convex dev` running during development
3. Use `useConvexAuth()` instead of Clerk's `useAuth()` for checking auth state
4. Convex functions run on the server, so they have access to `ctx.auth.getUserIdentity()`
5. The JWT template in Clerk **must** be named `convex` (do not rename it)

## 🐛 Troubleshooting

### "Not authenticated" errors
- Make sure you're signed in with Clerk
- Check that your Clerk JWT Issuer Domain is set correctly in both `.env.local` and Convex Dashboard
- Verify the JWT template is named `convex` in Clerk

### Convex queries not updating
- Make sure `npx convex dev` is running
- Check the browser console for errors
- Verify you're using `useQuery` from `convex/react`, not a custom hook

### Type errors in Convex functions
- Run `npx convex dev` to regenerate types
- Check that `convex/tsconfig.json` exists and is configured correctly