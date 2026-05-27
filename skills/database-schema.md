# Database Schema

## Overview
The CRM uses PostgreSQL with Prisma ORM. This document describes all models and their relationships.

## Enums

### Role
User roles in the system:
- `ADMIN` - Full system access
- `MANAGER` - Manage team and view all data
- `EMPLOYEE` - Standard user with restricted access
- `CLIENT` - External client portal access

### ContactStatus
Status of a contact in the CRM:
- `LEAD` - New/unqualified lead
- `PROSPECT` - Qualified prospect
- `ACTIVE` - Active client
- `INACTIVE` - Inactive client
- `VIP` - VIP/high-value client

### DealStatus
Status of a deal:
- `DRAFT` - Initial draft
- `SENT` - Sent to client
- `CHANGES_REQUESTED` - Client requested changes
- `ACCEPTED` - Client accepted proposal
- `REJECTED` - Client rejected proposal
- `CONVERTED_TO_PROJECT` - Deal converted to active project

### TaskPriority
Priority levels for tasks:
- `LOW` - Low priority
- `MEDIUM` - Normal priority
- `HIGH` - High priority
- `URGENT` - Urgent, immediate action needed

### TaskStatus
Status of a task:
- `TODO` - Not started
- `IN_PROGRESS` - Currently being worked on
- `COMPLETED` - Finished
- `CANCELLED` - Cancelled

### ProjectStatus
Status of a project:
- `PLANNING` - In planning phase
- `ACTIVE` - Currently active
- `ON_HOLD` - Temporarily paused
- `COMPLETED` - Finished
- `CANCELLED` - Cancelled

### CommunicationType
Type of communication:
- `CALL` - Phone call
- `EMAIL` - Email
- `MEETING` - In-person meeting
- `MESSAGE` - Text/chat message
- `ZOOM` - Video conference

### InvoiceStatus
Status of an invoice:
- `DRAFT` - Not yet sent
- `PENDING` - Sent, awaiting payment
- `PAID` - Payment received
- `OVERDUE` - Past due date
- `CANCELLED` - Cancelled

### PipelineStage
Sales pipeline stages:
- `NEW_LEAD` - Initial contact
- `QUALIFIED` - Qualified as potential client
- `PROPOSAL_SENT` - Proposal submitted
- `NEGOTIATION` - In negotiation
- `CLOSED_WON` - Deal won
- `CLOSED_LOST` - Deal lost

---

## Models

### User
Represents a system user (employee or client).

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| email | String (unique) | User email |
| name | String | Full name |
| avatar | String? | Profile picture URL |
| role | Role | User role |
| phone | String? | Phone number |
| timezone | String | User timezone (default: UTC) |
| language | String | Preferred language (default: en) |
| isActive | Boolean | Account active status |
| lastLogin | DateTime? | Last login timestamp |
| oauthProvider | String? | OAuth provider (google/github/microsoft) |
| oauthId | String? (unique) | OAuth provider ID |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relationships:**
- Contacts (owned)
- Tasks (assigned/created)
- Projects (member)
- Communications (logged)
- Activities (created)
- Invoices (created)
- Sessions
- Team memberships
- Notifications

---

### Contact
Represents a client or lead in the CRM.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| firstName | String | First name |
| lastName | String | Last name |
| email | String (unique) | Email address |
| phone | String? | Phone number |
| company | String? | Company name |
| jobTitle | String? | Job title |
| status | ContactStatus | Contact status |
| source | String? | Lead source (LinkedIn, Referral, etc.) |
| website | String? | Website URL |
| address | String? | Street address |
| city | String? | City |
| state | String? | State/Province |
| country | String? | Country |
| postalCode | String? | Postal/ZIP code |
| notes | String? | Additional notes |
| value | Float? | Estimated deal value |
| isArchived | Boolean | Soft delete flag |
| ownerId | String | Owner user ID |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relationships:**
- Owner (User)
- Deals
- Projects
- Communications
- Tasks
- Invoices
- Files

---

### Deal
Represents a sales opportunity.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| title | String | Deal title |
| description | String? | Deal description |
| value | Float | Deal value |
| probability | Int | Win probability (0-100) |
| status | DealStatus | Deal status |
| stage | PipelineStage | Pipeline stage |
| expectedCloseDate | DateTime? | Expected close date |
| closedDate | DateTime? | Actual close date |
| contactId | String | Associated contact |
| assignedToId | String? | Assigned user |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relationships:**
- Contact
- Assigned To (User)
- Activities

---

### Project
Represents a client project.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String | Project name |
| description | String? | Project description |
| status | ProjectStatus | Project status |
| startDate | DateTime? | Start date |
| endDate | DateTime? | End date |
| budget | Float? | Project budget |
| progress | Int | Progress percentage (0-100) |
| contactId | String | Client contact |
| dealId | String? | Associated deal ID (if converted) |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relationships:**
- Contact
- Members (Users)
- Milestones
- Tasks
- Files
- Activities

---

### Milestone
Represents a project milestone.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| title | String | Milestone title |
| description | String? | Description |
| dueDate | DateTime? | Due date |
| isCompleted | Boolean | Completion status |
| completedAt | DateTime? | Completion timestamp |
| projectId | String | Parent project |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### Task
Represents a task/todo item.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| title | String | Task title |
| description | String? | Task description |
| priority | TaskPriority | Priority level |
| status | TaskStatus | Task status |
| dueDate | DateTime? | Due date |
| completedAt | DateTime? | Completion timestamp |
| contactId | String? | Associated contact |
| projectId | String? | Associated project |
| assignedToId | String | Assigned user |
| createdById | String | Creator user |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### Communication
Represents a logged communication.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| type | CommunicationType | Communication type |
| subject | String? | Subject/title |
| content | String? | Content/summary |
| direction | String | Inbound/outbound |
| duration | Int? | Duration in minutes |
| outcome | String? | Outcome/result |
| notes | String? | Additional notes |
| scheduledAt | DateTime? | Scheduled time |
| contactId | String | Associated contact |
| userId | String | User who logged it |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### Invoice
Represents a client invoice.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| invoiceNumber | String (unique) | Invoice number |
| description | String? | Description |
| amount | Float | Base amount |
| tax | Float | Tax amount |
| total | Float | Total amount |
| status | InvoiceStatus | Invoice status |
| issueDate | DateTime | Issue date |
| dueDate | DateTime | Payment due date |
| paidDate | DateTime? | Payment date |
| notes | String? | Additional notes |
| contactId | String | Client contact |
| createdById | String | Creator user |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### File
Represents an uploaded file.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String | Stored file name |
| originalName | String | Original file name |
| mimeType | String | MIME type |
| size | Int | File size in bytes |
| path | String | Storage path |
| category | String? | Category (contract, proposal, etc.) |
| contactId | String? | Associated contact |
| projectId | String? | Associated project |
| createdAt | DateTime | Upload timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### Team
Represents a team within the organization.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String | Team name |
| description | String? | Team description |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

**Relationships:**
- Members (TeamMember)

---

### TeamMember
Represents a user's membership in a team.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| role | String | Team role (admin, lead, member) |
| joinedAt | DateTime | Join date |
| teamId | String | Team ID |
| userId | String | User ID |

---

### Session
Represents a user session.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| token | String (unique) | Session token |
| expiresAt | DateTime | Expiration time |
| ipAddress | String? | Client IP |
| userAgent | String? | Client user agent |
| userId | String | User ID |
| createdAt | DateTime | Creation timestamp |

---

### Activity
Represents an audit log entry.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| type | String | Activity type |
| description | String | Activity description |
| metadata | Json? | Additional context |
| userId | String | User who performed action |
| dealId | String? | Associated deal |
| projectId | String? | Associated project |
| createdAt | DateTime | Timestamp |

---

### Notification
Represents a user notification.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| type | String | Notification type |
| title | String | Notification title |
| message | String | Notification message |
| isRead | Boolean | Read status |
| link | String? | Associated URL |
| userId | String | Recipient user |
| createdAt | DateTime | Creation timestamp |

---

### AutomationRule
Represents an automation rule.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String | Rule name |
| description | String? | Rule description |
| trigger | String | Trigger event |
| conditions | Json | Rule conditions |
| actions | Json | Actions to perform |
| isActive | Boolean | Active status |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

### Integration
Represents a third-party integration.

| Field | Type | Description |
|-------|------|-------------|
| id | String (UUID) | Primary key |
| name | String (unique) | Integration name |
| isConnected | Boolean | Connection status |
| config | Json? | Integration configuration |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

---

## Entity Relationship Diagram

```
User (1) ──── (N) Contact
User (1) ──── (N) Task (assigned)
User (1) ──── (N) Task (created)
User (N) ──── (N) Project (members)
User (1) ──── (N) Communication
User (1) ──── (N) Activity
User (1) ──── (N) Invoice
User (1) ──── (N) Session
User (1) ──── (N) Notification
User (N) ──── (N) Team (via TeamMember)

Contact (1) ──── (N) Deal
Contact (1) ──── (N) Project
Contact (1) ──── (N) Communication
Contact (1) ──── (N) Task
Contact (1) ──── (N) Invoice
Contact (1) ──── (N) File

Deal (1) ──── (N) Activity

Project (1) ──── (N) Milestone
Project (1) ──── (N) Task
Project (1) ──── (N) File
Project (1) ──── (N) Activity

Team (1) ──── (N) TeamMember (N) ──── User
```
