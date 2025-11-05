# app/api/solicitudes_cdt.py
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

    filtro = {"usuario_id": ObjectId(user_id)}

    if estado:
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
        filtro["$or"] = [
            {"estado": {"$regex": q, "$options": "i"}},
        ]

    total = await db["solicitudes_cdt"].count_documents(filtro)
    skip = (page - 1) * limit

    cursor = (
        db["solicitudes_cdt"]
        .find(filtro)
        .sort("fechaCreacion", -1)
        .skip(skip)
        .limit(limit)
    )
    items = []
    async for doc in cursor:
        items.append(serialize_solicitud_normalizada(doc))

    return {"items": items, "total": total, "page": page, "limit": limit}

# --- Actualizar solicitud en borrador ---
@router.put("/{solicitud_id}")
async def actualizar_solicitud_existente(
    solicitud_id: str,
    payload: SolicitudUpdate,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(obtener_usuario_id),
):
    from bson import ObjectId, errors as bson_errors

    print(f"Updating solicitud {solicitud_id} for user: {user_id}")
    print(f"Payload: {payload}")

    # Validar ID
    try:
        obj_id = ObjectId(solicitud_id)
        user_obj = ObjectId(user_id)
    except bson_errors.InvalidId:
        raise HTTPException(status_code=400, detail="ID de solicitud inválido")

    # Verificar pertenencia
    solicitud = await db["solicitudes_cdt"].find_one(
        {"_id": obj_id, "usuario_id": user_obj}
    )
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
    from bson import ObjectId, errors as bson_errors
    from datetime import datetime, timezone

    # Validar ID
    try:
        obj_id = ObjectId(solicitud_id)
        user_obj = ObjectId(user_id)
    except bson_errors.InvalidId:
        raise HTTPException(status_code=400, detail="ID de solicitud inválido")

    # Verificar pertenencia
    solicitud = await db["solicitudes_cdt"].find_one(
        {"_id": obj_id, "usuario_id": user_obj}
    )
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    estado_normalizado = estado.lower()
    estado_actual = solicitud["estado"]

    if estado_normalizado == "en_validacion":
        if estado_actual != "borrador":
            raise HTTPException(
                status_code=400, detail="Solo se pueden enviar solicitudes en borrador"
            )
        await db["solicitudes_cdt"].update_one(
            {"_id": obj_id},
            {
                "$set": {
                    "estado": "en_validacion",
                    "fechaActualizacion": datetime.now(timezone.utc),
                }
            },
        )

    elif estado_normalizado == "cancelada":
        if estado_actual not in ["borrador", "en_validacion"]:
            raise HTTPException(status_code=400, detail="No se puede cancelar esta solicitud")

        update_data = {
            "estado": "cancelada",
            "fechaActualizacion": datetime.now(timezone.utc),
        }
        if razon:
            update_data["razon_cancelacion"] = razon

        await db["solicitudes_cdt"].update_one({"_id": obj_id}, {"$set": update_data})

    else:
        raise HTTPException(status_code=400, detail=f"Estado '{estado}' no válido")

    solicitud_actualizada = await db["solicitudes_cdt"].find_one({"_id": obj_id})
    return serialize_solicitud_normalizada(solicitud_actualizada)

# --- Eliminar solicitud (lógico) - ya maneja InvalidId ---
@router.delete("/{solicitud_id}")
async def eliminar_solicitud(
    solicitud_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database),
    user_id: str = Depends(obtener_usuario_id),
):
    """
    Elimina lógicamente una solicitud (marca como eliminada).
    Retorna la solicitud actualizada.
    """
    from bson import ObjectId
    from datetime import datetime, timezone

    print(f"🗑️ DELETE endpoint called for solicitud_id: {solicitud_id}, user_id: {user_id}")

    try:
        solicitud_obj_id = ObjectId(solicitud_id)
        user_obj = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="ID de solicitud inválido")

    solicitud = await db["solicitudes_cdt"].find_one(
        {"_id": solicitud_obj_id, "usuario_id": user_obj}
    )
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    update_data = {"eliminada": True, "fechaEliminacion": datetime.now(timezone.utc)}
    result = await db["solicitudes_cdt"].update_one(
        {"_id": solicitud_obj_id}, {"$set": update_data}
    )
    print(f"✅ Deletion modified: {result.modified_count}")

    solicitud_actualizada = await db["solicitudes_cdt"].find_one({"_id": solicitud_obj_id})
    return {
        "success": True,
        "message": "Solicitud eliminada correctamente",
        "id": solicitud_id,
        "data": serialize_solicitud_normalizada(solicitud_actualizada),
    }

# --- Serializador normalizado para el frontend ---
def serialize_solicitud_normalizada(doc: dict) -> dict:
    """
    Serializa una solicitud con estados en formato capitalizado
    para coincidir con el frontend
    """
    from datetime import datetime

    estado_map = {
        "borrador": "Borrador",
        "en_validacion": "En validación",
        "aprobada": "Aprobada",
        "rechazada": "Rechazada",
        "cancelada": "Cancelada",
    }

    def format_fecha(fecha):
        if fecha is None:
            return None
        if isinstance(fecha, datetime):
            return fecha.isoformat()
        return str(fecha)

    return {
        "id": str(doc["_id"]),
        "usuario_id": str(doc["usuario_id"]),
        "monto": int(doc.get("monto", 0)),
        "plazo_meses": int(doc.get("plazo_meses", 0)),
        "tasa": float(doc.get("tasa", 0.0)),
        "estado": estado_map.get(doc.get("estado", "").lower(), doc.get("estado", "Desconocido")),
        "fechaCreacion": format_fecha(doc.get("fechaCreacion")),
        "fechaActualizacion": format_fecha(doc.get("fechaActualizacion")),
        "razon_cancelacion": doc.get("razon_cancelacion"),
    }
