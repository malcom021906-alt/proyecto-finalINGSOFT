# schemas/solicitudes_cdt_agente.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# --- Modelo base de solicitud vista por el agente ---
class SolicitudAgenteDB(BaseModel):
    id: str
    usuario_id: str
    monto: int
    plazo_meses: int
    tasa: float
    estado: str
    fechaCreacion: datetime
    fechaActualizacion: datetime
    

    class Config:
        from_attributes = True

# --- Solicitud de rechazo con motivo ---
class RechazoRequest(BaseModel):
    motivo: str = Field(..., min_length=3, description="Razón del rechazo de la solicitud")

# --- Respuesta al aprobar/rechazar ---
class SolicitudCambioEstado(BaseModel):
    id: str
    estado_anterior: str
    estado_nuevo: str
    fechaActualizacion: datetime
    comentario: Optional[str] = None
