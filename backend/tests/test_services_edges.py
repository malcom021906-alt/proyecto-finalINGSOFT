import pytest
from app.services.solicitudes_cdt import listar_solicitudes, actualizar_solicitud, enviar_a_validacion, cancelar_solicitud
from app.schemas.solicitudes_cdt import SolicitudUpdate
from bson import ObjectId

@pytest.mark.asyncio
async def test_listar_sin_usuario_y_enviar_no_borrador():
    from app.main import app
    db = app.state.test_db

    res = await listar_solicitudes(db)  # sin usuario_id
    assert isinstance(res, list)

    # preparar solicitud no borrador
    sid = next(iter(db["solicitudes_cdt"].data))
    doc = db["solicitudes_cdt"].data[sid]
    doc["estado"] = "en_validacion"

    out = await enviar_a_validacion(db, str(doc["_id"]), str(doc["usuario_id"]))
    assert out is None

@pytest.mark.asyncio
async def test_actualizar_monto_minimo_y_cancelar_estado_no_permitido():
    from app.main import app
    db = app.state.test_db
    # toma una en borrador
    sid = None
    for k, d in db["solicitudes_cdt"].data.items():
        if d["estado"] == "borrador":
            sid = k; doc=d; break
    assert sid

    # monto inválido
    with pytest.raises(Exception):
        await actualizar_solicitud(db, str(doc["_id"]), SolicitudUpdate(monto=9999))

    # cancelar cuando estado no permite
    doc["estado"] = "aprobada"
    ok = await cancelar_solicitud(db, str(doc["_id"]), str(doc["usuario_id"]))
    assert ok is False
