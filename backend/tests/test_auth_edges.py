import pytest
from jose import jwt
from app.main import app
from app.services.auth import create_access_token
from app.core.config import settings

@pytest.mark.asyncio
async def test_login_usuario_inactivo(client):
    # marcar usuario inactivo
    for doc in app.state.test_db["usuarios"].data.values():
        if doc["correo"] == "jorge_andres.medina@uao.edu.co":
            doc["activo"] = False
    r = await client.post("/auth/login", json={
        "correo": "jorge_andres.medina@uao.edu.co", "contraseña": "MedinaInge519"
    })
    assert r.status_code == 403
    # revertir
    for doc in app.state.test_db["usuarios"].data.values():
        doc["activo"] = True

@pytest.mark.asyncio
async def test_login_password_incorrecto(client):
    r = await client.post("/auth/login", json={
        "correo": "jorge_andres.medina@uao.edu.co", "contraseña": "mal"
    })
    assert r.status_code == 401

@pytest.mark.asyncio
async def test_me_token_invalido(client):
    r = await client.get("/auth/me", headers={"Authorization":"Bearer abc.def.ghi"})
    assert r.status_code == 401

@pytest.mark.asyncio
async def test_me_usuario_no_encontrado(client):
    # token con sub inexistente
    token = create_access_token({"sub":"656565656565656565656565","correo":"x@y.z"})
    r = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 404

@pytest.mark.asyncio
async def test_token_oauth2_password_form(client):
    # flujo alterno /auth/token
    r = await client.post("/auth/token", data={
        "username": "jorge_andres.medina@uao.edu.co", "password":"MedinaInge519"
    })
    assert r.status_code == 200
    assert "access_token" in r.json()
