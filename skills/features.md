# CRM Features

## Core Features Implemented

### 1. Authentication & Authorization
- OAuth2 login with Google, GitHub, Microsoft
- JWT-based session management
- Role-based access control (Admin, Manager, Employee, Client)
- Token verification and refresh
- Automatic user creation on first OAuth login

### 2. Contact Management
- **Full CRUD**: Create, read, update, archive contacts
- **Categorization**: Lead, Prospect, Active, Inactive, VIP statuses
- **Rich Profile**: Name, email, phone, company, job title, address, country
- **Lead Source Tracking**: LinkedIn, Referral, Website, etc.
- **Search & Filter**: By name, email, company, status, source, country
- **Export**: CSV export for all contacts
- **Soft Delete**: Archive instead of permanent deletion
- **Ownership**: Contacts owned by specific users

### 3. Deal/Pipeline Management
- **Sales Pipeline**: 6 stages (New Lead → Qualified → Proposal → Negotiation → Won/Lost)
- **Deal Tracking**: Title, value, probability, expected close date
- **Pipeline View**: Aggregate view by stage with counts and values
- **Deal Stats**: Total deals, won deals, win rate, average deal size
- **Stage Transitions**: Move deals through pipeline with activity logging
- **Contact Association**: Link deals to specific contacts
- **Assignment**: Assign deals to team members

### 4. Project Management
- **Project CRUD**: Create, track, update projects
- **Status Tracking**: Planning, Active, On Hold, Completed, Cancelled
- **Progress Tracking**: 0-100% progress indicator
- **Budget Management**: Track project budgets
- **Timeline**: Start and end dates
- **Milestones**: Create, update, complete project milestones
- **Team Assignment**: Add/remove team members from projects
- **Client Association**: Link projects to contacts

### 5. Task Management
- **Task CRUD**: Create, assign, update, complete tasks
- **Priority Levels**: Low, Medium, High, Urgent
- **Status Tracking**: Todo, In Progress, Completed, Cancelled
- **Due Dates**: Track task deadlines
- **Assignment**: Assign tasks to team members
- **Context Linking**: Associate tasks with contacts and projects
- **My Tasks View**: Personal task list for each user
- **Today's Tasks**: Filter tasks due today

### 6. Communication Tracking
- **Log Communications**: Calls, emails, meetings, messages, Zoom
- **Direction Tracking**: Inbound vs outbound
- **Details**: Subject, content, duration, outcome, notes
- **Scheduling**: Schedule future communications
- **Contact History**: View all communications for a contact
- **Analytics**: Communication stats by type, monthly breakdowns

### 7. Invoice/Financial Management
- **Invoice CRUD**: Create, update, track invoices
- **Auto-Numbering**: Automatic invoice number generation
- **Status Tracking**: Draft, Pending, Paid, Overdue, Cancelled
- **Tax Calculation**: Base amount + tax = total
- **Due Dates**: Track payment deadlines
- **Payment Tracking**: Mark invoices as paid with date
- **Financial Stats**: Total revenue, pending, overdue amounts
- **Client Invoices**: View all invoices for a contact

### 8. File Management
- **Upload**: Upload files with metadata
- **Categories**: Categorize files (contract, proposal, invoice, etc.)
- **Association**: Link files to contacts and projects
- **Download**: Download files from storage
- **Metadata**: Track file name, type, size, upload date
- **Management**: Delete files when no longer needed

### 9. Activity/Audit Logging
- **Automatic Logging**: Log important actions automatically
- **Activity Types**: Contact created, deal moved, task completed, etc.
- **Context**: Link activities to deals and projects
- **Metadata**: Store additional context-specific data
- **Recent Activity**: View recent system activity
- **User Attribution**: Track who performed each action

### 10. Notifications
- **User Notifications**: Create notifications for users
- **Read Status**: Mark as read/unread
- **Bulk Actions**: Mark all as read
- **Links**: Associate notifications with URLs
- **Unread Count**: Get count of unread notifications

### 11. Dashboard
- **Today's Focus**: Tasks for today with priorities
- **Financial Overview**: Revenue, pending, overdue amounts
- **Deal Summary**: Open deals, pipeline value
- **Recent Activity**: Latest system activities
- **Quick Stats**: At-a-glance metrics

### 12. Team Management
- **User Management**: View all users, filter by role
- **Role Assignment**: Change user roles (Admin only)
- **Activation/Deactivation**: Enable/disable user accounts
- **Profile Management**: Users can update own profile
- **Teams**: Create teams, manage memberships

---

## Frontend Pages (Existing)

### Home Dashboard
- Today's Focus card with task checklist
- Money Snapshot with financial overview
- Quick Access Widget with recent interactions, project updates, team activity

### Lead & Client Flow
- Kanban-style pipeline with 6 stages
- Drag-and-drop between stages
- Filter by source, project type, team member
- Lead detail modal with contact info and quick actions

### Client Profile
- 5-tab interface: Overview, Projects, Communications, Files, Payments
- Client status badges (VIP, Active, Prospect, Inactive)
- Timeline of interactions
- Team notes with tags
- Key milestones

### Project Management
- Project cards with cover images and progress bars
- Stats overview (active, completed, overdue, team)
- Detail panel with Timeline, Tasks, Files, Team tabs
- Filter by status, client, sort options

### Team Workspace
- Team overview stats
- Workload chart (Recharts)
- Team member cards with status and workload
- Activity feed
- Team calendar

### Communication Hub
- Communication feed with expandable cards
- Filter by type (call, zoom, email, message)
- Analytics sidebar with monthly stats
- Relationship health score
- Communication breakdown by type
- Log Communication modal

### Settings & Configuration
- **General**: Theme, language, timezone, notifications
- **Team Management**: Members, roles, permissions, invite
- **Automation**: Workflow rules with triggers and actions
- **Integrations**: Connected services (Google, Gmail, Zoom)
- **Security**: 2FA, password policy, active sessions

---

## User Views

### Employee/Internal View
**Full Access To:**
- Dashboard with all metrics
- Pipeline management (all deals if Manager/Admin, own if Employee)
- Contact management (all if Manager/Admin, own if Employee)
- Project management (assigned projects)
- Task management (own tasks)
- Communication logging
- Invoice viewing (created by user)
- Team workspace
- Settings (limited based on role)

**Capabilities:**
- Create and manage contacts
- Move deals through pipeline
- Log communications
- Create and complete tasks
- Upload files
- View financial data (based on role)

### Client/External View (Portal)
**Access To:**
- Own profile information
- Associated projects and status
- Project files
- Payment/invoice history
- Communication history
- Tasks assigned to them

**Capabilities:**
- View project progress
- Download project files
- View invoices
- View communication history
- Limited interaction (view-only mostly)

---

## Data Relationships

```
User
  ├── owns ──────▶ Contacts
  ├── assigned ───▶ Tasks
  ├── assigned ───▶ Deals
  ├── member ────▶ Projects
  ├── logs ──────▶ Communications
  ├── creates ───▶ Invoices
  └── performs ──▶ Activities

Contact
  ├── has ───────▶ Deals
  ├── has ───────▶ Projects
  ├── has ───────▶ Communications
  ├── has ───────▶ Tasks
  ├── has ───────▶ Invoices
  └── has ───────▶ Files

Project
  ├── has ───────▶ Milestones
  ├── has ───────▶ Tasks
  ├── has ───────▶ Files
  └── has ───────▶ Activities

Deal
  └── has ───────▶ Activities
```

---

## Features To Implement (Future)

### Automation Engine
- Rule-based triggers (lead created, deal won, task due)
- Conditional actions (send email, create task, update status)
- Scheduled automations

### Email Integration
- Connect Gmail/Outlook
- Send emails directly from CRM
- Email templates
- Email tracking (opens, clicks)

### Calendar Integration
- Google Calendar sync
- Schedule meetings from CRM
- Meeting reminders

### Reporting & Analytics
- Custom report builder
- Sales forecasts
- Team performance metrics
- Client lifetime value
- Revenue trends

### Advanced Search
- Full-text search across all entities
- Saved searches
- Advanced filters with AND/OR logic

### Client Portal
- Dedicated client-facing interface
- Project progress viewing
- File sharing
- Communication portal
- Invoice payment

### Mobile App
- React Native mobile application
- Push notifications
- Offline support

### Integrations
- Slack notifications
- Stripe payment processing
- Dropbox/Google Drive file sync
- Zapier webhook support
