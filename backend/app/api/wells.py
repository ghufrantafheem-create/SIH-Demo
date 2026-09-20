from fastapi import APIRouter
from app.ml.model_loader import records
router=APIRouter()
@router.get('')
def list_wells():
 r=records('well_data.csv');
 if not r:r=[{'well_id':'BGW-001','production_rate':42,'watercut':31,'pressure_bar':18,'temperature_c':62,'oil_viscosity_cp':1850,'reservoir_condition':'Heavy oil / low mobility','operating_stage':'Production'}]
 return {'source':'well_data.csv','wells':r}
