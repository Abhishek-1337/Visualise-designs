# Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

## Environment Setup

### 1. Clone and Navigate
```bash
cd /Users/abhishekvishwakarma/Work/CRM/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy and edit the `.env` file:
```bash
# Already created at backend/.env
# Update with your actual values:
```

Required environment variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/visualise_crm?schema=public"

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=generate-a-secure-random-string
JWT_EXPIRES_IN=7d

# Session
SESSION_SECRET=generate-another-secure-random-string

# OAuth2 - Google (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/v1/auth/google/callback

# OAuth2 - GitHub (https://github.com/settings/developers)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:4000/api/v1/auth/github/callback

# OAuth2 - Microsoft (https://portal.azure.com)
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
MICROSOFT_CALLBACK_URL=http://localhost:4000/api/v1/auth/microsoft/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 4. Generate Random Secrets
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Database Setup

### 1. Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE visualise_crm;

# Exit
\q
```

### 2. Run Prisma Migrations
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate
```

### 3. (Optional) Seed Database
Create a seed file at `prisma/seed.js`:
```javascript
const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@visualise.studio',
      name: 'Admin User',
      role: 'ADMIN',
      timezone: 'UTC'
    }
  });

  console.log('Seed completed:', { admin: admin.email });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run seed:
```bash
npm run db:seed
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Server will start at `http://localhost:4000` with auto-reload using ts-node-dev.

### Production Build
```bash
npm run build
npm start
```

### Type Checking
```bash
npx tsc --noEmit
```

## Prisma Studio (Database GUI)
```bash
npm run db:studio
```
Opens Prisma Studio at `http://localhost:5555` for visual database management.

## OAuth Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:4000/api/v1/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Homepage URL: `http://localhost:5173`
4. Set Authorization callback URL: `http://localhost:4000/api/v1/auth/github/callback`
5. Copy Client ID and Client Secret to `.env`

### Microsoft OAuth
1. Go to [Azure Portal](https://portal.azure.com)
2. Register a new application
3. Add redirect URI: `http://localhost:4000/api/v1/auth/microsoft/callback`
4. Add `User.Read` permission
5. Copy Client ID and Client Secret to `.env`

## Frontend Integration

The frontend (React/Vite) should:
1. Redirect users to OAuth endpoints for login
2. Handle callback at `/auth/callback?token=<jwt>`
3. Store JWT token in localStorage/cookies
4. Include token in API requests: `Authorization: Bearer <token>`

Example frontend auth flow:
```javascript
// Login button
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:4000/api/v1/auth/google';
};

// Handle callback
const handleCallback = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (token) {
    localStorage.setItem('authToken', token);
    navigate('/home-dashboard');
  }
};

// API request
const fetchContacts = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('http://localhost:4000/api/v1/contacts', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

## Project Structure
```
CRM/
├── frontend/              # React frontend (existing)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── ...
├── backend/               # Node.js backend (new)
│   ├── src/
│   │   ├── config/       # Database, passport config
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, validation middleware
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic (future)
│   │   ├── utils/        # Helper functions
│   │   └── index.js      # Entry point
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   ├── uploads/          # File uploads
│   ├── .env              # Environment variables
│   └── package.json
└── skills/               # Documentation
    ├── overview.md
    ├── api-docs.md
    ├── database-schema.md
    └── setup-guide.md
```

## Available Scripts
```bash
npm run dev           # Start dev server with ts-node-dev (auto-reload)
npm start             # Start production server (from dist/)
npm run build         # Compile TypeScript to JavaScript
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run database migrations
npm run db:studio     # Open Prisma Studio
npm run db:seed       # Seed database
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running: `brew services list | grep postgresql`
- Verify DATABASE_URL in `.env`
- Check database exists: `psql -U postgres -l`

### Prisma Client Not Generated
```bash
rm -rf src/generated/prisma
npm run db:generate
```

### OAuth Not Working
- Verify callback URLs match exactly
- Check client ID and secret are correct
- Ensure scopes are properly configured

### Port Already in Use
```bash
# Kill process on port 4000
lsof -ti:4000 | xargs kill -9
```
