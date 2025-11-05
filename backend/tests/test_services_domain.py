# tests/test_services_domain.py
import pytest
from datetime import datetime, timedelta, timezone
from app.services.solicitudes_cdt import calcular_tasa, actualizar_solicitudes_vencidas
from app.main import app
from bson import ObjectId

def test_calcular_tasa_bordes():
    assert 5.0 <= calcular_tasa(10_000, 1) <= 12.0
    assert calcular_tasa(50_000_000, 60) == 12.0  # techo 12%

@pytest.mark.asyncio
async def test_actualizar_automatico_borrador_a_validacion():
    # Usa la FakeDB expuesta por conftest
    fake_db = app.state.test_db

    old_id = ObjectId()
    fake_db["solicitudes_cdt"].data[str(old_id)] = {
        "_id": old_id,
        "usuario_id": next(iter(fake_db["usuarios"].data.values()))["_id"],
        "monto": 120000,
        "plazo_meses": 6,
        "tasa": 6.5,
        "estado": "borrador",
        "fechaCreacion": datetime.now(timezone.utc) - timedelta(hours=30),
        "fechaActualizacion": datetime.now(timezone.utc) - timedelta(hours=30),
        "eliminada": False,
    }

    await actualizar_solicitudes_vencidas(fake_db)

    doc = fake_db["solicitudes_cdt"].data[str(old_id)]
    assert doc["estado"] == "en_validacion"
    assert "fechaActualizacion" in doc
