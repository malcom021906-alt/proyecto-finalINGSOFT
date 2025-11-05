import pytest

@pytest.mark.asyncio
async def test_pendientes_sin_token_401(client):
    r = await client.get("/solicitudes/agente/pendientes")
    assert r.status_code == 401

@pytest.mark.asyncio
async def test_aprobar_rechazar_errores(client):
    # agente
    r = await client.post("/auth/login", json={
        "correo":"admin@neocdt.banco.com","contraseña":"admin"})
    t = r.json()["access_token"]

    # id inexistente
    r2 = await client.put("/solicitudes/agente/656565656565656565656565/aprobar",
                          headers={"Authorization": f"Bearer {t}"})
    assert r2.status_code == 404

    # crear una que NO esté en validación
    from app.main import app
    # busca borrador
    sid = next(k for k,v in app.state.test_db["solicitudes_cdt"].data.items() if v["estado"]=="borrador")
    bad = await client.put(f"/solicitudes/agente/{sid}/aprobar",
                           headers={"Authorization": f"Bearer {t}"})
    assert bad.status_code == 400
