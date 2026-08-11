# Visualise CRM

A full-stack CRM system for managing international clients, sales pipelines, projects, and team collaboration.

## Overview

Visualise CRM is built for freelance/agency professionals managing clients outside India. It provides lead management, client profiles, project tracking, team collaboration, communication logging, invoicing, and real-time updates via WebSockets.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite 5, TypeScript, Tailwind CSS 3.4, Redux Toolkit |
| **Backend** | Node.js, Express 5, TypeScript, Prisma ORM |
| **Database** | PostgreSQL 14+ |
| **Auth** | OAuth2 (Google, GitHub, Microsoft) + JWT |
| **Realtime** | Socket.IO |
| **Containerization** | Docker & Docker Compose |

## Quick Start

### Docker (Recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

### Manual Setup

**Prerequisites:** Node.js 18+, PostgreSQL 14+

```bash
# 1. Setup database
psql -U postgres -c "CREATE DATABASE visualise_crm;"

# 2. Backend
cd backend
npm install
cp .env.example .env    # edit with your values
npm run db:generate
npm run db:migrate
npm run dev

# 3. Frontend (new terminal)
cd frontend
npm install
npm start
```

### Environment Variables

Copy `backend/.env` and configure:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/visualise_crm?schema=public"
PORT=4000
JWT_SECRET=<generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
SESSION_SECRET=<generate similarly>
GOOGLE_CLIENT_ID=...
GITHUB_CLIENT_ID=...
MICROSOFT_CLIENT_ID=...
FRONTEND_URL=http://localhost:5173
```

## Project Structure

```
CRM/
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── components/     # Shared UI components
│   │   ├── pages/          # Page components (10 pages)
│   │   ├── store/          # Redux store & slices
│   │   ├── services/       # API & Socket services
│   │   ├── contexts/       # Auth & Socket context
│   │   ├── hooks/          # Custom hooks
│   │   ├── styles/         # Tailwind CSS
│   │   └── utils/          # Helpers
│   └── ...
├── backend/                # Express + TypeScript
│   ├── src/
│   │   ├── config/         # DB, Passport config
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation
│   │   ├── routes/         # API routes
│   │   └── socket/         # WebSocket handlers
│   ├── prisma/
│   │   └── schema.prisma   # Database schema (15+ models)
│   └── uploads/            # File uploads
├── skills/                 # Documentation
└── docker-compose.yml
```

## Key Features

- **Authentication** — OAuth2 login (Google, GitHub, Microsoft) with JWT
- **Dashboard** — Role-based views (Admin/Manager vs Employee), today's focus, financial overview
- **Sales Pipeline** — 6-stage Kanban with drag-and-drop lead management
- **Client Profiles** — 5-tab view: overview, projects, communications, files, payments
- **Project Management** — Milestones, tasks, team assignments, progress tracking
- **Team Workspace** — Workload management, activity feed, calendar
- **Communication Hub** — Log calls, emails, meetings with analytics
- **Invoicing** — Invoice tracking, payment status, revenue overview
- **File Management** — Upload, categorize, and associate files with clients/projects
- **Real-time Updates** — Socket.IO for live notifications and activity
- **Role-Based Access** — Admin, Manager, Employee, Client roles with permissions
- **Client Portal** — External view for clients to track projects and payments

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/home-dashboard` | Home Dashboard | Tasks, financial overview, quick access widgets |
| `/lead-client-flow` | Lead Client Flow | Kanban sales pipeline (6 stages) |
| `/client-profile` | Client Profile | 5-tab client view |
| `/project-management` | Project Management | Projects, milestones, tasks |
| `/team-workspace` | Team Workspace | Workload, activity, calendar |
| `/communication-hub` | Communication Hub | Communication logging & analytics |
| `/settings-configuration` | Settings | General, team, automation, security |
| `/login` | Login | OAuth login |
| `/register` | Register | Account registration |

## Available Scripts

### Frontend

```bash
npm start          # Start dev server (http://localhost:5173)
npm run build      # Production build
npm run serve      # Preview production build
```

### Backend

```bash
npm run dev        # Start dev server with auto-reload (http://localhost:4000)
npm start          # Production server
npm run build      # Compile TypeScript
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio (http://localhost:5555)
npm run db:seed      # Seed database with sample data
```

## API Base URL

All endpoints: `http://localhost:4000/api/v1/`

Key routes: `/auth`, `/users`, `/contacts`, `/deals`, `/projects`, `/tasks`, `/communications`, `/invoices`, `/files`, `/dashboard`

## License

ISC
