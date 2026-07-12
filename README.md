# 🧬 Synthetica

Synthetica is an interactive, browser-based bioinformatics puzzle game. Players take on the role of a genetic engineer, synthesizing custom DNA sequences to create proteins that can survive in extreme alien environments. 

## 🏗️ Architecture

Synthetica is built on a modern, containerized full-stack architecture:

- **Frontend:** Next.js (App Router), React, TypeScript, Zustand, Framer Motion
- **Backend:** Python, Flask, SQLAlchemy, pg8000
- **Database:** PostgreSQL Flexible Server
- **Infrastructure:** Microsoft Azure (Container Apps, Container Registry)

## 🎮 Features

- **DNA Translation Engine:** Real-time client-side and server-side translation of DNA codons into amino acid sequences.
- **Environmental Puzzles:** Various environments (e.g., Deep Sea Vents, Acid Pools) with unique survival requirements (Heat Stability, Hydrophobicity, Toxin Resistance).
- **Interactive Genome Editor:** A drag-and-drop/click interface to mutate DNA bases in real-time.
- **Global Leaderboards:** Competitive scoring based on mutation efficiency and time taken, stored securely in a PostgreSQL database.
- **Genome Codex:** An in-game interactive database of amino acid properties and codon combinations.

## 🚀 Running Locally

You can run both the frontend and backend locally for development.

### 1. Start the Flask Backend
The backend runs on Python and uses a local SQLite database by default when running locally.

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python app.py
```
*The API will start on `http://localhost:5000`.*

### 2. Start the Next.js Frontend
In a new terminal window, start the frontend development server:

```bash
npm install
npm run dev
```
*The game will be available at `http://localhost:3000`.*

## ☁️ Azure Cloud Deployment

Synthetica is fully containerized using Docker and is configured for deployment on **Azure Container Apps**.

### Prerequisites
- Docker Desktop installed locally
- An active Azure Subscription
- An Azure Container Registry (e.g., `syntheicaregistry`)

### Deploying the Backend
1. Build the backend image:
   ```bash
   cd backend
   docker build -t <your-registry-url>/backend:v1 .
   ```
2. Push the image:
   ```bash
   docker push <your-registry-url>/backend:v1
   ```
3. Deploy to Azure Container Apps, exposing port `5000` and setting the `DATABASE_URL` environment variable to your Azure PostgreSQL instance.

### Deploying the Frontend
The frontend requires the backend API URL at build time.
1. Build the frontend image from the root directory:
   ```bash
   docker build --build-arg NEXT_PUBLIC_API_URL=https://<your-backend-app-url>/api -t <your-registry-url>/frontend:v1 .
   ```
2. Push the image:
   ```bash
   docker push <your-registry-url>/frontend:v1
   ```
3. Deploy to Azure Container Apps, exposing port `3000`.
