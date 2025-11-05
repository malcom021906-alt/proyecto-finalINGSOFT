import pytest

@pytest.mark.asyncio
async def test_crear_solicitud_minimo_invalido(client):
    login = await client.post("/auth/login", json={
        "correo": "jorge_andres.medina@uao.edu.co", "contraseña": "MedinaInge519"})
    token = login.json()["access_token"]

    r = await client.post("/solicitudes/", headers={"Authorization": f"Bearer {token}"},
                          json={"monto": 9999, "plazo_meses": 6})
    assert r.status_code == 400
    assert "Monto mínimo es 10000" in r.text

@pytest.mark.asyncio
async def test_crear_listar_paginacion_y_filtros(client):
    login = await client.post("/auth/login", json={
        "correo": "jorge_andres.medina@uao.edu.co", "contraseña": "MedinaInge519"})
    token = login.json()["access_token"]

    # Crear válida
    r = await client.post("/solicitudes/", headers={"Authorization": f"Bearer {token}"},
                          json={"monto": 100000, "plazo_meses": 8})
    assert r.status_code == 201
    sid = r.json()["id"]

    # Listar sin filtros
    r2 = await client.get("/solicitudes/?page=1&limit=2",
                          headers={"Authorization": f"Bearer {token}"})
    js = r2.json()
    assert r2.status_code == 200
    assert "items" in js and "total" in js
    assert 1 <= js["limit"] <= 100

    # Filtro estado
    r3 = await client.get("/solicitudes/?estado=Cancelada",
                          headers={"Authorization": f"Bearer {token}"})
    assert r3.status_code == 200
    for it in r3.json()["items"]:
        assert it["estado"] == "Cancelada"

@pytest.mark.asyncio
async def test_update_borrador_y_bloqueo_no_borrador(client):
    login = await client.post("/auth/login", json={
        "correo": "jorge_andres.medina@uao.edu.co", "contraseña": "MedinaInge519"})
    token = login.json()["access_token"]

    # Crear borrador
    r = await client.post("/solicitudes/", headers={"Authorization": f"Bearer {token}"},
                          json={"monto": 120000, "plazo_meses": 6})
    sid = r.json()["id"]

    # Actualizar OK
    r2 = await client.put(f"/solicitudes/{sid}", headers={"Authorization": f"Bearer {token}"},
                          json={"plazo_meses": 9})
    assert r2.status_code == 200
    assert r2.json()["plazo_meses"] == 9

    # Enviar a validación
    r3 = await client.patch(f"/solicitudes/{sid}/estado?estado=en_validacion",
                            headers={"Authorization": f"Bearer {token}"})
    assert r3.status_code == 200
    assert r3.json()["estado"] == "En validación"

    # Intentar editar ya no permitido
    r4 = await client.put(f"/solicitudes/{sid}", headers={"Authorization": f"Bearer {token}"},
                          json={"plazo_meses": 12})
    assert r4.status_code == 400

@pytest.mark.asyncio
async def test_cancelar_y_eliminacion_logica(client):
    login = await client.post("/auth/login", json={
        "correo": "jorge_andres.medina@uao.edu.co", "contraseña": "MedinaInge519"})
    token = login.json()["access_token"]

    r = await client.post("/solicitudes/", headers={"Authorization": f"Bearer {token}"},
                          json={"monto": 150000, "plazo_meses": 4})
    sid = r.json()["id"]

    # Cancelar desde borrador
    r2 = await client.patch(f"/solicitudes/{sid}/estado?estado=cancelada&razon=me%20arrepenti",
                            headers={"Authorization": f"Bearer {token}"})
    assert r2.status_code == 200
    assert r2.json()["estado"] == "Cancelada"

    # Eliminar lógica
    r3 = await client.delete(f"/solicitudes/{sid}",
                             headers={"Authorization": f"Bearer {token}"})
    assert r3.status_code == 200
    js = r3.json()
    assert js["success"] is True
    assert js["data"]["id"] == sid
