# schemas/auth.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class LoginRequest(BaseModel):
    correo: EmailStr
    contraseña: str = Field(min_length=1)

class RegisterRequest(BaseModel):
    nombre: str = Field(min_length=1)
    correo: EmailStr
    contraseña: str = Field(min_length=6)   # ajusta tu política
    telefono: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    sub: str
    correo: EmailStr

class UsuarioPublico(BaseModel):
    id: str
    nombre: str
    correo: EmailStr
    telefono: Optional[str] = None
    activo: bool
