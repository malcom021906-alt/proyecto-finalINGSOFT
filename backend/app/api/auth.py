# api/auth.py
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import timedelta

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.core.config import settings
from app.schemas.auth import LoginRequest, RegisterRequest, Token, TokenData, UsuarioPublico
from app.services.auth import (
    register_user,
    verify_password,
    create_access_token,
    find_user_by_correo,
    serialize_user,
)

router = APIRouter(prefix="/auth", tags=["autenticacion"])

@router.post("/login", response_model=Token)
async def login(payload: LoginRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await find_user_by_correo(db, payload.correo)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    if not user.get("activo", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuario inactivo")

    if not verify_password(payload.contraseña, user.get("contraseña", "")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    subject = {"sub": str(user["_id"]), "correo": user["correo"],"rol": user.get("rol", "cliente")}
    token = create_access_token(subject, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    return Token(access_token=token)

# (opcional) soporte a OAuth2PasswordRequestForm (por si pruebas con Swagger)
@router.post("/token", response_model=Token, include_in_schema=False)
async def token(form: OAuth2PasswordRequestForm = Depends(), db: AsyncIOMotorDatabase = Depends(get_database)):
    user = await find_user_by_correo(db, form.username)
    if not user or not verify_password(form.password, user.get("contraseña", "")) or not user.get("activo", True):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    subject = {"sub": str(user["_id"]), "correo": user["correo"],"rol": user.get("rol", "cliente")}
    token = create_access_token(subject)
    return Token(access_token=token)

# (opcional) endpoint para validar/leer el token
from fastapi import Header
from app.schemas.auth import TokenData

@router.get("/me", response_model=UsuarioPublico)
async def me(authorization: str = Header(...), db: AsyncIOMotorDatabase = Depends(get_database)):
    """
    Espera: Authorization: Bearer <token>
    """
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Falta Bearer token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        correo = payload.get("correo")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

    user = await db["usuarios"].find_one({"_id": ObjectId(user_id)}) or await db["agentes"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return serialize_user(user)
@router.post("/register", response_model=UsuarioPublico, status_code=201)
async def register(payload: RegisterRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    # ¿Correo ya existe?
    existing = await find_user_by_correo(db, payload.correo)
    if existing:
        raise HTTPException(status_code=409, detail="El correo ya está registrado")

    # Crea usuario (hash interno en services.register_user)
    user = await register_user(db, payload.model_dump())
    return user
