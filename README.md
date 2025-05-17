# Multiplayer Tic-Tac-Toe Game

A real-time multiplayer Tic-Tac-Toe game built with **Next.js**, supporting custom game rooms, live chat, multiple board sizes, dark mode, and more.

## 🧑‍💻 Author

**Abdullah Al Masum**

---

## 🚀 Hosted Version

🔗 [tic-tac-master-gray.vercel.app](https://tic-tac-master-gray.vercel.app)

---

## 🚀 Features

### 🎮 Core Gameplay

* Real-time two-player or three-player Tic-Tac-Toe
* Custom board sizes: 3x3, 4x4, and 5x5
* Detects win, draw, and player disconnect scenarios
* Persistent game state across browser tabs

### 🧑‍🤝‍🧑 Multiplayer

* Create or join a game room with a unique join code
* Accurate synchronization between host and joining players
* Room capacity limit based on player count settings

### 🧍 Player Profiles

* Players enter their name and select an avatar before joining
* Player names and avatars are shown during gameplay

### 💬 Chat System

* Live chat between players
* Chat filter toggle to censor inappropriate words (host-controlled)
* Message indicators for filtered messages
* Tabs to filter messages: All, You, Others
* Modern UI with timestamps and styled message bubbles

### 🌗 Dark Mode

* Full dark mode support using `next-themes`
* Toggle available in the top-right corner of every page
* Uses Tailwind's `zinc` palette for balanced gray/black tones

### 🧭 Dashboard UI

* Sidebar navigation for home, create room, and join room
* Tabs and cards for clean layout management
* Responsive layout optimized for mobile and desktop

---

## 🛠️ Tech Stack

* **Next.js** (App Router)
* **React** + Hooks
* **Tailwind CSS** (with custom theme)
* **shadcn/ui** for elegant components
* **localStorage** and `window.postMessage` for real-time sync

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
