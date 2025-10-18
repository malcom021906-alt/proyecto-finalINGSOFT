# api/solicitudes_cdt.py
from fastapi import APIRouter, Depends, HTTPException, status, Security, Query
from fastapi.security import HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from jose import jwt, JWTError
from typing import List, Optional

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
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token no contiene user_id")
        return user_id
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")

# --- Crear nueva solicitud ---
@router.post("/", status_code=201)
async def crear_nueva_solicitud(
    payload: SolicitudCreate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(obtener_usuario_id),
):
    print(f"Creating solicitud for user: {user_id}")
    print(f"Payload: {payload}")
    
    solicitud = await crear_solicitud(db, user_id, payload)
    
    # Devolver en formato normalizado
    return serialize_solicitud_normalizada(solicitud)

# --- Listar solicitudes con paginación y filtros ---
@router.get("/")
async def listar_mis_solicitudes(
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(obtener_usuario_id),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    estado: Optional[str] = None,
    desde: Optional[str] = None,
    hasta: Optional[str] = None,
    montoMin: Optional[int] = None,
    q: Optional[str] = None,
):
    """
    Lista las solicitudes del usuario con paginación y filtros.
    Devuelve formato: {items: [...], total: X}
    """
    from bson import ObjectId
    from datetime import datetime
    
    # Construir filtro base por usuario
    filtro = {"usuario_id": ObjectId(user_id)}
    
    # Aplicar filtros adicionales
    if estado:
        # Normalizar estado a minúsculas para comparación
        filtro["estado"] = estado.lower()
    
    if desde:
        try:
            fecha_desde = datetime.fromisoformat(desde.replace("Z", "+00:00"))
            filtro["fechaCreacion"] = {"$gte": fecha_desde}
        except ValueError:
            pass
    
    if hasta:
        try:
            fecha_hasta = datetime.fromisoformat(hasta.replace("Z", "+00:00"))
            if "fechaCreacion" in filtro:
                filtro["fechaCreacion"]["$lte"] = fecha_hasta
            else:
                filtro["fechaCreacion"] = {"$lte": fecha_hasta}
        except ValueError:
            pass
    
    if montoMin:
        filtro["monto"] = {"$gte": montoMin}
    
    if q:
        # Búsqueda de texto (puedes ajustar según necesites)
        filtro["$or"] = [
            {"estado": {"$regex": q, "$options": "i"}},
        ]
    
    # Contar total de documentos que coinciden con el filtro
    total = await db["solicitudes_cdt"].count_documents(filtro)
    
    # Calcular skip para paginación
    skip = (page - 1) * limit
    
    # Obtener documentos con paginación
    cursor = db["solicitudes_cdt"].find(filtro).sort("fechaCreacion", -1).skip(skip).limit(limit)
    items = []
    async for doc in cursor:
        items.append(serialize_solicitud_normalizada(doc))
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "limit": limit
    }

# --- Actualizar solicitud en borrador ---
@router.put("/{solicitud_id}")
async def actualizar_solicitud_existente(
    solicitud_id: str,
    payload: SolicitudUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(obtener_usuario_id),
):
    from bson import ObjectId
    
    print(f"Updating solicitud {solicitud_id} for user: {user_id}")
    print(f"Payload: {payload}")
    
    # Verificar que la solicitud pertenece al usuario
    solicitud = await db["solicitudes_cdt"].find_one({
        "_id": ObjectId(solicitud_id),
        "usuario_id": ObjectId(user_id)
    })
    
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    updated = await actualizar_solicitud(db, solicitud_id, payload)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede modificar la solicitud (no está en estado de borrador)",
        )
    return serialize_solicitud_normalizada(updated)

# --- Cambiar estado de solicitud (cancelar, enviar a validación, etc.) ---
@router.patch("/{solicitud_id}/estado")
async def cambiar_estado_solicitud(
    solicitud_id: str,
    estado: str,
    razon: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(obtener_usuario_id),
):
    from bson import ObjectId
    from datetime import datetime, timezone
    
    # Verificar que la solicitud pertenece al usuario
    solicitud = await db["solicitudes_cdt"].find_one({
        "_id": ObjectId(solicitud_id),
        "usuario_id": ObjectId(user_id)
    })
    
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    estado_normalizado = estado.lower()
    estado_actual = solicitud["estado"]
    
    # Validar transiciones de estado
    if estado_normalizado == "en_validacion":
        if estado_actual != "borrador":
            raise HTTPException(status_code=400, detail="Solo se pueden enviar solicitudes en borrador")
        await db["solicitudes_cdt"].update_one(
            {"_id": ObjectId(solicitud_id)},
            {"$set": {
                "estado": "en_validacion",
                "fechaActualizacion": datetime.now(timezone.utc)
            }}
        )
    
    elif estado_normalizado == "cancelada":
        if estado_actual not in ["borrador", "en_validacion"]:
            raise HTTPException(status_code=400, detail="No se puede cancelar esta solicitud")
        
        update_data = {
            "estado": "cancelada",
            "fechaActualizacion": datetime.now(timezone.utc)
        }
        if razon:
            update_data["razon_cancelacion"] = razon
        
        await db["solicitudes_cdt"].update_one(
            {"_id": ObjectId(solicitud_id)},
            {"$set": update_data}
        )
    
    else:
        raise HTTPException(status_code=400, detail=f"Estado '{estado}' no válido")
    
    # Obtener solicitud actualizada
    solicitud_actualizada = await db["solicitudes_cdt"].find_one({"_id": ObjectId(solicitud_id)})
    return serialize_solicitud_normalizada(solicitud_actualizada)

# --- Eliminar solicitud (lógico) ---
@router.delete("/{solicitud_id}", status_code=204)
async def eliminar_solicitud(
    solicitud_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(obtener_usuario_id),
):
    from bson import ObjectId
    from datetime import datetime, timezone
    
    # Verificar que la solicitud pertenece al usuario
    solicitud = await db["solicitudes_cdt"].find_one({
        "_id": ObjectId(solicitud_id),
        "usuario_id": ObjectId(user_id)
    })
    
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    # Eliminación lógica
    await db["solicitudes_cdt"].update_one(
        {"_id": ObjectId(solicitud_id)},
        {"$set": {
            "eliminada": True,
            "fechaEliminacion": datetime.now(timezone.utc)
        }}
    )

# --- Serializador normalizado para el frontend ---
def serialize_solicitud_normalizada(doc: dict) -> dict:
    """
    Serializa una solicitud con estados en formato capitalizado
    para coincidir con el frontend
    """
    estado_map = {
        "borrador": "Borrador",
        "en_validacion": "En validación",
        "aprobada": "Aprobada",
        "rechazada": "Rechazada",
        "cancelada": "Cancelada"
    }
    
    return {
        "id": str(doc["_id"]),
        "usuario_id": str(doc["usuario_id"]),
        "monto": doc["monto"],
        "plazo_meses": doc["plazo_meses"],
        "tasa": doc["tasa"],
        "estado": estado_map.get(doc["estado"], doc["estado"]),
        "fechaCreacion": doc["fechaCreacion"].isoformat() if doc.get("fechaCreacion") else None,
        "fechaActualizacion": doc["fechaActualizacion"].isoformat() if doc.get("fechaActualizacion") else None,
        "razon_cancelacion": doc.get("razon_cancelacion"),
    }