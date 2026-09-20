# SIH26120 Digital Twin — CSS & SRP Optimization

Prototype built from the supplied SIH26120 reference PDF and the supplied starter ZIP.

## Stack
- Frontend: React + TypeScript + Tailwind CSS + Recharts
- Backend: Python + FastAPI + SQLAlchemy
- Database: PostgreSQL
- ML: scikit-learn/joblib-compatible production and anomaly model hooks plus risk-aware optimization services

## Run with Docker
1. Install Docker Desktop.
2. From this folder run: `docker compose up --build`
3. Open `http://localhost:5173`

Demo accounts:
- Admin: `admin@sih26120.local` / `admin123`
- User: `user@sih26120.local` / `user123`

## Dataset/model note
The supplied ZIP did not contain project-specific `well_data.csv`, `css_data.csv`, `srp_data.csv`, `production_model.pkl`, or `anomaly_model.pkl`; it contained placeholders for those assets. This package therefore includes small demo CSVs so the UI is immediately functional and keeps model-loading hooks ready for the real SIH datasets/models. Replace the demo CSVs with the actual datasets and put the trained `.pkl` files in `backend/models/` to use the real models.

## Main flow
Login → Dashboard → Wells / CSS Optimization / SRP Optimization / Predictions / Anomalies / About Us.
The dashboard includes the requested top-right profile/username and a fixed sidebar ribbon/menu.
