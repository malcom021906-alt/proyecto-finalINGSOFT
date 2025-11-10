# schemas/auth.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

class LoginRequest(BaseModel):
    correo: EmailStr
    contraseña: str = Field(min_length=1)

class RegisterRequest(BaseModel):
    nombre: str = Field(min_length=1)
    correo: EmailStr
    contraseña: str = Field(min_length=6)
    telefono: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    sub: str
    correo: EmailStr
    rol: Optional[str] = "cliente"

class UsuarioPublico(BaseModel):
    id: str
    nombre: str
    correo: EmailStr
    telefono: Optional[str] = None
    rol: str = "cliente"
    activo: bool
    permisos: Optional[List[str]] = []

    class Config:
        orm_mode = True
