"""
BagheTwin ML Model Training & Dataset Generator
Trains 4 scikit-learn RandomForest models on heavy-oil well physics datasets:
1. RF_Production_Forecaster (RandomForestRegressor): Next-Day Oil BOPD Forecast
2. RF_Anomaly_Detector (RandomForestClassifier): Downhole Anomaly Diagnosis
3. RF_CSS_Optimizer (RandomForestRegressor): Steam-Oil Ratio & Thermal Yield
4. RF_SRP_Efficiency_Model (RandomForestRegressor): Volumetric & Mechanical Efficiency
"""

import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, accuracy_score

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / 'models'
DATA_DIR = BASE_DIR / 'data'

MODEL_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)

np.random.seed(42)

def generate_synthetic_baghewala_dataset(n_samples=1200):
    """
    Generates physically consistent multi-parameter heavy oil dataset 
    calibrated for Baghewala Field (Rajasthan) CSS & SRP wells.
    """
    # Well identifiers
    wells = ['BGW-001', 'BGW-002', 'BGW-003']
    well_assignments = np.random.choice(wells, size=n_samples)

    # Base reservoir & wellbore physics
    depth_m = np.random.uniform(920, 1050, size=n_samples)
    base_viscosity = np.where(well_assignments == 'BGW-001', 1850, np.where(well_assignments == 'BGW-002', 2010, 1710))
    temperature_c = np.random.uniform(55, 95, size=n_samples)
    pressure_bar = np.random.uniform(15, 45, size=n_samples)
    watercut = np.clip(np.random.normal(28, 8, size=n_samples), 5, 65)

    # Thermal effect on viscosity (Arrhenius relationship)
    oil_viscosity_cp = base_viscosity * np.exp(-0.045 * (temperature_c - 60)) + np.random.normal(0, 25, size=n_samples)
    oil_viscosity_cp = np.clip(oil_viscosity_cp, 30, 2500)

    # CSS Steam stimulation parameters
    steam_volume_t = np.random.uniform(800, 1800, size=n_samples)
    injection_pressure_bar = np.random.uniform(70, 95, size=n_samples)
    soak_hours = np.random.uniform(72, 168, size=n_samples)
    css_cycle = np.random.randint(1, 6, size=n_samples)

    # Expected SOR (Steam-Oil Ratio)
    expected_sor = 1.6 + 0.0006 * steam_volume_t + 0.008 * (100 - temperature_c) + 0.15 * css_cycle + np.random.normal(0, 0.1, size=n_samples)
    expected_sor = np.clip(expected_sor, 1.4, 4.5)

    # SRP Mechanical lifting parameters
    spm = np.random.uniform(4.0, 14.0, size=n_samples)
    stroke_m = np.random.uniform(2.0, 4.2, size=n_samples)
    vfd_hz = spm * 5.0 + np.random.normal(0, 1.2, size=n_samples)
    rod_load_kn = 25.0 + 3.2 * stroke_m + 1.8 * spm + 0.015 * oil_viscosity_cp + np.random.normal(0, 2.5, size=n_samples)
    rod_position_m = stroke_m * 0.6 + np.random.normal(0, 0.1, size=n_samples)

    # SRP Volumetric & Mechanical Efficiency (%)
    srp_efficiency_pct = 95.0 - (oil_viscosity_cp / 150.0) - (spm * 1.2) - (watercut * 0.15) + np.random.normal(0, 2.0, size=n_samples)
    srp_efficiency_pct = np.clip(srp_efficiency_pct, 45.0, 98.0)

    # Daily Production Rate (BOPD)
    production_rate = (
        (120.0 * (temperature_c / 75.0)) * 
        (1.0 - watercut / 100.0) * 
        (srp_efficiency_pct / 100.0) * 
        (spm / 8.0) * (stroke_m / 3.0) +
        np.random.normal(0, 4.0, size=n_samples)
    )
    production_rate = np.clip(production_rate, 15.0, 260.0)

    # Next-Day Production Target
    next_day_production = production_rate * (1.0 + 0.02 * (temperature_c - 70) / 10 - 0.015 * (spm - 8)) + np.random.normal(0, 2.0, size=n_samples)
    next_day_production = np.clip(next_day_production, 10.0, 280.0)

    # Anomaly classification (0: Normal, 1: Gas Lock, 2: Fluid Pound, 3: Rod Floating)
    anomaly_labels = []
    for i in range(n_samples):
        if oil_viscosity_cp[i] > 1200 and spm[i] > 10.0:
            anomaly_labels.append(3) # Rod Floating
        elif watercut[i] > 45.0 and spm[i] > 11.0:
            anomaly_labels.append(2) # Fluid Pound
        elif pressure_bar[i] < 18.0 and temperature_c[i] > 85.0 and np.random.rand() > 0.4:
            anomaly_labels.append(1) # Gas Lock
        else:
            anomaly_labels.append(0) # Normal
    anomaly_target = np.array(anomaly_labels)

    df = pd.DataFrame({
        'well_id': well_assignments,
        'temperature_c': np.round(temperature_c, 2),
        'pressure_bar': np.round(pressure_bar, 2),
        'watercut': np.round(watercut, 2),
        'oil_viscosity_cp': np.round(oil_viscosity_cp, 1),
        'steam_volume_t': np.round(steam_volume_t, 1),
        'injection_pressure_bar': np.round(injection_pressure_bar, 2),
        'soak_hours': np.round(soak_hours, 1),
        'css_cycle': css_cycle,
        'spm': np.round(spm, 2),
        'stroke_m': np.round(stroke_m, 2),
        'vfd_hz': np.round(vfd_hz, 2),
        'rod_load_kn': np.round(rod_load_kn, 2),
        'rod_position_m': np.round(rod_position_m, 2),
        'srp_efficiency_pct': np.round(srp_efficiency_pct, 2),
        'expected_sor': np.round(expected_sor, 3),
        'production_rate': np.round(production_rate, 2),
        'next_day_production': np.round(next_day_production, 2),
        'anomaly_code': anomaly_target
    })
    return df

def train_and_save_all_models():
    print("Generating Baghewala calibration dataset...")
    df = generate_synthetic_baghewala_dataset(2000)

    # 1. Model 1: Production Forecaster (RandomForestRegressor)
    prod_features = ['temperature_c', 'pressure_bar', 'watercut', 'oil_viscosity_cp', 'spm', 'stroke_m', 'srp_efficiency_pct', 'production_rate']
    X_prod = df[prod_features]
    y_prod = df['next_day_production']

    X_train_p, X_test_p, y_train_p, y_test_p = train_test_split(X_prod, y_prod, test_size=0.2, random_state=42)
    rf_prod = RandomForestRegressor(n_estimators=120, max_depth=12, random_state=42, n_jobs=-1)
    rf_prod.fit(X_train_p, y_train_p)
    r2_p = r2_score(y_test_p, rf_prod.predict(X_test_p))
    print(f"[OK] Model 1: RF_Production_Forecaster R2 Score: {r2_p:.4f}")
    joblib.dump(rf_prod, MODEL_DIR / 'production_model.pkl')

    # 2. Model 2: Anomaly Classifier (RandomForestClassifier)
    anom_features = ['rod_load_kn', 'spm', 'stroke_m', 'vfd_hz', 'oil_viscosity_cp', 'pressure_bar', 'watercut', 'production_rate']
    X_anom = df[anom_features]
    y_anom = df['anomaly_code']

    X_train_a, X_test_a, y_train_a, y_test_a = train_test_split(X_anom, y_anom, test_size=0.2, random_state=42)
    rf_anom = RandomForestClassifier(n_estimators=140, max_depth=10, random_state=42, n_jobs=-1)
    rf_anom.fit(X_train_a, y_train_a)
    acc_a = accuracy_score(y_test_a, rf_anom.predict(X_test_a))
    print(f"[OK] Model 2: RF_Anomaly_Detector Accuracy: {acc_a * 100:.2f}%")
    joblib.dump(rf_anom, MODEL_DIR / 'anomaly_model.pkl')

    # 3. Model 3: CSS Optimizer (RandomForestRegressor for SOR)
    css_features = ['steam_volume_t', 'injection_pressure_bar', 'soak_hours', 'temperature_c', 'oil_viscosity_cp', 'css_cycle']
    X_css = df[css_features]
    y_css = df['expected_sor']

    X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_css, y_css, test_size=0.2, random_state=42)
    rf_css = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42, n_jobs=-1)
    rf_css.fit(X_train_c, y_train_c)
    r2_c = r2_score(y_test_c, rf_css.predict(X_test_c))
    print(f"[OK] Model 3: RF_CSS_Optimizer R2 Score: {r2_c:.4f}")
    joblib.dump(rf_css, MODEL_DIR / 'css_optimization_model.pkl')

    # 4. Model 4: SRP Efficiency Predictor (RandomForestRegressor)
    srp_features = ['spm', 'stroke_m', 'vfd_hz', 'rod_load_kn', 'oil_viscosity_cp', 'watercut']
    X_srp = df[srp_features]
    y_srp = df['srp_efficiency_pct']

    X_train_s, X_test_s, y_train_s, y_test_s = train_test_split(X_srp, y_srp, test_size=0.2, random_state=42)
    rf_srp = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42, n_jobs=-1)
    rf_srp.fit(X_train_s, y_train_s)
    r2_s = r2_score(y_test_s, rf_srp.predict(X_test_s))
    print(f"[OK] Model 4: RF_SRP_Efficiency_Model R2 Score: {r2_s:.4f}")
    joblib.dump(rf_srp, MODEL_DIR / 'srp_efficiency_model.pkl')

    # 5. Populate realistic 90-day historical data files
    print("Populating multi-well 90-day historical data CSVs...")
    
    # 90-day chronological logs
    dates = pd.date_range(end=pd.Timestamp.now(), periods=90, freq='D')
    historical_records = []
    for well in ['BGW-001', 'BGW-002', 'BGW-003']:
        for i, d in enumerate(dates):
            base_temp = 65.0 + (i % 30) * 0.6 if well == 'BGW-001' else 60.0 + (i % 25) * 0.8
            base_visc = 1900.0 * np.exp(-0.04 * (base_temp - 60))
            bopd = 110.0 + (base_temp - 60) * 1.8 + np.sin(i / 5.0) * 8.0
            historical_records.append({
                'date': d.strftime('%Y-%m-%d'),
                'well_id': well,
                'production_rate': round(bopd, 1),
                'oil_bopd': round(bopd, 1),
                'watercut': round(24.0 + (i * 0.08) % 15.0, 1),
                'pressure_bar': round(32.0 + np.sin(i / 7.0) * 4.0, 1),
                'temperature_c': round(base_temp, 1),
                'oil_viscosity_cp': round(base_visc, 1),
                'reservoir_condition': 'THERMALLY STIMULATED' if base_temp > 75 else 'STABLE PRODUCTION',
                'operating_stage': f'CYCLE {(i // 30) + 1}',
                'spm': round(8.0 + np.sin(i / 10.0) * 1.5, 1),
                'stroke_m': 3.2,
                'vfd_hz': round(42.0 + np.sin(i / 10.0) * 4.0, 1),
                'pump_efficiency_pct': round(86.0 + np.cos(i / 8.0) * 6.0, 1),
                'rod_load_kn': round(58.0 + np.sin(i / 6.0) * 5.0, 1),
                'rod_position_m': 1.9,
                'steam_volume_t': round(1200 + (i % 30) * 15, 1),
                'injection_pressure_bar': round(82.0 + np.sin(i / 12.0) * 4.0, 1),
                'soak_hours': 120,
                'production_cutoff_bopd': 25.0
            })

    df_hist = pd.DataFrame(historical_records)

    # Save CSVs
    df_hist[['well_id', 'production_rate', 'watercut', 'pressure_bar', 'temperature_c', 'oil_viscosity_cp', 'reservoir_condition', 'operating_stage']].to_csv(DATA_DIR / 'well_data.csv', index=False)
    df_hist[['date', 'well_id', 'oil_bopd', 'temperature_c', 'pressure_bar', 'watercut']].to_csv(DATA_DIR / 'production_data.csv', index=False)
    df_hist[['well_id', 'steam_volume_t', 'injection_pressure_bar', 'soak_hours', 'production_cutoff_bopd']].to_csv(DATA_DIR / 'css_data.csv', index=False)
    df_hist[['well_id', 'stroke_m', 'spm', 'vfd_hz', 'pump_efficiency_pct', 'rod_load_kn', 'rod_position_m']].to_csv(DATA_DIR / 'srp_data.csv', index=False)
    
    # Save full historical master dataset for analytics panel
    df_hist.to_csv(DATA_DIR / 'historical_telemetry_90d.csv', index=False)
    print("[OK] Successfully created and saved all models and datasets!")

if __name__ == '__main__':
    train_and_save_all_models()
