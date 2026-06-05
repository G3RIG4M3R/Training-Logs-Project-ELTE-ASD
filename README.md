# Training-Logs-Project-ELTE-ASD
Training Logs is a lightweight web application for managing athletic training data, developed as a team project for the ELTE Advanced Software Development course. It enables coaches to record attendance, track performance results, and manage athlete information in one place, replacing manual paper and spreadsheet workflows.

## Project Structure

- `backend/` - FastAPI backend
- `frontend/` - React + TypeScript frontend (Vite)

---

## Run Backend (FastAPI)

```powershell
cd backend

# Create virtual environment
py -m venv .venv

# Activate it
.\.venv\Scripts\activate

# Install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Run server
uvicorn main:app --reload