# schemas/solicitudes_cdt.py
from pydantic import BaseModel, Field, PositiveInt, condecimal
from typing import Optional
from datetime import datetime

class SolicitudBase(BaseModel):
    monto: PositiveInt = Field(..., description="Monto a invertir en pesos colombianos")
    plazo_meses: PositiveInt = Field(..., description="Duración del CDT en meses")

class SolicitudCreate(SolicitudBase):
    pass  # Se calculan tasa y estado en backend

class SolicitudUpdate(BaseModel):
    monto: Optional[PositiveInt] = None
    plazo_meses: Optional[PositiveInt] = None

class SolicitudDB(SolicitudBase):
    id: str
    usuario_id: str
    tasa: condecimal(max_digits=4, decimal_places=2)
    estado: str
    fechaCreacion: datetime
    fechaActualizacion: datetime

    class Config:
        from_attributes = True