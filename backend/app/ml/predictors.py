import numpy as np
from .model_loader import load_model

ANOMALY_MAP = {
    0: 'NORMAL',
    1: 'GAS_LOCK',
    2: 'FLUID_POUND',
    3: 'ROD_FLOATING'
}

def production(features):
    """
    RandomForestRegressor Production Forecasting Engine
    """
    model = load_model('production_model.pkl')
    if model is not None:
        names = getattr(model, 'feature_names_in_', [
            'temperature_c', 'pressure_bar', 'watercut', 'oil_viscosity_cp', 
            'spm', 'stroke_m', 'srp_efficiency_pct', 'production_rate'
        ])
        x = [[float(features.get(str(n), 0) or 0) for n in names]]
        try:
            v = float(np.asarray(model.predict(x)).reshape(-1)[0])
            # Model feature importances for explainable AI
            feat_imp = dict(zip(names, [round(float(w), 3) for w in getattr(model, 'feature_importances_', [])]))
            return {
                'available': True,
                'next_day_production': round(v, 2),
                'next_7_day_avg': round(v * 0.985, 2),
                'confidence': 0.96,
                'model': 'RandomForestRegressor (BagheTwin RF_Production_Forecaster)',
                'feature_importance': feat_imp
            }
        except Exception:
            pass

    oil = float(features.get('production_rate', features.get('oil_bopd', 142)) or 142)
    temp = float(features.get('temperature_c', 78) or 78)
    v = max(0, oil * (1 + 0.025 * (temp - 70) / 10))
    return {
        'available': False,
        'next_day_production': round(v, 2),
        'next_7_day_avg': round(v * 0.985, 2),
        'confidence': 0.75,
        'model': 'Fallback Kinematic Estimator'
    }

def anomaly(features):
    """
    RandomForestClassifier Anomaly & Failure Diagnosis Engine
    """
    model = load_model('anomaly_model.pkl')
    if model is not None:
        names = getattr(model, 'feature_names_in_', [
            'rod_load_kn', 'spm', 'stroke_m', 'vfd_hz', 
            'oil_viscosity_cp', 'pressure_bar', 'watercut', 'production_rate'
        ])
        x = [[float(features.get(str(n), 0) or 0) for n in names]]
        try:
            pred_code = int(np.asarray(model.predict(x)).reshape(-1)[0])
            probs = model.predict_proba(x)[0] if hasattr(model, 'predict_proba') else [0.9, 0.03, 0.04, 0.03]
            cond_label = ANOMALY_MAP.get(pred_code, 'NORMAL')
            rod_float_risk = float(probs[3]) if len(probs) > 3 else (0.75 if pred_code == 3 else 0.08)
            
            return {
                'available': True,
                'anomaly_code': pred_code,
                'pump_condition': cond_label,
                'rod_floating_label': 'HIGH' if rod_float_risk > 0.4 else ('MODERATE' if rod_float_risk > 0.15 else 'LOW'),
                'rod_floating_risk': round(rod_float_risk, 3),
                'probabilities': {ANOMALY_MAP.get(i, f'MODE_{i}'): round(float(p), 3) for i, p in enumerate(probs)},
                'model': 'RandomForestClassifier (BagheTwin RF_Anomaly_Detector)'
            }
        except Exception:
            pass

    load = float(features.get('rod_load_kn', 64) or 64)
    spm = float(features.get('spm', 8.5) or 8.5)
    is_anomaly = load > 75 or spm > 13
    return {
        'available': False,
        'pump_condition': 'ANOMALY_DETECTED' if is_anomaly else 'NORMAL',
        'rod_floating_label': 'MODERATE' if is_anomaly else 'LOW',
        'rod_floating_risk': 0.12,
        'model': 'Fallback Threshold Classifier'
    }
