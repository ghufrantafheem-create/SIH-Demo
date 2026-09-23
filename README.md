# BagheTwin — Heavy-Oil Digital Twin & Optimization Suite

BagheTwin is an AI/ML-driven Digital Twin dashboard for **Cyclic Steam Stimulation (CSS)** and **Sucker Rod Pump (SRP)** heavy-oil well optimization in the **Baghewala Field** (Rajasthan).

## Features & Theme
- **Glassification UI**: Ultra-modern frosted glass theme with multi-layered translucency, specular light sheen, and crisp responsive layouts.
- **Real-Time Kinematic Simulation**: Live Sucker Rod Pump (SRP) walking beam mechanical motion, traveling/standing valve kinematics, and real-time Dynagraph load-position card tracing.
- **CFD Thermal Diffusion Visualizer**: Dynamic Cyclic Steam Stimulation (CSS) heat dispersion plume, steam flow pulse animation, and reservoir viscosity reduction analytics.
- **Interactive Anomaly Simulator**: Instant simulation of downhole failure modes (Gas Lock, Fluid Pound, Rod Floating Risk).
- **Normal OS Cursor**: Standard, responsive cursor controls.

## Stack
- **Frontend**: React + TypeScript + Tailwind CSS + Framer Motion + Recharts + Lucide Icons + Vite
- **Backend**: Python + FastAPI + SQLAlchemy
- **Database**: SQLite / PostgreSQL
- **ML Engine**: Scikit-learn/joblib production forecasting, anomaly classification, and closed-loop optimization solvers

## Run with Docker
1. Install Docker Desktop.
2. From this folder run: `docker compose up --build`
3. Open `http://localhost:5173`

Demo accounts:
- Admin: `admin@baghetwin.local` / `admin123`
- User: `user@baghetwin.local` / `user123`

## Main Flow
Login → Dashboard (Live Telemetry & Real-Time SRP Kinematics) → Wells → CSS Optimization → SRP Optimization → Predictions → Anomalies → About Us.
