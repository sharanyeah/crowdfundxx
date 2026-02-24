# Deploying CrowdFundX to Render

CrowdFundX is a full-stack application with a React (Vite) frontend and an Express backend. To deploy it to Render, follow these steps:

## 1. Prepare Your Repository
Ensure your code is pushed to a GitHub, GitLab, or Bitbucket repository. Render will connect to this repository to automate deployments.

## 2. Deploy the Backend (Express)
1.  **Create a New Web Service**: In your Render Dashboard, click **New +** and select **Web Service**.
2.  **Connect Your Repo**: Select the repository for CrowdFundX.
3.  **Configure Settings**:
    -   **Name**: `crowdfundx-backend` (or similar)
    -   **Environment**: `Node`
    -   **Build Command**: `npm install`
    -   **Start Command**: `node server.ts` (Note: If you use TypeScript, ensure you have `tsx` or `ts-node` in your dependencies, or compile to JS first).
4.  **Add Environment Variables**:
    -   Click the **Environment** tab.
    -   Add `MONGODB_URI`: Your MongoDB Atlas connection string.
    -   Add `PORT`: `3001` (Render will override this, but it's good for consistency).

## 3. Deploy the Frontend (Vite)
1.  **Create a New Static Site**: Click **New +** and select **Static Site**.
2.  **Connect Your Repo**: Select the same repository.
3.  **Configure Settings**:
    -   **Name**: `crowdfundx-frontend`
    -   **Build Command**: `npm run build`
    -   **Publish Directory**: `dist`
4.  **Add Environment Variables**:
    -   Add `VITE_API_URL`: The URL of your backend service (e.g., `https://crowdfundx-backend.onrender.com`).
5.  **Configure Redirects**:
    -   In the **Redirects/Rewrites** tab, add a rule:
        -   **Source**: `/*`
        -   **Destination**: `/index.html`
        -   **Action**: `Rewrite`
    -   This ensures that React Router works correctly on page refreshes.

## 4. Update Frontend Code (Important)
In your `services/dbService.ts` or wherever you make API calls, ensure you are using the `VITE_API_URL` environment variable:

```typescript
// Example in dbService.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

## 5. Real-World & Database Constraints
To ensure a robust production environment, the following constraints have been implemented in the backend (`server.ts`):

1.  **Unique Indexes**: 
    -   `users.email`: Prevents duplicate registrations.
    -   `users.id`: Ensures internal identity integrity.
    -   `projects.id`: Guarantees no two projects share the same identifier.
2.  **Ownership Verification**: 
    -   Project updates (`PATCH /api/projects/:id`) now verify that the requester is the original `creatorId` or an `ADMIN`.
3.  **Profile Protection**: 
    -   User updates (`POST /api/user`) are restricted so users can only modify their own profile data based on their authenticated token.
4.  **Input Validation**: 
    -   Signup requires `name`, `email`, and a `password` of at least 8 characters.
    -   Emails are normalized to lowercase before storage and comparison.
5.  **Security Middleware**: 
    -   JWT verification is mandatory for all write operations, ensuring the "Registry Spine" remains immutable by unauthorized actors.

## 6. Summary
Once both are deployed, your frontend will communicate with your backend via the provided Render URL, and your backend will persist data to your MongoDB Atlas cluster. Use `/api/health` for Render's health monitoring.
