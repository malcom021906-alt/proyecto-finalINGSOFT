import pytest

@pytest.mark.asyncio
async def test_listar_pendientes_con_rol_agente(client):
    login = await client.post("/auth/login", json={
        "correo": "admin@neocdt.banco.com", "contraseña": "admin"})
    token = login.json()["access_token"]

    r = await client.get("/solicitudes/agente/pendientes",
                         headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    # Debe listar las en_validacion
    items = r.json()
    for it in items:
        assert it["estado"] == "en_validacion"

@pytest.mark.asyncio
async def test_aprobar_y_rechazar(client):
    # agente
    login = await client.post("/auth/login", json={
        "correo": "admin@neocdt.banco.com", "contraseña": "admin"})
    token = login.json()["access_token"]

    # Crear una solicitud y mandarla a validación con el cliente
    login_c = await client.post("/auth/login", json={
        "correo": "jorge_andres.medina@uao.edu.co", "contraseña": "MedinaInge519"})
    t_cli = login_c.json()["access_token"]
    s = await client.post("/solicitudes/", headers={"Authorization": f"Bearer {t_cli}"},
                          json={"monto": 200000, "plazo_meses": 5})
    sid = s.json()["id"]
    await client.patch(f"/solicitudes/{sid}/estado?estado=en_validacion",
                       headers={"Authorization": f"Bearer {t_cli}"})

    # Aprobar
    r1 = await client.put(f"/solicitudes/agente/{sid}/aprobar",
                          headers={"Authorization": f"Bearer {token}"})
    assert r1.status_code == 200
    assert r1.json()["estado_nuevo"] == "aprobada"

    # Crear otra y rechazar
    s2 = await client.post("/solicitudes/", headers={"Authorization": f"Bearer {t_cli}"},
                           json={"monto": 250000, "plazo_meses": 5})
    sid2 = s2.json()["id"]
    await client.patch(f"/solicitudes/{sid2}/estado?estado=en_validacion",
                       headers={"Authorization": f"Bearer {t_cli}"})

    r2 = await client.put(f"/solicitudes/agente/{sid2}/rechazar",
                          headers={"Authorization": f"Bearer {token}"},
                          json={"motivo": "Documentación inválida"})
    assert r2.status_code == 200
    assert r2.json()["estado_nuevo"] == "rechazada"
