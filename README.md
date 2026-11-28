# Job Application Tracker

A full-stack web application that helps users organize job applications, track each application’s progress, and understand their job-search activity through a clear dashboard.

The application includes secure account registration and login, a personal profile, application management, job-search charts, password recovery, and automatic job-detail extraction from supported job pages.

## Features

- Create a personal account and sign in securely
- Reset a forgotten password through a secure email link
- Add, view, edit, and delete job applications
- Track application statuses: **Applied, Interview, Pending, Declined, or Offer**
- Search applications by job title and filter them by status
- Add the company, location, application date, job link, notes, and job description
- Paste a job URL to attempt automatic extraction of role details
- View a dashboard with:
  - Total applications
  - Status totals
  - Applications by status
  - Applications over time
  - Most recent applications
- Create or update a personal profile and profile image
- Use light or dark mode
- Keep application and profile data private to the logged-in user

## Technology Stack

### Frontend

- React 19
- Vite
- React Router
- Recharts
- React Hot Toast
- Plain CSS

### Backend

- Python
- Django 5
- Django REST Framework
- Simple JWT authentication
- PostgreSQL

### Supporting Services

- Cloudinary for profile image storage
- Google Gemini for AI-assisted job-detail extraction
- Gmail SMTP for password reset emails
- Render for backend hosting
- Vercel for frontend hosting

## Prerequisites

Before setting up the project, install:

- Node.js 18 or newer
- Python 3.11 or newer
- PostgreSQL
- A Cloudinary account
- A Google Gemini API key
- A Gmail account or other SMTP email service

## Local Setup

### 1. Download the project

```bash
git clone <repository-url>
cd "Job Application Tracker Project Fullstack"
```

### 2. Set up PostgreSQL

Create a PostgreSQL database named `jobtracker`, for example:

```sql
CREATE DATABASE jobtracker;
```

The default database username is `postgres`. Update the environment variables below if your PostgreSQL credentials are different.

### 3. Configure the backend

From the project root, create and activate a Python environment:

```powershell
cd Backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
```

Create `Backend/.env` and add the following values:

```env
DJANGO_SECRET_KEY=replace-with-a-secure-random-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

DB_NAME=jobtracker
DB_USER=postgres
DB_PASSWORD=your-postgres-password
DB_HOST=localhost
DB_PORT=5432

GEMINI_API_KEY=your-gemini-api-key

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-app-password
FRONTEND_URL=http://localhost:5173
```

Apply the database migrations:

```powershell
python manage.py migrate
```

Start the backend server:

```powershell
python manage.py runserver
```

The backend will run at `http://localhost:8000`.

### 4. Configure the frontend

Open a new terminal at the project root and install the frontend packages:

```powershell
npm install
```

Create `.env` in the project root and add:

```env
VITE_API_URL=http://localhost:8000
```

Start the frontend:

```powershell
npm run dev
```

Open `http://localhost:5173` in a browser.

## Environment Notes

- `.env` files contain private values and should not be committed to Git.
- `GEMINI_API_KEY` is used for automatic job-detail extraction.
- Cloudinary settings are required to upload profile images.
- Email settings are required for password reset emails.
- PostgreSQL must be running before starting the Django backend.

## Useful Commands

### Frontend

```powershell
npm run dev
npm run build
npm run lint
npm run preview
```

### Backend

```powershell
python manage.py runserver
python manage.py migrate
python manage.py makemigrations
python manage.py createsuperuser
```

## API Documentation

When the backend is running locally, interactive Swagger documentation is available at:


