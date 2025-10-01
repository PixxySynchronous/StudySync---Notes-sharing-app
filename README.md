# StudySync – Notes Sharing App

Deployed Frontend: https://study-sync-notes-sharing-app-m692-qrr215shy.vercel.app
Backend (API base example): https://studysync-notes-sharing-app.onrender.com/api

> StudySync is an upgraded version of my original notes app. I rebuilt and expanded it using multiple AI-assisted tools (Lovable, GitHub Copilot, and GPT) to learn how to effectively combine them in a real project workflow.

## Overview
StudySync lets users create, manage, and share notes securely. Each note is tied to a user account and can optionally be shared with other registered users with different permission levels.

## Tools & AI Assist
- **Lovable** – UI/component scaffolding & rapid prototyping
- **GitHub Copilot** – Inline code completion & refactors
- **GPT** – Architectural guidance, feature planning, debugging assistance

## Features
- User registration & authentication (JWT-based)
- Create / read / update / delete personal notes
- Tagging (basic metadata support)
- Share notes with other accounts
  - Assign read or edit permission
  - Revoke sharing
- View notes shared *with* you and notes shared *by* you
- Profile management (basic user info + password change)
- Dashboard stats (activity & counts)

## Project Structure (simplified)
```
backend/                 # Express + Mongoose API
frontend/
  studysync-frontend/    # Vite + React + TypeScript (primary frontend)
  dbms/                  # Legacy/unused older CRA version (kept for reference)
```

## Tech Stack
- **Frontend:** React 18, Vite, TypeScript, shadcn/ui (Radix primitives), Tailwind CSS
- **Backend:** Node.js, Express, Mongoose, JWT, Multer
- **Database:** MongoDB Atlas
- **Auth:** JSON Web Tokens (Bearer tokens stored client-side)

## Sharing Model
Each share entry links: `noteId -> sharedWithUserId` plus a `permission` field (`read` | `edit`). The backend enforces permission checks on update operations for shared notes.

<!-- Environment variable details intentionally removed as requested. -->

## Local Development
Backend:
```
cd backend
npm install
npm run dev
```
Frontend (Vite):
```
cd frontend/studysync-frontend
npm install
npm run dev
```
Open: http://localhost:8080 (configured in `vite.config.ts`).

## Basic Manual Test Flow
1. Register a user
2. Create a note
3. Register a second user
4. From first account: share note with second user (read or edit)
5. Login as second user: verify access & (if edit) ability to modify
6. Revoke share & confirm access removed

## Deployment Notes
- **Backend:** Deployed on Render (Node web service). Use `npm start` with environment variables configured in the dashboard.
- **Frontend:** Deployed on Vercel with framework preset = Vite; output directory = `dist`.
- CORS is dynamic and supports:
  - Configured `FRONTEND_URL`
  - Optional Render domains
  - Optional Vercel previews when `ALLOW_VERCEL_PREVIEWS=true`

## Security Considerations (Future Enhancements)
- Add rate limiting (e.g., `express-rate-limit`)
- Add security headers (`helmet`)
- Migrate file uploads to object storage (S3 / Cloud provider) instead of ephemeral disk
- Encrypt sensitive fields if needed

## Roadmap Ideas
- Full-text note search
- Version history
- Real-time collaborative editing (WebSockets / CRDT)
- Markdown + rich text toggle
- Per-tag analytics

## Contributing
Currently personal / exploratory. If opened up, would add lint, test, and PR guidelines.

## License
Not yet specified. (Add a LICENSE file if you plan to open source formally.)

## Acknowledgments
Thanks to the AI tooling ecosystem (Lovable, Copilot, GPT) that accelerated iteration and learning.

---
If you spot an issue or have an improvement idea, feel free to open an issue or fork the repo.
