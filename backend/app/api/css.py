from fastapi import APIRouter
from app.ml.model_loader import records
router=APIRouter()
@router.get('/{well_id}')
def css(well_id:str): return {'latest':(records('css_data.csv',well_id) or [{'well_id':well_id,'steam_volume_t':400,'injection_pressure_bar':30,'soak_hours':48,'production_cutoff_bopd':28}])[-1],'records':records('css_data.csv',well_id)}
