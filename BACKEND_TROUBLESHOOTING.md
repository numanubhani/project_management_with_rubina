# Backend Troubleshooting Guide

## Database Error: "no such table: users"

If you encounter a **500 Internal Server Error** with the message:
```
sqlite3.OperationalError) no such table: users
```

This means the backend database tables have not been created yet. This is a **backend configuration issue** that needs to be fixed on the Render deployment.

## Solution

The backend needs to run database migrations or initialize the database tables. Here's how to fix it:

### Option 1: Run Migrations on Render (Recommended)

1. **Access Render Dashboard**: Go to your Render dashboard for the backend service
2. **Check Build/Start Commands**: Ensure your backend has a startup script that runs migrations
3. **Add Migration Command**: The backend should run migrations before starting. Common approaches:

   **If using Alembic (Python migrations):**
   ```bash
   alembic upgrade head
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

   **Or if creating tables programmatically:**
   - Ensure your FastAPI app creates tables on startup
   - Check if you have a `startup` event handler that creates tables

4. **Check Backend Code**: Look for database initialization code in your backend:
   - `alembic/` directory with migration files
   - `app/db.py` or similar file with table creation
   - `app/main.py` with startup events

### Option 2: Manual Database Initialization

If your backend doesn't auto-create tables, you need to:

1. **SSH into Render instance** (if available) or
2. **Add a one-time initialization script** that runs on first deploy
3. **Run the migration command manually**:
   ```bash
   alembic upgrade head
   ```
   OR if using SQLAlchemy directly:
   ```python
   from app.database import Base, engine
   Base.metadata.create_all(bind=engine)
   ```

### Option 3: Backend Code Fix

Ensure your backend's `main.py` or startup file includes:

```python
from app.database import Base, engine
from app import models  # Import all models to register them

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)
```

OR use Alembic migrations:

```python
from alembic.config import Config
from alembic import command

@app.on_event("startup")
async def startup_event():
    alembic_cfg = Config("alembic.ini")
    command.upgrade(alembic_cfg, "head")
```

## Backend Files to Check

Navigate to your backend repository (`D:\personal_backend\project_management_with_rubina_backend`) and check:

1. **`app/main.py`** - Should have startup event handlers
2. **`alembic/`** - Migration directory (if using Alembic)
3. **`app/database.py`** or **`app/db.py`** - Database connection setup
4. **`requirements.txt`** - Should include `alembic` if using migrations
5. **`.env` or Render environment variables** - Database URL configuration

## Render Environment Variables

Ensure these are set in Render:
- `DATABASE_URL` - Your database connection string
- `SECRET_KEY` - For JWT tokens
- Any other required environment variables

## Quick Test

After fixing the backend, test the API:
```bash
curl -X 'POST' \
  'https://project-management-with-rubina-backend.onrender.com/api/auth/register' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "workspace_name": "Test Workspace",
  "admin_name": "Test User",
  "email": "test@example.com",
  "password": "TestPassword123!"
}'
```

## Frontend Error Handling

The frontend has been updated to show user-friendly error messages when this error occurs. Users will see:
> "Database tables not initialized. Please contact the backend administrator to run database migrations."

## Need Help?

1. Check the backend repository logs on Render
2. Review the backend startup logs for any database-related errors
3. Ensure all database models are imported before creating tables
4. Verify the database connection string is correct

