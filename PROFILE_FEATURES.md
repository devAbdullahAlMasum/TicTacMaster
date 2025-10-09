# Profile & Account Features

## Overview

TicTacMaster now includes a comprehensive profile and account system that allows users to track their statistics, view their rankings, customize their appearance, and manage their settings.

## Features

### 1. Custom Profile Page (`/profile`)

A dedicated profile page that displays:

- **User Information**
  - Avatar with gradient backgrounds
  - Username and full name
  - Email address
  - Member since date
  - Rank badge (Champion, Master, Expert, Advanced, Novice, Unranked)

- **Quick Stats Dashboard**
  - Total wins, losses, and draws
  - Win rate percentage with color-coded progress bars
  - Current win streak
  - Highest win streak
  - Tournament championships won
  - Global leaderboard rank

- **Performance Breakdown**
  - Detailed statistics visualization
  - Progress bars for wins, losses, draws
  - Win rate analysis with color coding:
    - Green (70%+): Excellent performance
    - Blue (50-69%): Good performance
    - Yellow (30-49%): Average performance
    - Red (<30%): Needs improvement

- **Achievement System**
  - First Victory: Win your first game
  - Rising Star: Win 10 games
  - Hot Streak: Win 5 games in a row
  - Champion: Win a tournament
  - Veteran: Win 50 games
  - Elite Player: Reach Top 10 leaderboard

- **Leaderboard Integration**
  - Current global rank display
  - Total player count
  - Quick link to full leaderboard

### 2. Custom User Profile Button

Replaces the default Clerk UserButton with a feature-rich custom component:

- **Avatar Display**
  - Gradient-based avatar (15 color schemes)
  - Crown badge for Top 10 players
  - Hover effects and animations

- **Dropdown Menu**
  - User information card
  - Quick stats (Wins, Losses, Win Rate)
  - Rank badge display
  - Navigation links:
    - View Profile
    - Settings
    - Leaderboard
    - Sign Out

### 3. Enhanced Settings Page (`/settings`)

Comprehensive settings interface with:

- **Profile Settings**
  - Username editing
  - Full name (optional)
  - Email display (managed via Clerk)
  - Real-time avatar preview

- **Avatar Selector**
  - 15 unique gradient-based avatars
  - Grid layout with visual selection
  - Selected avatar highlighted
  - Instant preview on selection

- **Preferences** (Coming Soon)
  - Sound effects toggle
  - Animation settings
  - Chat filter options

- **Privacy & Security** (Coming Soon)
  - Profile visibility controls
  - Online status display
  - Privacy settings

### 4. Sidebar Profile Integration

The dashboard sidebar now displays:

- User's current avatar
- Username
- Quick win/loss stats (e.g., "10W 5L")
- Clickable link to profile page
- Real-time data updates

### 5. User Avatar Component

A reusable `UserAvatar` component with:

- **15 Gradient Color Schemes**
  1. Blue to Indigo
  2. Purple to Pink
  3. Green to Teal
  4. Orange to Red
  5. Cyan to Blue
  6. Pink to Rose
  7. Yellow to Orange
  8. Indigo to Purple
  9. Teal to Green
  10. Red to Pink
  11. Emerald to Cyan
  12. Violet to Fuchsia
  13. Amber to Yellow
  14. Lime to Green
  15. Sky to Indigo

- **Four Size Options**
  - `sm`: 8x8 (32px)
  - `md`: 10x10 (40px)
  - `lg`: 16x16 (64px)
  - `xl`: 32x32 (128px)

- **Features**
  - Displays first letter of username
  - Automatic gradient selection based on avatarId
  - Consistent styling across the app
  - Responsive and accessible

## Technical Implementation

### Components

- `components/user-profile-button.tsx` - Custom profile dropdown button
- `components/user-avatar.tsx` - Reusable avatar component
- `app/profile/page.tsx` - Profile page
- `app/settings/page.tsx` - Settings page

### Convex Queries & Mutations

- `users.getCurrentUser` - Get current authenticated user
- `users.updateUserProfile` - Update username, name, and avatar
- `leaderboard.getCurrentUserStats` - Get user's game statistics
- `leaderboard.getUserRankByWins` - Get user's current rank

### Data Structure

Users have the following profile fields:
- `clerkId`: Clerk authentication ID
- `email`: User's email address
- `username`: Display name (editable)
- `name`: Full name (optional, editable)
- `avatarId`: Selected avatar (1-15, editable)
- `createdAt`: Account creation timestamp

Leaderboard stats include:
- `wins`, `losses`, `draws`: Game results
- `totalGames`: Total games played
- `winRate`: Win percentage
- `tournamentWins`: Tournament championships
- `highestStreak`: Best consecutive wins
- `currentStreak`: Current consecutive wins

## User Experience

### Navigation

- **Dashboard Sidebar**: Profile link added with User icon
- **Top Bar**: Custom profile button (authenticated users only)
- **Sidebar Header**: Clickable profile card showing avatar and quick stats

### Visual Design

- Gradient-based avatars eliminate need for image uploads
- Consistent color schemes across the application
- Rank badges with color coding:
  - Gold: Champion (#1)
  - Purple: Master (Top 10)
  - Blue: Expert (Top 50)
  - Green: Advanced (Top 100)
  - Gray: Novice/Unranked

### Responsive Design

- Mobile-optimized layouts
- Touch-friendly buttons and interactions
- Adaptive grid systems
- Collapsible sections on smaller screens

## Future Enhancements

- [ ] Match history with game details
- [ ] Friend system and social features
- [ ] Custom profile themes
- [ ] Profile background customization
- [ ] Player achievements showcase
- [ ] Statistics graphs and charts
- [ ] Season rankings
- [ ] Profile sharing links
- [ ] Player comparisons
- [ ] Export statistics

## Usage Examples

### Accessing Your Profile

1. Click the profile avatar in the top-right corner
2. Select "View Profile" from the dropdown
3. Or click "Profile" in the sidebar navigation

### Changing Your Avatar

1. Go to Settings (`/settings`)
2. Scroll to "Choose Your Avatar" section
3. Click on any avatar to select it
4. Click "Save Changes" at the bottom

### Viewing Your Stats

- Quick stats: Hover over profile button
- Detailed stats: Visit `/profile` page
- Leaderboard position: Check "Leaderboard" tab on profile

### Tracking Achievements

1. Visit your profile page
2. Click the "Achievements" tab
3. View unlocked and locked achievements
4. Track progress toward next milestone

## Benefits

- **Motivation**: Clear progress tracking encourages continued play
- **Competition**: Leaderboard integration drives competitive play
- **Personalization**: Avatar selection allows self-expression
- **Recognition**: Rank badges showcase accomplishments
- **Engagement**: Achievement system provides goals to work toward
- **Transparency**: Complete statistics visibility
- **Convenience**: Easy profile management in one place

## Notes

- All profile data is stored securely in Convex database
- Authentication handled by Clerk
- Real-time updates using Convex reactive queries
- No image uploads required (gradient avatars)
- Automatic leaderboard entry on user creation
- Profile data persists across sessions