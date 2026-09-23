from fastapi import APIRouter
from app.ml.model_loader import load_csv

router = APIRouter()

@router.get('')
def list_wells():
    df = load_csv('well_data.csv')
    if df is None or df.empty:
        fallback = [{'well_id': f'BGW-{i:03d}', 'production_rate': 120.0 if i <= 28 else 0.0, 'status': 'Producing' if i <= 28 else 'Ended'} for i in range(1, 36)]
        return {
            'source': 'fallback',
            'total_wells': 35,
            'active_oil_wells': 28,
            'ended_wells': 7,
            'wells': fallback
        }
    
    # Get latest record for each distinct well_id
    latest_df = df.groupby('well_id', sort=False).last().reset_index()
    latest_df['status'] = latest_df['production_rate'].apply(
        lambda r: 'Producing' if float(r or 0) > 0 else 'Ended'
    )
    
    wells_list = latest_df.to_dict('records')
    return {
        'source': 'well_data.csv',
        'total_wells': len(wells_list),
        'active_oil_wells': sum(1 for w in wells_list if w.get('status') == 'Producing'),
        'ended_wells': sum(1 for w in wells_list if w.get('status') == 'Ended'),
        'wells': wells_list
    }
