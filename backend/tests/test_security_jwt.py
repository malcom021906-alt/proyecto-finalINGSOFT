import pytest

@pytest.mark.asyncio
async def test_endpoints_require_bearer(client):
    r = await client.get("/solicitudes/")
    assert r.status_code == 401

@pytest.mark.asyncio
async def test_agente_endpoint_forbidden_for_cliente(client):
    login = await client.post("/auth/login", json={
        "correo": "jorge_andres.medina@uao.edu.co",
        "contraseña": "MedinaInge519"
    })
    token = login.json()["access_token"]
    r = await client.get("/solicitudes/agente/pendientes",
                         headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403
