from fastapi import APIRouter
from app.ml.model_loader import records
router=APIRouter()
@router.get('/{well_id}')
def srp(well_id:str):
 r=records('srp_data.csv',well_id) or [{'well_id':well_id,'stroke_m':2.8,'spm':5.5,'vfd_hz':45,'pump_efficiency_pct':78,'rod_load_kn':32,'rod_position_m':1.4}]
 return {'latest':r[-1],'records':records('srp_data.csv',well_id) or r}
