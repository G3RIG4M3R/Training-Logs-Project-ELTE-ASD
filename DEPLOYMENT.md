# Deployment Guide

This project is easiest to deploy behind `nginx` on one public IP:

- `nginx` serves the built React frontend on port `80`
- `uvicorn` runs the FastAPI backend on `127.0.0.1:8000`
- `nginx` forwards `/api/*` to the backend

With that setup, the app is reachable at:

- Frontend: `http://46.225.157.46`
- API root: `http://46.225.157.46/api`
- API docs: `http://46.225.157.46/api/docs`

## Why this repo now works in production

- In development, the frontend still talks to `http://localhost:8000`
- In production, the frontend defaults to `/api`
- Backend CORS is configurable with `CORS_ORIGINS`

## Server Steps

Assuming the app lives at `/home/trl/Training-Logs-Project-ELTE-ASD` on the server:

### 1. Install system packages

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nodejs npm nginx
```

### 2. Upload the project

Copy the repository to the server, for example with `scp` or `rsync`.

### 3. Build the backend

```bash
cd /home/trl/Training-Logs-Project-ELTE-ASD/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 4. Build the frontend

```bash
cd /home/trl/Training-Logs-Project-ELTE-ASD/frontend
npm ci
npm run build
```

### 5. Install the systemd service

```bash
sudo cp /home/trl/Training-Logs-Project-ELTE-ASD/deploy/training-logs.service /etc/systemd/system/training-logs.service
sudo systemctl daemon-reload
sudo systemctl enable --now training-logs
sudo systemctl status training-logs
```

### 6. Install the nginx site

```bash
sudo cp /home/trl/Training-Logs-Project-ELTE-ASD/deploy/nginx-training-logs.conf /etc/nginx/sites-available/training-logs
sudo ln -sf /etc/nginx/sites-available/training-logs /etc/nginx/sites-enabled/training-logs
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Open the firewall

If `ufw` is enabled:

```bash
sudo ufw allow 80/tcp
```

## Updating after code changes

```bash
cd /home/trl/Training-Logs-Project-ELTE-ASD/frontend
npm ci
npm run build

cd /home/trl/Training-Logs-Project-ELTE-ASD/backend
source .venv/bin/activate
pip install -r requirements.txt

sudo systemctl restart training-logs
sudo systemctl reload nginx
```

## Docker Compose Deployment

The repo now also supports a containerized deployment path:

- `frontend` serves the built React app on port `80`
- `frontend` proxies `/api/*` to the `backend` container
- `backend` stores SQLite data in the `sqlite_data` Docker volume

### 1. Install Docker

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
```

### 2. If the old host deployment is still running, stop it first

The old deployment also uses port `80`, so it must be stopped before Docker can bind that port:

```bash
sudo systemctl stop nginx
sudo systemctl stop training-logs
```

### 3. Start the containers

```bash
cd /home/trl/Training-Logs-Project-ELTE-ASD
sudo docker compose up -d --build
```

### 4. Check container status

```bash
sudo docker compose ps
sudo docker compose logs --tail=100
```

### 5. Update to a newer version later

```bash
cd /home/trl/Training-Logs-Project-ELTE-ASD
git pull
sudo docker compose up -d --build
```

### 6. Stop or roll back the Docker deployment

```bash
cd /home/trl/Training-Logs-Project-ELTE-ASD
sudo docker compose down
```
