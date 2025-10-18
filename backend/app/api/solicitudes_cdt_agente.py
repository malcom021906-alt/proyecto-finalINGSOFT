# api/solicitudes_cdt_agente.py
from fastapi import APIRouter, Depends, HTTPException, status, Security
from fastapi.security import HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from jose import jwt, JWTError
from typing import List

from app.core.config import settings
from app.core.database import get_database
from app.core.security import bearer_scheme
from app.schemas.solicitudes_cdt_agente import (
    SolicitudAgenteDB,
    RechazoRequest,
    SolicitudCambioEstado,
)
from app.services.solicitudes_cdt_agente import (
    listar_pendientes,
    aprobar_solicitud,
    rechazar_solicitud,
)

router = APIRouter(prefix="/solicitudes/agente", tags=["solicitudes CDT - Agente"])

# --- Extraer datos del token ---
def obtener_datos_token(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)
) -> dict:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Falta Bearer token")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return {
            "user_id": payload.get("sub"),
            "rol": payload.get("rol", "cliente"),
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# --- Listar solicitudes en validación ---
@router.get("/pendientes", response_model=List[SolicitudAgenteDB])
async def obtener_solicitudes_pendientes(
    db: AsyncIOMotorDatabase = Depends(get_database),
    datos_token: dict = Depends(obtener_datos_token),
):
    if datos_token["rol"] not in ["agente", "administrador"]:
        raise HTTPException(status_code=403, detail="Acceso restringido a agentes o administradores")
    return await listar_pendientes(db)

# --- Aprobar solicitud ---
@router.put("/{solicitud_id}/aprobar", response_model=SolicitudCambioEstado)
async def aprobar_solicitud_cdt(
    solicitud_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    datos_token: dict = Depends(obtener_datos_token),
):
    if datos_token["rol"] not in ["agente", "administrador"]:
        raise HTTPException(status_code=403, detail="Solo agentes o administradores pueden aprobar solicitudes")
    return await aprobar_solicitud(db, solicitud_id, datos_token["user_id"])

# --- Rechazar solicitud ---
@router.put("/{solicitud_id}/rechazar", response_model=SolicitudCambioEstado)
async def rechazar_solicitud_cdt(
    solicitud_id: str,
    payload: RechazoRequest,
    db: AsyncIOMotorDatabase = Depends(get_database),
    datos_token: dict = Depends(obtener_datos_token),
):
    if datos_token["rol"] not in ["agente", "administrador"]:
        raise HTTPException(status_code=403, detail="Solo agentes o administradores pueden rechazar solicitudes")
    return await rechazar_solicitud(db, solicitud_id, datos_token["user_id"], payload)
