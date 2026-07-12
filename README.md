<div align="center">
  <h1>🧬 Synthetica</h1>
  <p><strong>A browser-based bioinformatics puzzle game built with Next.js and Flask</strong></p>
</div>

<br />

Synthetica is an interactive, educational puzzle game where players take on the role of a genetic engineer. By synthesizing custom DNA sequences, players design proteins capable of surviving in extreme, simulated alien environments. 

## ✨ Key Features

- **Real-Time DNA Translation Engine:** Client-side evaluation translates DNA codons into amino acid chains in real time, calculating molecular traits like heat stability, hydrophobicity, and toxin resistance.
- **Interactive Genome Editor:** A drag-and-drop terminal interface to mutate DNA bases, visualize resulting proteins, and review biochemical properties via an interactive Codex.
- **Dynamic Environmental Puzzles:** Players must optimize their genetic sequences against strict environmental constraints (e.g., Deep Sea Vents, Acid Pools) with limited mutation budgets.
- **Global Leaderboards:** Competitive scoring based on mutation efficiency and execution time, persisted securely via a cloud database.

## 🏗️ Architecture & Tech Stack

Synthetica is built using a modern, decoupled microservices architecture designed for cloud deployment.

### Frontend
- **Framework:** Next.js (App Router), React
- **Language:** TypeScript
- **State Management:** Zustand
- **Styling & Animations:** CSS Modules, Framer Motion

### Backend
- **Framework:** Python, Flask
- **Database ORM:** SQLAlchemy
- **Driver:** pg8000 (Pure-Python PostgreSQL driver)

### Infrastructure
- **Containerization:** Docker (Multi-stage builds for optimized image sizes)
- **Database:** Azure Database for PostgreSQL (Flexible Server)
- **Hosting:** Azure Container Apps (Serverless containers) & Azure Container Registry

## 🚀 Running Locally

To run the project locally for development or contribution:

### 1. Backend Setup
The backend requires Python 3.9+ and runs using a local SQLite database by default when running locally.

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
python app.py
```
*The Flask API will start on `http://localhost:5000`.*

### 2. Frontend Setup
In a new terminal window, install the Node dependencies and start the Next.js development server:

```bash
npm install
npm run dev
```
*The game will be available at `http://localhost:3000`.*

## ☁️ Deployment

This project is fully containerized and designed for stateless deployment. The included `Dockerfile` in the root directory produces a highly optimized Next.js `standalone` build, while the `backend/Dockerfile` serves the Flask application via Gunicorn.

Both services are configured to run seamlessly on **Azure Container Apps** or any standard Kubernetes/Docker environment.

## 📜 License
This project was built for educational and portfolio purposes. Feel free to fork, explore the code, and submit pull requests!
