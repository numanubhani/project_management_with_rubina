# FlowSpace - Project Management System

A modern, responsive project management application built with React, TypeScript, and Vite. FlowSpace enables teams to manage projects, track progress, handle payments, and collaborate effectively.

## Features

- 🎨 **Modern UI/UX** - Beautiful, responsive design with dark mode support
- 👥 **Role-Based Access** - Admin and Client roles with different permissions
- 📁 **Project Management** - Create, track, and manage projects with deadlines
- 💬 **Real-time Updates** - Get notified about new projects, comments, and updates
- 💰 **Payment Tracking** - Track payment status and approvals
- 📱 **PWA Ready** - Progressive Web App with offline support
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📊 **Dashboard** - Overview of all projects with statistics

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Tailwind CSS** - Styling (via CDN)
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Date-fns** - Date formatting

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project_management_with_rubina
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables (optional)**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your configuration if needed.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Demo Credentials

### Admin Account
- Email: `admin@flowspace.com`
- Password: `password`

### Client Account
- Email: `client@flowspace.com`
- Password: `password`

## Project Structure

```
├── components/          # Reusable UI components
│   ├── projects/       # Project-related components
│   └── ui/            # General UI components
├── pages/              # Page components
├── store.ts           # Zustand state management
├── types.ts           # TypeScript type definitions
├── utils.ts           # Utility functions
└── index.tsx          # Application entry point
```

## Features in Detail

### For Admins
- View all projects in the workspace
- Manage users (create clients/admins)
- Update project status
- Upload delivery files
- Approve payments
- Receive notifications for new projects and client updates

### For Clients
- Create new project requests
- Upload project files
- Track project progress
- Add comments and updates
- Mark payments as cleared
- View project history

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Backend Integration

This frontend is fully connected to the FastAPI backend. See [BACKEND_CONNECTION.md](./BACKEND_CONNECTION.md) for setup instructions.

### Quick Start

1. **Start Backend** (in `project_management_with_rubina_backend`):
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

2. **Start Frontend**:
   ```bash
   npm run dev
   ```

3. **Configure API URL** (create `.env.local`):
   ```env
   VITE_API_URL=http://localhost:8000
   ```

## Notes

- ✅ Fully connected to FastAPI backend
- ✅ JWT authentication with token management
- ✅ Real-time data fetching from backend
- ✅ File upload/download support
- ✅ Service worker registered for PWA functionality
- ✅ All features working with backend API

## License

Private project
