# tests/test_auth.py
import pytest

@pytest.mark.asyncio
async def test_login_usuario_invalido(client):
    response = await client.post("/auth/login", json={
        "correo": "noexiste@correo.com",
        "contraseña": "123"
    })
    assert response.status_code == 401
    assert "Credenciales inválidas" in response.text

@pytest.mark.asyncio
async def test_registro_usuario_y_login(client):
    # Registro nuevo usuario
    user_data = {
        "nombre": "Usuario Prueba",
        "correo": "test_user@gmail.com",
        "contraseña": "ContraPrueba123",
        "telefono": "3100000000"
    }
    r1 = await client.post("/auth/register", json=user_data)
    assert r1.status_code in (201, 409)

    # Login correcto
    r2 = await client.post("/auth/login", json={
        "correo": "test_user@gmail.com",
        "contraseña": "ContraPrueba123"
    })
    assert r2.status_code == 200
    token = r2.json()["access_token"]
    assert token is not None
