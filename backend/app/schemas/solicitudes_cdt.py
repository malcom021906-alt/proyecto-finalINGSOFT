# app/schemas/solicitudes_cdt.py
from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional

class SolicitudCreate(BaseModel):
    monto: int = Field(..., ge=10000, description="Monto mínimo 10,000")
    plazo_meses: int = Field(..., ge=1, le=60, description="Plazo entre 1 y 60 meses")
    
    @validator('monto')
    def validar_monto(cls, v):
        if v < 10000:
            raise ValueError('El monto mínimo es 10,000')
        return v
    
    @validator('plazo_meses')
    def validar_plazo(cls, v):
        if v < 1 or v > 60:
            raise ValueError('El plazo debe estar entre 1 y 60 meses')
        return v

class SolicitudUpdate(BaseModel):
    monto: Optional[int] = Field(None, ge=10000)
    plazo_meses: Optional[int] = Field(None, ge=1, le=60)
    
    @validator('monto')
    def validar_monto(cls, v):
        if v is not None and v < 10000:
            raise ValueError('El monto mínimo es 10,000')
        return v
    
    @validator('plazo_meses')
    def validar_plazo(cls, v):
        if v is not None and (v < 1 or v > 60):
            raise ValueError('El plazo debe estar entre 1 y 60 meses')
        return v

class SolicitudDB(BaseModel):
    id: str
    usuario_id: str
    monto: int
    plazo_meses: int
    tasa: float
    estado: str
    fechaCreacion: datetime
    fechaActualizacion: datetime
    razon_cancelacion: Optional[str] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }