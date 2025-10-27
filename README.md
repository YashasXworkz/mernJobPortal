# MERN Job Portal

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/YashasXworkz/mernJobPortal)

A full-stack job portal application connecting job seekers and employers. Built with React, Node.js, Express, and MongoDB.

## Features

- **User Authentication** - Register/Login for job seekers, employers, and admin
- **Job Management** - Post, edit, delete, and search jobs
- **Application System** - Apply for jobs and track application status
- **Resume Upload** - Upload and view resumes with PDF viewer
- **Admin Dashboard** - Manage users, jobs, and applications
- **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Frontend:** React, Bootstrap, React Router
- **Backend:** Node.js, Express.js, MongoDB
- **Authentication:** JWT tokens
- **File Storage:** Cloudinary
- **UI:** React Bootstrap, Toast notifications

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for file uploads)

## Environment Setup

Create `backend/.env` file:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobportal
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Installation & Setup

1. **Install Dependencies:**

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd frontend
   npm install
   ```

2. **Seed Database (Optional):**

   ```bash
   cd backend
   node src/seeds.js
   ```

3. **Start Development Servers:**

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

4. **Access Application:**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
