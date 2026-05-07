# Training Logs Backend

FastAPI backend for managing athletes, training sessions, attendance, and performance results with SQLite storage.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

- API docs: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Health check: `http://127.0.0.1:8000/health`

By default, the app creates `backend/training_logs.sqlite3`. Override the database with:

```bash
DATABASE_URL=sqlite:///custom.sqlite3 uvicorn app.main:app --reload
```

## Test

```bash
pytest
```
