# services/solicitudes_cdt_agente.py
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List, Optional
from fastapi import HTTPException, status

from app.schemas.solicitudes_cdt_agente import RechazoRequest

# --- Listar todas las solicitudes pendientes de validación ---
async def listar_pendientes(db: AsyncIOMotorDatabase) -> List[dict]:
    """
    Retorna solicitudes en estado 'borrador' o 'en_validacion'
    """
    cursor = db["solicitudes_cdt"].find({
        "estado": {"$in": ["borrador", "en_validacion"]},
        "eliminada": {"$ne": True}
    })
    solicitudes = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc["usuario_id"] = str(doc["usuario_id"])
        solicitudes.append(doc)
    return solicitudes

# --- Aprobar una solicitud ---
async def aprobar_solicitud(db: AsyncIOMotorDatabase, solicitud_id: str, agente_id: str) -> dict:
    solicitud = await db["solicitudes_cdt"].find_one({"_id": ObjectId(solicitud_id)})
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    # ✅ Aceptar tanto "borrador" como "en_validacion"
    if solicitud["estado"] not in ["borrador", "en_validacion"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Solo se pueden aprobar solicitudes pendientes. Estado actual: {solicitud['estado']}"
        )

    nuevo_estado = "aprobada"
    await db["solicitudes_cdt"].update_one(
        {"_id": ObjectId(solicitud_id)},
        {"$set": {
            "estado": nuevo_estado,
            "fechaActualizacion": datetime.now(timezone.utc)
        }}
    )

    return {
        "id": str(solicitud_id),
        "estado_anterior": solicitud["estado"],
        "estado_nuevo": nuevo_estado,
        "fechaActualizacion": datetime.now(timezone.utc)
    }

# --- Rechazar una solicitud con motivo ---
async def rechazar_solicitud(db: AsyncIOMotorDatabase, solicitud_id: str, agente_id: str, data: RechazoRequest) -> dict:
    solicitud = await db["solicitudes_cdt"].find_one({"_id": ObjectId(solicitud_id)})
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    # ✅ Aceptar tanto "borrador" como "en_validacion"
    if solicitud["estado"] not in ["borrador", "en_validacion"]:
        raise HTTPException(
            status_code=400,
            detail=f"Solo se pueden rechazar solicitudes pendientes. Estado actual: {solicitud['estado']}"
        )

    nuevo_estado = "rechazada"
    await db["solicitudes_cdt"].update_one(
        {"_id": ObjectId(solicitud_id)},
        {"$set": {
            "estado": nuevo_estado,
            "fechaActualizacion": datetime.now(timezone.utc),
            "motivo_rechazo": data.motivo
        }}
    )

    return {
        "id": str(solicitud_id),
        "estado_anterior": solicitud["estado"],
        "estado_nuevo": nuevo_estado,
        "fechaActualizacion": datetime.now(timezone.utc),
        "comentario": data.motivo
    }