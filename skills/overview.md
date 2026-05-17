# Visualise CRM - Project Overview

## Project Summary
A CRM system for a freelance/agency professional managing international clients (outside India). The system provides tools for lead management, client profiles, project tracking, team collaboration, communication logging, and financial oversight.

## Tech Stack

### Frontend (Existing)
- **Framework**: React 18.2.0 with Vite 5.0.0
- **Routing**: React Router DOM 6.0.2
- **Styling**: Tailwind CSS 3.4.6 with custom design tokens
- **UI Components**: Radix UI, CVA (Class Variance Authority), Lucide React icons
- **Charts**: Recharts 2.15.2, D3 7.9.0
- **Animations**: Framer Motion 10.16.4 (installed, not yet used)
- **State Management**: Redux Toolkit 2.6.1 (installed, not yet implemented)
- **HTTP Client**: Axios 1.8.4 (installed, not yet used)
- **Forms**: React Hook Form 7.55.0 (installed, not yet used)

### Backend (Built)
- **Runtime**: Node.js with Express + TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: OAuth2 (Google, GitHub, Microsoft) + JWT
- **API Style**: RESTful API
- **Build**: ts-node-dev for development, tsc for production

## Design System

### Color Palette
- Primary: `#8B4513` (Saddle Brown)
- Accent: `#FF6B35` (Coral Orange)
- Secondary: `#2F4F4F` (Dark Slate Gray)
- Background: `#FEFCF8` (Warm Off-White)
- Foreground: `#2C2C2C` (Rich Charcoal)
- Success: `#059669`, Warning: `#D97706`, Error: `#DC2626`

### Typography
- Headings: Crimson Pro (serif)
- Body: Source Sans 3 (sans-serif)
- Labels: Inter (sans-serif)
- Data/Numbers: JetBrains Mono (monospace, tabular figures)

## Existing Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | HomeDashboard | Landing/redirect |
| `/home-dashboard` | HomeDashboard | Tasks, financial overview, quick access widgets |
| `/lead-client-flow` | LeadClientFlow | Kanban sales pipeline (6 stages) with drag-and-drop |
| `/client-profile` | ClientProfile | 5-tab client view (overview, projects, communications, files, payments) |
| `/project-management` | ProjectManagement | Project cards, milestones, tasks, team collaboration |
| `/team-workspace` | TeamWorkspace | Workload management, activity feed, calendar |
| `/communication-hub` | CommunicationHub | Communication logging with analytics |
| `/settings-configuration` | SettingsConfiguration | General, team, automation, integrations, security settings |
| `/login` | Login | Mock authentication |
| `/register` | Register | Mock registration |

## Current State
- Backend is fully built with all core CRUD endpoints
- All data is hardcoded mock data in frontend (needs API integration)
- OAuth2 authentication implemented (Google, GitHub, Microsoft)
- JWT-based API authentication with role-based access
- Prisma schema created with 15+ models
- No Redux store configured yet in frontend
- No protected routes in frontend yet
- Frontend needs to be connected to backend APIs

## CRM Core Features to Implement

### 1. Authentication & Authorization
- OAuth2 login (Google, GitHub, Microsoft)
- Role-based access control (Admin, Manager, Employee, Client)
- Session management
- Protected API routes

### 2. Contact Management
- CRUD operations for contacts/clients
- Contact categorization (lead, prospect, active, inactive, VIP)
- Contact search and filtering
- Import/export contacts

### 3. Lead & Pipeline Management
- Sales pipeline with customizable stages
- Lead source tracking
- Lead scoring
- Drag-and-drop stage transitions
- Automated pipeline movements

### 4. Deal/Opportunity Management
- Deal creation and tracking
- Deal value and probability
- Expected close dates
- Deal stages aligned with pipeline

### 5. Project Management
- Project creation and assignment
- Milestone tracking
- Task management with phases
- Progress tracking
- Team assignment

### 6. Communication Tracking
- Log calls, emails, meetings, messages
- Communication history per client
- Follow-up reminders
- Communication analytics

### 7. Task Management
- Task creation and assignment
- Priority levels and due dates
- Task completion tracking
- Today's focus dashboard

### 8. Financial Management
- Invoice tracking
- Payment status (paid, pending, overdue)
- Revenue tracking
- Financial overview/dashboard

### 9. Team Management
- Team member profiles
- Role and permission management
- Workload tracking
- Activity feed

### 10. File Management
- File upload and storage
- File categorization
- File association with clients/projects

### 11. Settings & Configuration
- User preferences
- Automation rules
- Integration management
- Security settings

## User Views

### Employee/Internal View
- Full access to dashboard, pipeline, projects, team workspace
- Can manage leads, contacts, deals, tasks
- Can log communications
- Can view financial data
- Can manage team (based on role)

### Client/External View (Portal)
- View own profile and project status
- View associated files
- View payment/invoice history
- View communication history
- Limited interaction capabilities

## Database Entities (Implemented)
All entities defined in `backend/prisma/schema.prisma`:
- User, Contact, Deal, Project, Milestone, Task
- Communication, Invoice, File, Team, TeamMember
- Activity, Notification, AutomationRule, Integration, Session

## API Structure (Implemented)
All endpoints active at `/api/v1/`:
- `/auth/*` - OAuth2 login (Google, GitHub, Microsoft), token verification
- `/users/*` - User CRUD, profile management, role management
- `/contacts/*` - Contact CRUD, search, filter, export
- `/deals/*` - Deal CRUD, pipeline view, stage transitions
- `/projects/*` - Project CRUD, milestones, team members
- `/tasks/*` - Task CRUD, my tasks, today's tasks
- `/communications/*` - Communication logging, history, stats
- `/invoices/*` - Invoice CRUD, status updates, stats
- `/files/*` - File upload, download, management
- `/activities/*` - Activity feed, audit logs
- `/notifications/*` - Notifications, mark as read
- `/dashboard/*` - Dashboard data, financial overview

## Project Structure
```
CRM/
├── frontend/                    # React frontend (existing)
│   ├── src/
│   │   ├── components/         # Shared UI components
│   │   ├── pages/              # Page components (10 pages)
│   │   ├── styles/             # Tailwind CSS + custom utilities
│   │   └── utils/              # Helper functions
│   └── ...
├── backend/                     # Node.js backend (built)
│   ├── src/
│   │   ├── config/             # Database, Passport config
│   │   ├── controllers/        # 11 controllers
│   │   ├── middleware/         # Auth middleware
│   │   ├── routes/             # 12 route files
│   │   └── index.js            # Express entry point
│   ├── prisma/
│   │   └── schema.prisma       # Database schema (15 models)
│   └── .env                    # Environment variables
└── skills/                      # Documentation
    ├── overview.md              # This file
    ├── api-docs.md              # Complete API documentation
    ├── database-schema.md       # Database models & relationships
    ├── setup-guide.md           # Setup & configuration guide
    ├── architecture.md          # System architecture
    └── features.md              # Feature documentation
```

## Next Steps
1. Set up PostgreSQL database and run migrations (`npm run db:migrate`)
2. Configure OAuth2 credentials in `.env`
3. Connect frontend to backend APIs (replace mock data)
4. Implement Redux store for state management
5. Add protected routes and role-based access in frontend
6. Create client portal view
7. Set up file storage (local/S3)
8. Implement automation engine
