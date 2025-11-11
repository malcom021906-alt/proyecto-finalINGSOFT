import pytest

@pytest.mark.asyncio
async def test_serializador_estado_capitalizado(client):
    login = await client.post("/auth/login", json={
        "correo": "jorge_andres.medina@uao.edu.co", "contraseña": "MedinaInge519"})
    token = login.json()["access_token"]

    r = await client.post("/solicitudes/", headers={"Authorization": f"Bearer {token}"},
                          json={"monto": 100000, "plazo_meses": 6})
    js = r.json()
    assert js["estado"] == "Borrador"

@pytest.mark.asyncio
async def test_ids_invalidos_y_mensajes(client):
    login = await client.post("/auth/login", json={
        "correo": "jorge_andres.medina@uao.edu.co", "contraseña": "MedinaInge519"})
    token = login.json()["access_token"]

    r = await client.put("/solicitudes/xxx", headers={"Authorization": f"Bearer {token}"},
                         json={"plazo_meses": 7})
    # No existe => 404
    assert r.status_code in (400, 404)

    r2 = await client.patch("/solicitudes/xxx/estado?estado=en_validacion",
                            headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code in (400, 404)
