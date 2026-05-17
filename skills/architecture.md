# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │Dashboard │  │ Pipeline │  │  Clients │  │  Settings   │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST + JWT
┌────────────────────────▼────────────────────────────────────┐
│                       Backend (Node.js)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Express Server                       │   │
│  │  ┌─────────┐  ┌──────────┐  ┌────────────────────┐  │   │
│  │  │Middleware│  │  Routes  │  │   Controllers      │  │   │
│  │  │- CORS    │  │- Auth    │  │- User Controller   │  │   │
│  │  │- Helmet  │  │- Users   │  │- Contact Controller│  │   │
│  │  │- Session │  │- Contacts│  │- Deal Controller   │  │   │
│  │  │- Auth    │  │- Deals   │  │- ...               │  │   │
│  │  └─────────┘  └──────────┘  └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ Prisma ORM
┌────────────────────────▼────────────────────────────────────┐
│                     PostgreSQL Database                     │
│  Users, Contacts, Deals, Projects, Tasks,                   │
│  Communications, Invoices, Files, Activities                │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + Vite | UI framework |
| Styling | Tailwind CSS | CSS framework |
| Routing | React Router DOM | Client-side routing |
| Backend | Node.js + Express | API server |
| ORM | Prisma | Database abstraction |
| Database | PostgreSQL | Relational database |
| Auth | Passport.js + OAuth2 | Authentication |
| Sessions | express-session | Session management |
| Tokens | JWT | Stateless auth tokens |
| File Upload | Multer | Multipart handling |
| Security | Helmet | HTTP headers security |

## Architecture Patterns

### 1. MVC Pattern
- **Models**: Prisma schema defines data models
- **Views**: React components render UI
- **Controllers**: Handle requests, interact with Prisma, return responses

### 2. RESTful API
- Resource-based URLs (`/api/v1/contacts`)
- HTTP methods for CRUD (GET, POST, PUT, DELETE)
- JSON request/response bodies
- Standard HTTP status codes

### 3. Role-Based Access Control (RBAC)
```
ADMIN ───── Full access to everything
  │
MANAGER ─── View all data, manage team
  │
EMPLOYEE ── Access own contacts, assigned tasks
  │
CLIENT ──── Portal access to own data only
```

### 4. Multi-Tenant Data Isolation
- Employees only see their own contacts
- Managers/Admins see all data
- Clients see only their associated data
- Enforced at controller level with role checks

## Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Prisma client instance
│   │   └── passport.config.js # OAuth strategies
│   │
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── contact.controller.js
│   │   ├── deal.controller.js
│   │   ├── project.controller.js
│   │   ├── task.controller.js
│   │   ├── communication.controller.js
│   │   ├── invoice.controller.js
│   │   ├── file.controller.js
│   │   ├── activity.controller.js
│   │   ├── notification.controller.js
│   │   └── dashboard.controller.js
│   │
│   ├── middleware/
│   │   └── auth.middleware.js # JWT auth, role checks
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── contact.routes.js
│   │   ├── deal.routes.js
│   │   ├── project.routes.js
│   │   ├── task.routes.js
│   │   ├── communication.routes.js
│   │   ├── invoice.routes.js
│   │   ├── file.routes.js
│   │   ├── activity.routes.js
│   │   ├── notification.routes.js
│   │   └── dashboard.routes.js
│   │
│   ├── services/             # Business logic (future)
│   ├── utils/                # Helper functions
│   ├── generated/prisma/     # Auto-generated Prisma client
│   └── index.js              # Express app entry point
│
├── prisma/
│   └── schema.prisma         # Database schema
│
├── uploads/                  # File storage
├── .env                      # Environment variables
└── package.json
```

## Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │────▶│  OAuth   │────▶│ Passport │────▶│ Database │
│          │     │ Provider │     │ Strategy │     │  (User)  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
      │                                                    │
      │  Redirect with JWT token                           │
      │◀───────────────────────────────────────────────────┘
      │
      │  Subsequent requests with JWT
      ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Frontend │────▶│Auth Mid  │────▶│Controller│
│(JWT in  │     │(Verify)  │     │          │
│ header) │     └──────────┘     └──────────┘
└──────────┘
```

### OAuth2 Flow
1. User clicks "Login with Google/GitHub/Microsoft"
2. Redirected to OAuth provider
3. User authorizes application
4. Provider redirects back with auth code
5. Passport exchanges code for user info
6. Creates/updates user in database
7. Generates JWT token
8. Redirects to frontend with token

### JWT Token Structure
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "EMPLOYEE",
  "iat": 1234567890,
  "exp": 1235172690
}
```

## Request Lifecycle

```
Request
  │
  ▼
┌─────────────┐
│   Helmet    │  Security headers
└──────┬──────┘
       ▼
┌─────────────┐
│    CORS     │  Cross-origin handling
└──────┬──────┘
       ▼
┌─────────────┐
│   Morgan    │  Request logging
└──────┬──────┘
       ▼
┌─────────────┐
│  Body Parse │  JSON/urlencoded parsing
└──────┬──────┘
       ▼
┌─────────────┐
│   Session   │  Session management
└──────┬──────┘
       ▼
┌─────────────┐
│   Passport  │  Auth initialization
└──────┬──────┘
       ▼
┌─────────────┐
│    Route    │  Route matching
└──────┬──────┘
       ▼
┌─────────────┐
│ Auth Middle │  JWT verification (if required)
└──────┬──────┘
       ▼
┌─────────────┐
│ Controller  │  Business logic
└──────┬──────┘
       ▼
┌─────────────┐
│   Prisma    │  Database operations
└──────┬──────┘
       ▼
┌─────────────┐
│  Response   │  JSON response
└─────────────┘
```

## Error Handling

### Error Types
- **400 Bad Request**: Invalid input, validation errors
- **401 Unauthorized**: Missing/invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

### Error Response Format
```json
{
  "error": "Human readable message"
}
```

In development mode, errors include stack trace:
```json
{
  "error": "Message",
  "stack": "Stack trace..."
}
```

## Data Flow Examples

### Creating a Contact
```
POST /api/v1/contacts
  │
  ▼
authenticateToken middleware
  │ (verifies JWT, attaches req.user)
  ▼
contactController.createContact
  │ (validates input, creates contact)
  ▼
prisma.contact.create
  │ (database insert)
  ▼
prisma.activity.create
  │ (logs activity)
  ▼
Return 201 with contact data
```

### Viewing Dashboard
```
GET /api/v1/dashboard
  │
  ▼
authenticateToken middleware
  │
  ▼
dashboardController.getDashboard
  │
  ├──► prisma.task.findMany (today's tasks)
  ├──► prisma.deal.aggregate (deal stats)
  ├──► prisma.invoice.aggregate (financial)
  └──► prisma.activity.findMany (recent activity)
  │
  ▼
Return combined dashboard data
```

## Security Considerations

### Implemented
- **Helmet**: Secure HTTP headers
- **CORS**: Configured for frontend origin only
- **JWT**: Stateless authentication with expiration
- **Role checks**: Controller-level authorization
- **Input validation**: Prisma type safety
- **SQL injection protection**: Prisma parameterized queries

### Recommended Additions
- Rate limiting (express-rate-limit)
- Request validation (Zod/Joi)
- CSRF protection
- API key for service-to-service calls
- Audit logging (already partially implemented)

## Scalability Considerations

### Current Design
- Stateless API (JWT, no server-side session dependency)
- Horizontal scaling possible with load balancer
- Database connection pooling via Prisma

### Future Improvements
- Redis for caching frequently accessed data
- Message queue for async operations (emails, notifications)
- CDN for static files and uploads
- Database read replicas for heavy read workloads
- GraphQL for flexible data fetching
