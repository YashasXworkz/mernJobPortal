# MERN Job Portal

A full-stack job portal that connects job seekers and employers. The backend provides REST APIs for authentication, job postings, applications, uploads, and admin actions, while the frontend delivers a responsive dashboard-driven experience built with React and Vite.

## Features
- **Authentication** Email/password registration, login, and profile management with JWT-based sessions (`backend/src/routes/auth.js`).
- **Job management** Employers can post, edit, and delete jobs, including filtering and search (`backend/src/routes/jobs.js`).
- **Applications** Job seekers can apply, track status, and employers can review and update applications (`backend/src/routes/applications.js`).
- **File uploads** Cloudinary-backed image and resume uploads (`backend/src/routes/upload.js`).
- **Admin tools** Admin endpoints for managing platform data (`backend/src/routes/admin.js`).

## Project Structure
- **`backend/`** Express + MongoDB API (`server.js`) with Mongoose models and middleware.
- **`frontend/`** React (Vite) SPA (`src/App.jsx`) using React Router, Bootstrap UI, and Axios API client (`src/lib/api.js`).

## Prerequisites
- Node.js 18+
- MongoDB instance (local or hosted)
- Cloudinary account for asset storage (optional but required for uploads)

## Environment Variables
Create `backend/.env` (not committed) with at least:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobportal
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```
Create `frontend/.env` for the API base URL (defaults to `http://localhost:5000` if omitted):
```
VITE_API_URL=http://localhost:5000
```

## Setup & Development
1. Install dependencies in both workspaces:
   - `cd backend && npm install`
   - `cd frontend && npm install`
2. Start the backend API:
   - `npm run dev` (uses `nodemon`)
3. Start the frontend app:
   - `npm run dev` (Vite dev server)
4. Visit the frontend (default `http://localhost:5173`).

## Database Seeding
Optional sample data is available via `backend/src/seeds.js`. Run once after configuring `backend/.env`:
```
cd backend
node src/seeds.js
```

## Production Build
- Build frontend assets: `cd frontend && npm run build` (output in `frontend/dist/`).
- Serve built frontend from Express automatically when `NODE_ENV=production` (`server.js`).
- Start backend in prod mode: `cd backend && npm start`.

## Testing & Linting
- Backend tests placeholder: `npm test` (none configured yet).
- Frontend linting: `cd frontend && npm run lint`.

## License
Released under the ISC license (see individual `package.json` files).
