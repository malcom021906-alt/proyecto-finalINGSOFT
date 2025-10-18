# tests/test_solicitudes_agente.py
import pytest

@pytest.mark.asyncio
async def test_agente_no_autorizado(client):
    # Token de usuario cliente
    login = await client.post("/auth/login", json={
        "correo": "jorge_andres.medina@uao.edu.co",
        "contraseña": "MedinaInge519"
    })
    token_cliente = login.json()["access_token"]

    # Intentar acceder a endpoint de agente
    r = await client.get(
        "/solicitudes/agente/pendientes",
        headers={"Authorization": f"Bearer {token_cliente}"}
    )
    assert r.status_code == 403

@pytest.mark.asyncio
async def test_agente_acceso_correcto(client):
    # Token del admin
    login = await client.post("/auth/login", json={
        "correo": "admin@neocdt.banco.com",
        "contraseña": "admin"
    })
    token_admin = login.json()["access_token"]

    r = await client.get(
        "/solicitudes/agente/pendientes",
        headers={"Authorization": f"Bearer {token_admin}"}
    )
    assert r.status_code in (200, 204)
