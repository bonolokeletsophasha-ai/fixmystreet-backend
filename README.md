# FixMyStreet – Backend API

## Project Overview

The FixMyStreet backend is a RESTful API responsible for handling authentication, user management, infrastructure reports, image uploads, and database operations.

It connects the frontend application to Supabase and provides endpoints for residents and administrators.

## Features

- User registration and login.
- Authentication using Supabase.
- Role-based authorization.
- Resident and administrator access.
- Infrastructure report creation.
- Retrieve reports belonging to a user's municipality.
- Public report retrieval.
- Report editing and deletion.
- Report status management.
- Image uploads using Supabase Storage.
- Municipality and area information.
- Category management.

## Technologies Used

- Node.js
- Express.js
- JavaScript
- Supabase
- Supabase JavaScript Client
- JSON Web Tokens
- Bcrypt
- Multer
- CORS
- Dotenv

## Project Structure

```text
fixmystreet-backend/
│
├── src/
│   ├── config/
│   │   └── supabase.js
│   │
│   ├── controllers/
│   │
│   ├── middleware/
│   │
│   ├── routes/
│   │
│   └── server.js
│
├── .gitignore
├── package.json
└── package-lock.json
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/bonolokeletsophasha-ai/fixmystreet-backend.git
```

### 2. Navigate into the project

```bash
cd fixmystreet-backend
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the backend root directory.

Add the following variables:

```env
PORT=5000

SUPABASE_URL=your_supabase_project_url

SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

Replace the placeholders with the appropriate Supabase project credentials.

Never commit your `.env` file to GitHub.

### 5. Start the development server

```bash
npm run dev
```

Alternatively, run the production start command:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5000
```

## API Endpoints

The API includes the following endpoint groups:

| Endpoint | Purpose |
|---|---|
| `/api/health` | Check backend health |
| `/api/auth` | Authentication |
| `/api/areas` | Area and municipality information |
| `/api/reports` | Authenticated report management |
| `/api/reports/public` | Public report retrieval |
| `/api/categories` | Report categories |
| `/api` | Province and municipality reference information |

Most report-management endpoints require authentication.

Administrator operations require administrator authorization.

## Database and Storage

FixMyStreet uses Supabase for database management and authentication.

The database stores information such as:

- User profiles
- Municipalities and areas
- Infrastructure reports
- Report categories
- Report statuses

Supabase Storage is used to store photographs attached to infrastructure reports.

The application uses a storage bucket named:

```text
report-images
```

## Security

The backend implements:

- Authentication middleware.
- Administrator authorization middleware.
- Password hashing using Bcrypt.
- Supabase authentication verification.
- Environment-based configuration.
- Municipality-based report access.
- Input validation for report submissions.

The Supabase service-role key must never be exposed in frontend code or committed to GitHub.

Public database access must be controlled through appropriate Row Level Security policies.

## Deployment

The backend can be deployed using Render or another Node.js hosting provider.

Configure the required environment variables in the hosting provider's environment settings.

The frontend must use the deployed backend URL when communicating with the API.

## Project Purpose

The FixMyStreet backend provides the infrastructure required to support a community reporting platform, allowing residents to submit local issues and administrators to manage and track their resolution.

---

**Project:** FixMyStreet  
**Application Type:** RESTful Backend API  
**Backend:** Node.js and Express.js  
**Database:** Supabase