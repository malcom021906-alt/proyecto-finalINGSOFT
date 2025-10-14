# api/solicitudes_cdt.py
from fastapi import APIRouter, Depends, HTTPException, status, Security, Header
from fastapi.security import HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from jose import jwt, JWTError
from typing import List

from app.core.config import settings
from app.core.database import get_database
from app.core.security import bearer_scheme
from app.schemas.solicitudes_cdt import SolicitudCreate, SolicitudUpdate, SolicitudDB
from app.services.solicitudes_cdt import (
    crear_solicitud,
    listar_solicitudes,
    actualizar_solicitud,
    cancelar_solicitud,
    enviar_a_validacion,
)

router = APIRouter(prefix="/solicitudes", tags=["solicitudes CDT"])

# --- Decodifica el JWT y obtiene el ID del usuario ---
def obtener_usuario_id(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)
) -> str:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Falta Bearer token")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# --- Crear nueva solicitud ---
@router.post("/", response_model=SolicitudDB, status_code=201)
async def crear_nueva_solicitud(
    payload: SolicitudCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(obtener_usuario_id),
):
    solicitud = await crear_solicitud(db, user_id, payload)
    return solicitud

# --- Listar solicitudes ---
@router.get("/", response_model=List[SolicitudDB])
async def listar_mis_solicitudes(
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(obtener_usuario_id),
    rol: str = Header("cliente"),
):
    # Si el rol es agente o administrador, puede ver todas
    if rol in ["agente", "administrador"]:
        return await listar_solicitudes(db)
    else:
        return await listar_solicitudes(db, user_id)

# --- Actualizar solicitud en borrador ---
@router.put("/{solicitud_id}", response_model=SolicitudDB)
async def actualizar_solicitud_existente(
    solicitud_id: str,
    payload: SolicitudUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    updated = await actualizar_solicitud(db, solicitud_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede modificar la solicitud (no encontrada o no está en estado de borrador)",
        )
    return updated

# --- Enviar solicitud a validación manualmente ---
@router.put("/{solicitud_id}/enviar", response_model=SolicitudDB)
async def enviar_a_validacion_manual(
    solicitud_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(obtener_usuario_id),
):
    solicitud = await enviar_a_validacion(db, solicitud_id, user_id)
    if not solicitud:
        raise HTTPException(
            status_code=400,
            detail="Solo se pueden enviar solicitudes en estado 'borrador'."
        )
    return solicitud

# --- Cancelar solicitud ---
@router.delete("/{solicitud_id}", status_code=204)
async def cancelar_mi_solicitud(
    solicitud_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(obtener_usuario_id),
):
    ok = await cancelar_solicitud(db, solicitud_id, user_id)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede cancelar (no encontrada o estado inválido)",
        )

