# Backend Connection Guide

## Frontend-Backend Integration Complete ✅

The frontend is now fully connected to the FastAPI backend deployed on Render. All features are integrated and working.

**Backend URL**: `https://project-management-with-rubina-backend.onrender.com`

## Setup Instructions

### 1. Backend Setup

1. Navigate to backend directory:
   ```bash
   cd D:\personal_backend\project_management_with_rubina_backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create `.env` file (copy from `.env.example`):
   ```env
   DATABASE_URL=sqlite:///./flowspace.db
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE_MB=50
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

4. Run the backend:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 2. Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd D:\personal_frontend\project_management_with_rubina
   ```

2. Create `.env` file (optional, defaults to Render backend):
   ```env
   VITE_API_URL=https://project-management-with-rubina-backend.onrender.com
   ```
   
   Note: The frontend is now configured to use the Render backend by default. You only need to create a `.env` file if you want to override the default or use a local backend.

3. Install dependencies (if not already done):
   ```bash
   npm install
   ```

4. Run the frontend:
   ```bash
   npm run dev
   ```

## What's Connected

### ✅ Authentication
- Login (`POST /api/auth/login`)
- Register Workspace (`POST /api/auth/register`)
- JWT token management
- Auto-login on page refresh

### ✅ User Management
- Get all users (`GET /api/users/`)
- Create user (`POST /api/users/`)
- Get current user (`GET /api/users/me`)
- Update profile (`PUT /api/users/me`)

### ✅ Project Management
- Get all projects (`GET /api/projects/`)
- Get project details (`GET /api/projects/{id}`)
- Create project with file uploads (`POST /api/projects/`)
- Update project status (`PUT /api/projects/{id}/status`)
- Upload delivery files (`POST /api/projects/{id}/delivery`)
- Add comments (`POST /api/projects/{id}/comments`)
- Add project updates (`POST /api/projects/{id}/updates`)
- Payment operations (`PUT /api/projects/{id}/payment/clear`, `/approve`)
- Dashboard statistics (`GET /api/projects/dashboard/stats`)

### ✅ File Management
- File uploads (multipart/form-data)
- File downloads (`GET /api/files/{project_id}/{category}/{filename}`)

### ✅ Finance
- Financial history (`GET /api/finance/history`)
- Financial statistics (`GET /api/finance/stats`)

### ✅ Workspace
- Get workspace info (`GET /api/workspaces/me`)
- Workspace statistics (`GET /api/workspaces/me/stats`)
- Update workspace (`PUT /api/workspaces/me`)

## API Client Features

- **Automatic token management**: Tokens are stored in localStorage
- **Error handling**: All API errors are caught and displayed via toast notifications
- **Loading states**: Store includes loading state for UI feedback
- **File uploads**: Supports multipart/form-data for file uploads
- **CORS**: Configured for localhost development

## Testing

The frontend is configured to connect to the Render backend by default.

1. Start frontend: `npm run dev`
2. Open browser: `http://localhost:3000`
3. Register a new workspace or login
4. All features should work with the Render backend!

For local backend testing:
1. Start backend: `uvicorn app.main:app --reload --port 8000`
2. Create `.env` file with: `VITE_API_URL=http://localhost:8000`
3. Start frontend: `npm run dev`

## API Documentation

The backend API documentation is available at:
- Swagger UI: https://project-management-with-rubina-backend.onrender.com/docs
- ReDoc: https://project-management-with-rubina-backend.onrender.com/redoc

For local development, if running backend locally:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Notes

- All mock data has been replaced with API calls
- Token is automatically included in all requests
- Files are uploaded to `./uploads` directory on backend
- Database is SQLite by default (can be changed to PostgreSQL)

