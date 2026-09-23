import csv
import math
import random
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parents[1] / 'data'
DATA_DIR.mkdir(parents=True, exist_ok=True)

# 35 Wells definition: 28 active (have oil), 7 ended
wells = []
for i in range(1, 36):
    well_id = f"BGW-{i:03d}"
    is_active = i <= 28
    wells.append((well_id, is_active))

print(f"Total wells: {len(wells)}")
print(f"Active (have oil): {sum(1 for _, a in wells if a)}")
print(f"Ended: {sum(1 for _, a in wells if not a)}")

# 1. Generate well_data.csv
well_data_path = DATA_DIR / 'well_data.csv'
with open(well_data_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow([
        'well_id', 'production_rate', 'watercut', 'pressure_bar',
        'temperature_c', 'oil_viscosity_cp', 'reservoir_condition', 'operating_stage'
    ])
    
    for well_id, is_active in wells:
        idx = int(well_id.split('-')[1])
        if is_active:
            # Active wells with oil (45 - 185 BOPD)
            base_bopd = 85.0 + 35.0 * math.sin(idx * 0.8) + (idx % 5) * 12.0
            base_temp = 72.0 + 14.0 * math.cos(idx * 0.6)
            base_pres = 32.0 + 8.0 * math.sin(idx * 0.9)
            base_wc = 14.0 + (idx % 7) * 2.8
            base_visc = round(320.0 + (95.0 - base_temp) * 28.0, 1)
            
            stages = ['CYCLE 1', 'CYCLE 2', 'CYCLE 3', 'PRODUCING']
            conds = ['STABLE PRODUCTION', 'THERMALLY STIMULATED', 'PEAK RECOVERY']
            stage = stages[idx % len(stages)]
            cond = conds[idx % len(conds)]
            
            # Generate 7 time-series records for trend history
            for day in range(7):
                day_bopd = round(base_bopd + math.sin(day * 0.5) * 4.5, 1)
                day_temp = round(base_temp + (day - 3) * 0.4, 1)
                day_pres = round(base_pres + (day - 3) * 0.2, 1)
                day_wc = round(base_wc + day * 0.1, 1)
                writer.writerow([
                    well_id, day_bopd, day_wc, day_pres, day_temp,
                    base_visc, cond, stage
                ])
        else:
            # Ended wells (0 BOPD, depleted / watered-out)
            ended_reasons = [
                ('DEPLETED / HIGH WATERCUT', 'WATERED-OUT ENDED'),
                ('DEPLETED / PRESSURE COLLAPSE', 'PRESSURE DEPLETED'),
                ('SAND SEVERED / ENDED', 'CASING ABRASION ENDED'),
                ('MATURE THERMAL DEPLETION', 'CYCLE 8 EXHAUSTED'),
                ('CASING CORROSION COLLAPSE', 'WELLBORE INTEGRITY ENDED'),
                ('ECONOMIC CUTOFF REACHED', 'MARGINAL CUTOFF ENDED'),
                ('FORMATION EXHAUSTED', 'RESERVOIR EXHAUSTED')
            ]
            reason_cond, reason_stage = ended_reasons[(idx - 29) % len(ended_reasons)]
            
            for day in range(7):
                writer.writerow([
                    well_id, 0.0, 99.5, round(8.0 + (idx % 4) * 1.2, 1),
                    round(36.0 + (idx % 3) * 0.8, 1), 28500.0, reason_cond, 'ENDED'
                ])

print("well_data.csv generated successfully.")

# 2. Generate production_data.csv
prod_data_path = DATA_DIR / 'production_data.csv'
with open(prod_data_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['date', 'well_id', 'oil_bopd', 'temperature_c', 'pressure_bar', 'watercut'])
    
    dates = [
        '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20',
        '2026-09-21', '2026-09-22', '2026-09-23'
    ]
    
    for well_id, is_active in wells:
        idx = int(well_id.split('-')[1])
        base_bopd = 85.0 + 35.0 * math.sin(idx * 0.8) + (idx % 5) * 12.0
        base_temp = 72.0 + 14.0 * math.cos(idx * 0.6)
        base_pres = 32.0 + 8.0 * math.sin(idx * 0.9)
        base_wc = 14.0 + (idx % 7) * 2.8
        
        for d_idx, dt in enumerate(dates):
            if is_active:
                bopd = round(base_bopd + math.sin(d_idx) * 4.0, 1)
                temp = round(base_temp + (d_idx - 3) * 0.5, 1)
                pres = round(base_pres + (d_idx - 3) * 0.3, 1)
                wc = round(base_wc + d_idx * 0.1, 1)
            else:
                bopd = 0.0
                temp = round(36.0 + (idx % 3) * 0.8, 1)
                pres = round(8.0 + (idx % 4) * 1.2, 1)
                wc = 99.5
            writer.writerow([dt, well_id, bopd, temp, pres, wc])

print("production_data.csv generated successfully.")

# 3. Generate css_data.csv
css_data_path = DATA_DIR / 'css_data.csv'
with open(css_data_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['well_id', 'steam_volume_t', 'injection_pressure_bar', 'soak_hours', 'production_cutoff_bopd'])
    for well_id, is_active in wells:
        idx = int(well_id.split('-')[1])
        steam_vol = 1200 + (idx % 8) * 60
        inj_pres = round(80.0 + (idx % 6) * 1.5, 1)
        soak_hrs = 120 + (idx % 4) * 24
        cutoff = 25.0
        writer.writerow([well_id, steam_vol, inj_pres, soak_hrs, cutoff])

print("css_data.csv generated successfully.")

# 4. Generate srp_data.csv
srp_data_path = DATA_DIR / 'srp_data.csv'
with open(srp_data_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['well_id', 'stroke_m', 'spm', 'vfd_hz', 'pump_efficiency_pct', 'rod_load_kn', 'rod_position_m'])
    for well_id, is_active in wells:
        idx = int(well_id.split('-')[1])
        if is_active:
            spm = round(7.0 + (idx % 6) * 0.8, 1)
            vfd_hz = round(spm * 5.2, 1)
            eff = round(82.0 + (idx % 5) * 2.5, 1)
            rod_load = round(54.0 + (idx % 7) * 3.2, 1)
        else:
            spm = 0.0
            vfd_hz = 0.0
            eff = 0.0
            rod_load = 18.0
        writer.writerow([well_id, 3.2, spm, vfd_hz, eff, rod_load, 1.9])

print("srp_data.csv generated successfully.")
