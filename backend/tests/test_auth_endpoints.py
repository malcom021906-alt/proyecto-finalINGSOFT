import pytest

@pytest.mark.asyncio
async def test_login_ok_cliente(client):
    r = await client.post("/auth/login", json={
        "correo": "jorge_andres.medina@uao.edu.co",
        "contraseña": "MedinaInge519"
    })
    assert r.status_code == 200
    assert "access_token" in r.json()

@pytest.mark.asyncio
async def test_login_ok_agente(client):
    r = await client.post("/auth/login", json={
        "correo": "admin@neocdt.banco.com",
        "contraseña": "admin"
    })
    assert r.status_code == 200
    assert "access_token" in r.json()

@pytest.mark.asyncio
async def test_login_fail(client):
    r = await client.post("/auth/login", json={
        "correo": "no@existe.com", "contraseña": "x"
    })
    assert r.status_code == 401

@pytest.mark.asyncio
async def test_me_happy_path(client):
    login = await client.post("/auth/login", json={
        "correo": "jorge_andres.medina@uao.edu.co",
        "contraseña": "MedinaInge519"
    })
    token = login.json()["access_token"]
    r = await client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["correo"] == "jorge_andres.medina@uao.edu.co"

@pytest.mark.asyncio
async def test_me_missing_bearer(client):
    r = await client.get("/auth/me", headers={"Authorization": "Token xyz"})
    assert r.status_code == 401
