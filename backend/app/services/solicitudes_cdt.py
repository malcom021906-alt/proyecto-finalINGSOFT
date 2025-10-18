# services/solicitudes_cdt.py
from datetime import datetime, timedelta, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List, Optional
from fastapi import HTTPException, status

from app.schemas.solicitudes_cdt import SolicitudCreate, SolicitudUpdate

# --- Cálculo automático de tasa ---
def calcular_tasa(monto: int, plazo_meses: int) -> float:
    tasa = 5 + (plazo_meses / 12) * 0.5 + (monto / 1_000_000) * 0.2
    return round(min(tasa, 12), 2)  # máximo 12%

# --- Crear nueva solicitud ---
async def crear_solicitud(db: AsyncIOMotorDatabase, usuario_id: str, data: SolicitudCreate) -> dict:
    print(f"Service: Creating solicitud for user {usuario_id}")
    print(f"Service: Data received - monto: {data.monto}, plazo: {data.plazo_meses}")
    
    if data.monto < 10_000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Monto mínimo es 10000"
        )

    tasa = calcular_tasa(data.monto, data.plazo_meses)
    now = datetime.now(timezone.utc)
    
    doc = {
        "usuario_id": ObjectId(usuario_id),
        "monto": data.monto,
        "plazo_meses": data.plazo_meses,
        "tasa": tasa,
        "estado": "borrador",
        "fechaCreacion": now,
        "fechaActualizacion": now,
        "eliminada": False
    }
    
    print(f"Service: Inserting document: {doc}")
    
    res = await db["solicitudes_cdt"].insert_one(doc)
    doc["_id"] = res.inserted_id
    
    print(f"Service: Created with ID: {res.inserted_id}")
    
    return doc

# --- Listar solicitudes ---
async def listar_solicitudes(db: AsyncIOMotorDatabase, usuario_id: Optional[str] = None) -> List[dict]:
    filtro = {}
    if usuario_id:
        filtro["usuario_id"] = ObjectId(usuario_id)
    
    # Excluir solicitudes eliminadas
    filtro["eliminada"] = {"$ne": True}
    
    cursor = db["solicitudes_cdt"].find(filtro).sort("fechaCreacion", -1)
    resultados = [doc async for doc in cursor]
    return resultados

# --- Actualizar solicitud ---
async def actualizar_solicitud(db: AsyncIOMotorDatabase, solicitud_id: str, data: SolicitudUpdate) -> Optional[dict]:
    print(f"Service: Updating solicitud {solicitud_id}")
    
    solicitud = await db["solicitudes_cdt"].find_one({"_id": ObjectId(solicitud_id)})
    if not solicitud:
        print("Service: Solicitud not found")
        return None
    
    if solicitud["estado"] != "borrador":
        print(f"Service: Cannot update - estado is {solicitud['estado']}")
        return None

    nuevos_campos = {k: v for k, v in data.model_dump().items() if v is not None}
    
    if nuevos_campos:
        if "monto" in nuevos_campos and nuevos_campos["monto"] < 10_000:
            raise HTTPException(status_code=400, detail="Monto mínimo es 10000")

        # Recalcular tasa con los valores actualizados
        monto = nuevos_campos.get("monto", solicitud["monto"])
        plazo = nuevos_campos.get("plazo_meses", solicitud["plazo_meses"])
        nuevos_campos["tasa"] = calcular_tasa(monto, plazo)
        nuevos_campos["fechaActualizacion"] = datetime.now(timezone.utc)
        
        print(f"Service: Updating with fields: {nuevos_campos}")
        
        await db["solicitudes_cdt"].update_one(
            {"_id": ObjectId(solicitud_id)},
            {"$set": nuevos_campos}
        )
        
        solicitud.update(nuevos_campos)
    
    return solicitud

# --- Cancelar solicitud ---
async def cancelar_solicitud(db: AsyncIOMotorDatabase, solicitud_id: str, usuario_id: str) -> bool:
    filtro = {"_id": ObjectId(solicitud_id), "usuario_id": ObjectId(usuario_id)}
    solicitud = await db["solicitudes_cdt"].find_one(filtro)
    
    if not solicitud or solicitud["estado"] not in ["borrador", "en_validacion"]:
        return False
    
    await db["solicitudes_cdt"].update_one(
        filtro,
        {"$set": {"estado": "cancelada", "fechaActualizacion": datetime.now(timezone.utc)}}
    )
    return True

# --- Enviar manualmente a validación ---
async def enviar_a_validacion(db: AsyncIOMotorDatabase, solicitud_id: str, usuario_id: str) -> Optional[dict]:
    filtro = {"_id": ObjectId(solicitud_id), "usuario_id": ObjectId(usuario_id)}
    solicitud = await db["solicitudes_cdt"].find_one(filtro)
    
    if not solicitud or solicitud["estado"] != "borrador":
        return None
    
    await db["solicitudes_cdt"].update_one(
        filtro,
        {"$set": {"estado": "en_validacion", "fechaActualizacion": datetime.now(timezone.utc)}}
    )
    
    solicitud["estado"] = "en_validacion"
    solicitud["fechaActualizacion"] = datetime.now(timezone.utc)
    return solicitud

# --- Cambio automático tras 24 horas ---
async def actualizar_solicitudes_vencidas(db: AsyncIOMotorDatabase):
    """Cambia automáticamente solicitudes en 'borrador' a 'en_validacion' después de 24h."""
    limite = datetime.now(timezone.utc) - timedelta(hours=24)
    await db["solicitudes_cdt"].update_many(
        {"estado": "borrador", "fechaCreacion": {"$lte": limite}, "eliminada": {"$ne": True}},
        {"$set": {"estado": "en_validacion", "fechaActualizacion": datetime.now(timezone.utc)}}
    )

# --- Serializador ---
def serialize_solicitud(doc: dict) -> dict:
    """Serializador básico sin transformación de estados"""
    return {
        "id": str(doc["_id"]),
        "usuario_id": str(doc["usuario_id"]),
        "monto": doc["monto"],
        "plazo_meses": doc["plazo_meses"],
        "tasa": doc["tasa"],
        "estado": doc["estado"],
        "fechaCreacion": doc.get("fechaCreacion"),
        "fechaActualizacion": doc.get("fechaActualizacion"),
        "razon_cancelacion": doc.get("razon_cancelacion"),
    }