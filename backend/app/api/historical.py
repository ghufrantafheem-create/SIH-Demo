from fastapi import APIRouter, Query
from typing import Optional
from app.ml.model_loader import records

router = APIRouter()

@router.get('/')
def get_historical(well_id: Optional[str] = None, days: int = Query(90, ge=1, le=90)):
    """
    Returns historical telemetry records for BagheTwin multi-well analytics.
    """
    all_records = records('historical_telemetry_90d.csv', well_id)
    if not all_records:
        # Fallback to production_data.csv if master dataset not present
        all_records = records('production_data.csv', well_id)
    
    # Filter by days
    sliced = all_records[-days:] if len(all_records) > days else all_records
    return {
        'count': len(sliced),
        'well_id': well_id or 'ALL',
        'records': sliced
    }
