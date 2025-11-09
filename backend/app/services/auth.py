# services/auth.py
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt
from passlib.context import CryptContext
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(tz=timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def find_user_by_correo(db: AsyncIOMotorDatabase, correo: str) -> Optional[dict]:
    # Busca primero en 'usuarios'
    user = await db["usuarios"].find_one({"correo": correo})
    if user:
        user["rol"] = user.get("rol", "cliente")
        user["tipo_coleccion"] = "usuarios"
        return user

    # Si no está en usuarios, busca en 'agentes'
    agent = await db["agentes"].find_one({"correo": correo})
    if agent:
        agent["rol"] = agent.get("rol", "agente")
        agent["tipo_coleccion"] = "agentes"
        return agent

    return None

def serialize_user(doc: dict) -> dict:
    """
    Convierte un documento de MongoDB en un dict limpio para respuesta pública.
    Incluye 'rol' para compatibilidad con el frontend.
    """
    return {
        "id": str(doc.get("_id")),
        "nombre": doc.get("nombre"),
        "correo": doc.get("correo"),
        "telefono": doc.get("telefono"),
        "rol": doc.get("rol", "cliente"),
        "activo": bool(doc.get("activo", True)),
        # Permisos opcionales (solo si existen)
        "permisos": doc.get("permisos", []),
    }

async def register_user(db: AsyncIOMotorDatabase, data: dict) -> dict:
    """
    Registra un usuario cliente (por defecto).
    """
    exists = await db["usuarios"].find_one({"correo": data["correo"]})
    if exists:
        raise ValueError("El correo ya está registrado")

    hashed = hash_password(data["contraseña"])
    doc = {
        "nombre": data["nombre"],
        "correo": data["correo"],
        "contraseña": hashed,
        "telefono": data.get("telefono"),
        "fechaCreacion": datetime.now(timezone.utc),
        "activo": True,
        "rol": "cliente",
        "permisos": [],
    }
    res = await db["usuarios"].insert_one(doc)
    doc["_id"] = res.inserted_id
    return serialize_user(doc)
