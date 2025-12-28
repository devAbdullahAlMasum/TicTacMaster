# Multiplayer Tic-Tac-Toe Game

A real-time multiplayer Tic-Tac-Toe game built with **Next.js**, supporting custom game rooms, live chat, multiple board sizes, dark mode, and a comprehensive JSON-based theme system.

## 🧑‍💻 Author

**Abdullah Al Masum**

---

## 🚀 Hosted Version

🔗 [tic-tac-master-gray.vercel.app](https://tic-tac-master-gray.vercel.app)

---

## 🎨 Theme System (v2.3)

**NEW**: Comprehensive JSON-based theme system with 5 built-in themes:

*   **Light** - Clean, bright theme with blue accents
*   **Dark** - Modern dark theme with blue accents
*   **Ocean** - Cyan and blue ocean-inspired theme
*   **Forest** - Green and emerald nature-inspired theme
*   **Sunset** - Orange and red warm theme

### Features
- **Dynamic Theme Switching**: Change themes instantly without page reload
- **JSON Configuration**: Easy theme creation and customization
- **Enhanced Components**: All UI components are theme-aware
- **Component Integration**: Seamless integration with existing components

For detailed documentation, see [THEME_SYSTEM.md](./THEME_SYSTEM.md).

---

## ✨ What's New in v2.2

*   **Multiple Game Modes**: Play against an AI, with a friend on the same device, or compete online.
*   **Sound Effects & Haptics**: Immersive audio feedback for all interactions and game events, plus vibration on mobile.
*   **Redesigned Dashboard**: A modern, visually appealing dashboard to access all game modes.
*   **Persistent User Settings**: Your preferences for sound, vibration, and theme are saved locally.
*   **"What's New" Changelog**: Stay updated with the latest features directly within the app.

---

## 🚀 Features

### 🎮 Game Modes

*   **Single Player**: Challenge a smart AI opponent.
*   **Local Multiplayer**: Play with a friend on the same device.
*   **Online Multiplayer**: Create or join private game rooms to play with friends online.
*   **Tournaments**: Create and join competitive events (coming soon).

### 🔊 Sound & Haptics

*   Global click sounds for all buttons and navigation links.
*   Distinct sound effects for moves, wins, draws, and errors.
*   Mobile haptic feedback (vibration) for a more tactile experience.
*   All sounds and vibrations can be toggled in the Settings menu.

### 🧑‍🤝‍🧑 Multiplayer & Chat

*   Create or join a game room with a unique join code.
*   Live chat with a built-in profanity filter (host-controlled).
*   Real-time synchronization of game state and player actions.

### 🎨 UI/UX & Customization

*   **Modern Dashboard**: A redesigned, intuitive dashboard serves as the central hub.
*   **Player Profiles**: Choose a name and an avatar before playing.
*   **Custom Board Sizes**: Play on 3x3, 4x4, or 5x5 boards.
*   **Dark Mode**: A sleek, eye-friendly dark theme that can be toggled and is saved to your preferences.
*   **Responsive Design**: Fully optimized for both desktop and mobile devices.

---

## 🛠️ Tech Stack

* **Next.js** (App Router)
* **React** + Hooks
* **Tailwind CSS** (with custom theme)
* **shadcn/ui** for elegant components
* **localStorage** for persisting user settings and game state
* **`useSoundEffects` Hook** for centralized audio and haptic feedback management

---

## 🔧 How to Use

### 1. Clone the Repository

```bash
git clone https://github.com/devAbdullahAlMasum/TicTacMaster.git
cd TicTacMaster
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Run the App

```bash
pnpm run dev
```

---

## 🧪 Testing Multiplayer

1. Create a room from one tab
2. Copy the join code (you’ll see feedback when copied)
3. Open another tab or device and join the room using the code
4. Chat and play in real time

---

## ✅ Roadmap & Beta Features

* [x] 3-player support (Beta)
* [x] Chat filter toggle
* [x] 4x4 and 5x5 board sizes
* [ ] Server-side sync (Socket.io planned)
* [ ] Spectator mode
* [ ] Player rankings and history

---

## 📜 License

MIT License. Feel free to use and modify for personal or commercial use.

---

## 📬 Contact

If you found this helpful or want to collaborate, feel free to reach out!

> Built with ❤️ by Abdullah Al Masum
