# Frontend-Backend Integration

## What's Connected

### Authentication
- OAuth2 login (Google, GitHub, Microsoft) via backend
- JWT token storage in localStorage
- Protected routes redirect to /login if not authenticated
- Auth callback page handles OAuth redirects
- Header shows real user info from backend
- Logout clears token and redirects

### Dashboard
- Today's tasks fetched from `/api/v1/dashboard`
- Financial overview from `/api/v1/dashboard/financial`
- Real-time task completion tracking

### API Services (`src/services/index.js`)
All backend endpoints wrapped in service functions:
- `authService` - OAuth config, token management
- `userService` - Profile, user management
- `contactService` - Full CRUD + search + export
- `dealService` - Deals, pipeline, stats
- `projectService` - Projects, milestones, members
- `taskService` - Tasks, my tasks, today's tasks
- `communicationService` - Communication logging
- `invoiceService` - Invoice management
- `dashboardService` - Dashboard aggregates
- `activityService` - Activity feed
- `notificationService` - Notifications
- `fileService` - File upload/download

### Redux Store (`src/store/`)
Slices for all major entities:
- `authSlice` - User, authentication state
- `contactSlice` - Contacts with pagination
- `dealSlice` - Deals, pipeline view
- `projectSlice` - Projects, tasks, communications, invoices, dashboard
- `taskSlice` - Task state
- `communicationSlice` - Communications
- `invoiceSlice` - Invoices
- `dashboardSlice` - Dashboard aggregates

### Axios Interceptor (`src/services/api.js`)
- Automatically attaches JWT token to all requests
- Redirects to /login on 401
- Base URL from `VITE_API_URL` env var

## Setup

### 1. Start Backend
```bash
cd backend
npm run dev
# Runs on http://localhost:4000
```

### 2. Start Frontend
```bash
cd frontend
npm start
# Runs on http://localhost:5173
```

### 3. Configure OAuth
Add OAuth credentials to `backend/.env` to enable social login buttons.

## What Still Needs Connection

The following pages still use mock data and need to be wired up to Redux/API:
- **Pipeline (lead-client-flow)** - Replace mock leads with deals from API
- **Client Profile** - Fetch contact data by ID
- **Project Management** - Use projectSlice data
- **Team Workspace** - Fetch users and activities
- **Communication Hub** - Use communicationSlice
- **Settings** - Connect user management, integrations

## Pattern for Connecting Pages

```jsx
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchContacts } from '../../store/slices/contactSlice';

const MyPage = () => {
  const dispatch = useDispatch();
  const { contacts, isLoading } = useSelector((state) => state.contacts);

  useEffect(() => {
    dispatch(fetchContacts({ page: 1, limit: 20 }));
  }, [dispatch]);

  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      {contacts.map(contact => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  );
};
```
