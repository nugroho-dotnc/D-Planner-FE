# D-Planner Frontend 🎨

The frontend of D-Planner is a premium React application featuring a futuristic "Liquidmorphism" design, smooth animations, and AI-assisted planning capabilities.

---

## ✨ Features

- **AI Chat Interface**: Real-time integration with Gemini to parse plans and tasks.
- **Dynamic Dashboard**: Interactive stats (Focus Time, Productivity) with time-based filtering.
- **Task & Schedule Management**: Clean timeline views and drag-and-drop-like smooth sorting.
- **Premium UI**:
  - Glassmorphism & Backdrop blur effects.
  - Floating Island Navigation.
  - Liquid active tab indicators using Framer Motion.

---

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [SWR](https://swr.vercel.app/) (Data fetching & Cache)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- Backend server running (default: `http://localhost:5000`)

### Installation

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in this directory:
   ```env
   VITE_API_BASE_URL="http://localhost:5000"
   ```

### Scripts

- `npm run dev`: Start local development server
- `npm run build`: Build for production
- `npm run preview`: Preview the production build locally

---

## 📁 Project Structure

```text
src/
├── app/         # Router and layout configurations
├── components/  # Reusable UI components (cards, navigation, feedback)
├── hooks/       # Custom React hooks (auth, activities, tasks, notes)
├── layouts/     # Page layout wrappers (Auth, App, Shared)
├── pages/       # main views (Dashboard, Task, Activity, Notes, Auth)
├── services/    # API calling layer using Axios
├── styles/      # Global CSS and Tailwind directives
└── utils/       # Shared helper functions
```
