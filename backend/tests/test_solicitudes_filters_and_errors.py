import pytest
from datetime import datetime, timedelta, timezone

@pytest.mark.asyncio
async def test_listar_con_fechas_monto_y_q(client):
    # login
    r = await client.post("/auth/login", json={
        "correo":"jorge_andres.medina@uao.edu.co","contraseña":"MedinaInge519"})
    t = r.json()["access_token"]

    desde = (datetime.now(timezone.utc) - timedelta(days=5)).isoformat()
    hasta = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()

    # filtros combinados
    r2 = await client.get(f"/solicitudes/?desde={desde}&hasta={hasta}&montoMin=100000&q=valida",
                          headers={"Authorization": f"Bearer {t}"})
    assert r2.status_code == 200
    _ = r2.json()["items"]  # no debe fallar

    # fecha inválida ignorada, no rompe
    r3 = await client.get("/solicitudes/?desde=fecha_mala",
                          headers={"Authorization": f"Bearer {t}"})
    assert r3.status_code == 200

@pytest.mark.asyncio
async def test_serializador_estado_desconocido(client, monkeypatch):
    # Fuerza un estado raro en una solicitud existente
    r = await client.post("/auth/login", json={
        "correo":"jorge_andres.medina@uao.edu.co","contraseña":"MedinaInge519"})
    t = r.json()["access_token"]

    # crear
    c = await client.post("/solicitudes/", headers={"Authorization": f"Bearer {t}"},
                          json={"monto":120000,"plazo_meses":6})
    sid = c.json()["id"]

    # tocar estado directamente en la fake DB
    from app.main import app
    for doc in app.state.test_db["solicitudes_cdt"].data.values():
        if str(doc["_id"]) == sid:
            doc["estado"] = "raro"

    # listar y verificar que se devuelve "raro" como está
    r2 = await client.get("/solicitudes/", headers={"Authorization": f"Bearer {t}"})
    assert r2.status_code == 200
    found = [it for it in r2.json()["items"] if it["id"] == sid][0]
    assert found["estado"] == "raro"
