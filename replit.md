# CrowdFundX Registry

## Overview
CrowdFundX is an institutional growth registry - a trust-oriented crowdfunding platform where process is the asset. Users can track milestones, verify skills, and build a lasting reputation.

> **Full Documentation**: See [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) for complete technical documentation including data models, flowcharts, mind maps, and detailed explanations.

## Project Architecture
- **Frontend**: React 19 with TypeScript, using Vite as the build tool
- **Backend**: Express.js with MongoDB Atlas for data persistence
- **Database**: MongoDB Atlas (cloud-hosted)
- **Styling**: Tailwind CSS (loaded from CDN)
- **Icons**: Lucide React
- **Structure**:
  - `/pages` - Main application pages (LandingPage, CreateProject, ProjectDetails, etc.)
  - `/components` - Reusable UI components
  - `/services` - Service modules (dbService for API calls, mongodb for database connection)
  - `/types.ts` - TypeScript type definitions
  - `/constants.tsx` - Application constants
  - `/server.ts` - Express backend server

## Development
- Run `npm run dev` to start the Vite development server on port 5000
- Run `npm run server` to start the backend Express server on port 3001
- The app uses Tailwind CSS from CDN for styling

## Configuration
- Port: 5000 (frontend)
- Port: 3001 (backend)
- Host: 0.0.0.0 (allows external access)
- Vite is configured to allow all hosts for Replit proxy compatibility
- Required environment variable: MONGODB_URI

## Authentication
- Users sign up with email/password stored in MongoDB
- Sign in validates credentials against the database
- Passwords are stored (Note: in production, should be hashed)

## Database Collections
- `users` - User profiles with authentication
- `projects` - Project data with all details

## API Endpoints
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/signin` - Authenticate user
- GET `/api/user/:email` - Get user by email
- POST `/api/user` - Update user
- GET `/api/projects` - Get all projects
- POST `/api/projects` - Save/replace all projects
- PATCH `/api/projects/:id` - Update single project
- DELETE `/api/projects/:id` - Delete project
- POST `/api/seed` - Seed database with dummy data
- GET `/api/health` - Health check

## Categories
Technology, Sustainability, Social Impact, Arts, Agriculture, Education

## Dummy Accounts (for testing)
All use password: password123
- maya.chen@example.com (Technology)
- alex.rivera@example.com (Sustainability)
- priya.sharma@example.com (Social Impact)
- jordan.blake@example.com (Arts)
- samuel.okonkwo@example.com (Agriculture)
- emma.watson@example.com (Education)

## User Preferences
(No preferences recorded yet)

## Recent Changes
- February 2026: Real-World & Database Constraints
  - Implemented database-level unique indexes for emails and IDs.
  - Added backend ownership verification for project updates.
  - Restricted profile updates to authenticated owners only.
  - Added input validation (min password length, required fields) on signup.
  - Enhanced server logging for production debugging.
- January 2026: Notification & Approval System
  - Skill contributor and capital contribution requests now send notifications to project creators
  - Project creators can approve/deny requests directly from the notification dropdown
  - Approved capital contributions are added to project funding
  - Approved skill contributors are added to the project skill contributors list
  - Both applicant and creator receive notifications about approval/denial decisions
  - All actions are logged in the project audit history
- January 2026: MongoDB Integration & Authentication
  - Connected app to MongoDB Atlas for persistent storage
  - Implemented proper login/signup with database validation
  - Added seed endpoint to create dummy users and projects (1 per category)
  - Removed localStorage fallback for projects
  - Created 6 dummy user profiles with projects
- January 2026: Initial setup for Replit environment
  - Configured Vite for port 5000 with allowedHosts
  - Installed local React/Lucide dependencies
  - Removed ESM CDN import maps in favor of local packages
