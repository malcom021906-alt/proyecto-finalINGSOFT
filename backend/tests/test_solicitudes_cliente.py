# tests/test_solicitudes_cliente.py
import pytest

@pytest.mark.asyncio
async def test_crear_solicitud_monto_invalido(client):
    # Primero obtener token de un usuario existente
    login = await client.post("/auth/login", json={
        "correo": "jorge_andres.medina@uao.edu.co",
        "contraseña": "MedinaInge519"
    })
    token = login.json()["access_token"]

    # Crear solicitud con monto menor a 10000
    r = await client.post(
        "/solicitudes/",
        headers={"Authorization": f"Bearer {token}"},
        json={"monto": 5000, "plazo_meses": 6}
    )
    assert r.status_code == 400
    assert "Monto mínimo es 10000" in r.text
