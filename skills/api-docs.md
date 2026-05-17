# API Documentation

## Base URL
```
http://localhost:4000/api/v1
```

## Authentication
All endpoints (except OAuth callbacks) require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Error Response Format
```json
{
  "error": "Error message"
}
```

---

## Authentication Endpoints

### OAuth2 Login
- `GET /auth/google` - Redirect to Google OAuth
- `GET /auth/github` - Redirect to GitHub OAuth
- `GET /auth/microsoft` - Redirect to Microsoft OAuth

### Callback URLs
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/github/callback` - GitHub OAuth callback
- `GET /auth/microsoft/callback` - Microsoft OAuth callback

All callbacks redirect to: `{FRONTEND_URL}/auth/callback?token=<jwt>`

### Token Verification
```
GET /auth/verify
```
Response:
```json
{
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": "EMPLOYEE",
    "avatar": "url",
    "isActive": true,
    "timezone": "UTC",
    "language": "en"
  }
}
```

### OAuth Configuration
```
GET /auth/config
```
Response:
```json
{
  "google": { "enabled": true },
  "github": { "enabled": true },
  "microsoft": { "enabled": true }
}
```

---

## User Endpoints

### Get Current User Profile
```
GET /users/me
```

### Update Profile
```
PUT /users/me
Body: { "name": "string", "phone": "string", "timezone": "string", "language": "string" }
```

### Get All Users (Admin/Manager)
```
GET /users?page=1&limit=20&role=EMPLOYEE&isActive=true
```

### Get User by ID
```
GET /users/:id
```

### Update User Role (Admin)
```
PATCH /users/:id/role
Body: { "role": "ADMIN|MANAGER|EMPLOYEE|CLIENT" }
```

### Deactivate/Activate User (Admin)
```
PATCH /users/:id/deactivate
PATCH /users/:id/activate
```

---

## Contact Endpoints

### Get All Contacts
```
GET /contacts?page=1&limit=20&status=ACTIVE&source=LinkedIn&country=US&search=john
```
Response:
```json
{
  "contacts": [...],
  "pagination": { "page": 1, "limit": 20, "total": 100, "pages": 5 }
}
```

### Get Contact Stats
```
GET /contacts/stats
```

### Get Contact by ID
```
GET /contacts/:id
```
Includes: owner, deals, projects, communications, invoices, files, tasks

### Create Contact
```
POST /contacts
Body: {
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "company": "string",
  "jobTitle": "string",
  "status": "LEAD|PROSPECT|ACTIVE|INACTIVE|VIP",
  "source": "string",
  "website": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "postalCode": "string",
  "notes": "string",
  "value": number
}
```

### Update Contact
```
PUT /contacts/:id
Body: { ...fields to update }
```

### Delete Contact (Soft Delete)
```
DELETE /contacts/:id
```

### Search Contacts
```
GET /contacts/search?q=john
```

### Export Contacts (CSV)
```
GET /contacts/export
```

---

## Deal Endpoints

### Get All Deals
```
GET /deals?page=1&limit=20&status=OPEN&stage=NEW_LEAD&assignedTo=uuid
```

### Get Pipeline View
```
GET /deals/pipeline
```
Response:
```json
{
  "pipeline": [
    { "stage": "NEW_LEAD", "count": 5, "totalValue": 50000 },
    { "stage": "QUALIFIED", "count": 3, "totalValue": 30000 },
    ...
  ]
}
```

### Get Deal Stats
```
GET /deals/stats
```

### Get/Create/Update/Delete Deal
```
GET /deals/:id
POST /deals
PUT /deals/:id
DELETE /deals/:id
```

### Update Deal Stage
```
PATCH /deals/:id/stage
Body: { "stage": "NEW_LEAD|QUALIFIED|PROPOSAL_SENT|NEGOTIATION|CLOSED_WON|CLOSED_LOST" }
```

---

## Project Endpoints

### Get All Projects
```
GET /projects?page=1&limit=20&status=ACTIVE&contactId=uuid
```

### Get Project Stats
```
GET /projects/stats
```

### Get/Create/Update/Delete Project
```
GET /projects/:id
POST /projects
PUT /projects/:id
DELETE /projects/:id
```

### Milestone Management
```
POST /projects/:id/milestones
Body: { "title": "string", "description": "string", "dueDate": "date" }

PUT /projects/milestones/:milestoneId
PATCH /projects/milestones/:milestoneId/complete
DELETE /projects/milestones/:milestoneId
```

### Team Member Management
```
POST /projects/:id/members
Body: { "userId": "uuid" }

DELETE /projects/:id/members/:userId
```

---

## Task Endpoints

### Get All Tasks
```
GET /tasks?page=1&limit=20&status=TODO&priority=HIGH&assignedTo=uuid
```

### Get My Tasks
```
GET /tasks/my
```

### Get Today's Tasks
```
GET /tasks/my/today
```

### Get Task Stats
```
GET /tasks/stats
```

### Get/Create/Update/Delete Task
```
GET /tasks/:id
POST /tasks
PUT /tasks/:id
DELETE /tasks/:id
```

### Update Task Status
```
PATCH /tasks/:id/status
Body: { "status": "TODO|IN_PROGRESS|COMPLETED|CANCELLED" }
```

---

## Communication Endpoints

### Get All Communications
```
GET /communications?page=1&limit=20&type=CALL&contactId=uuid
```

### Get Communication Stats
```
GET /communications/stats
```

### Get/Create/Update/Delete Communication
```
GET /communications/:id
POST /communications
PUT /communications/:id
DELETE /communications/:id
```

### Get Contact Communications
```
GET /communications/contact/:contactId
```

---

## Invoice Endpoints

### Get All Invoices
```
GET /invoices?page=1&limit=20&status=PENDING&contactId=uuid
```

### Get Invoice Stats
```
GET /invoices/stats
```

### Get/Create/Update/Delete Invoice
```
GET /invoices/:id
POST /invoices
PUT /invoices/:id
DELETE /invoices/:id
```

### Update Invoice Status
```
PATCH /invoices/:id/status
Body: { "status": "DRAFT|PENDING|PAID|OVERDUE|CANCELLED" }
```

### Get Contact Invoices
```
GET /invoices/contact/:contactId
```

---

## File Endpoints

### Get All Files
```
GET /files?page=1&limit=20
```

### Upload File
```
POST /files
Content-Type: multipart/form-data
Form fields:
  - file: <binary>
  - category: string (optional)
  - contactId: string (optional)
  - projectId: string (optional)
```

### Download File
```
GET /files/:id/download
```

### Get Contact/Project Files
```
GET /files/contact/:contactId
GET /files/project/:projectId
```

### Delete File
```
DELETE /files/:id
```

---

## Activity Endpoints

### Get Activities
```
GET /activities?page=1&limit=50&type=deal_created&userId=uuid
```

### Get Recent Activities
```
GET /activities/recent
```

### Create Activity
```
POST /activities
Body: { "type": "string", "description": "string", "dealId": "uuid", "projectId": "uuid", "metadata": {} }
```

---

## Notification Endpoints

### Get Notifications
```
GET /notifications?page=1&limit=20&isRead=false
```

### Get Unread Count
```
GET /notifications/unread/count
```

### Mark as Read
```
PATCH /notifications/:id/read
PATCH /notifications/read-all
```

### Delete Notification
```
DELETE /notifications/:id
```

---

## Dashboard Endpoints

### Get Full Dashboard
```
GET /dashboard
```
Returns combined overview: tasks, deals, financial, activity

### Get Financial Overview
```
GET /dashboard/financial
```

### Get Today's Tasks
```
GET /dashboard/tasks
```

### Get Recent Activity
```
GET /dashboard/activity
```

---

## Pagination

All list endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## Role-Based Access

| Endpoint | ADMIN | MANAGER | EMPLOYEE | CLIENT |
|----------|-------|---------|----------|--------|
| User management | Full | Read | Own profile | Own profile |
| Contacts | All | All | Own | - |
| Deals | All | All | Assigned | - |
| Projects | All | All | Assigned | Own |
| Tasks | All | All | Own | Own |
| Communications | All | All | Own | Own |
| Invoices | All | All | Created | Own |
| Files | All | All | All | Own |
