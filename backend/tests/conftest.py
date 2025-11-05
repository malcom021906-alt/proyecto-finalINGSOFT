# tests/conftest.py
import sys, os, asyncio, pytest_asyncio, httpx, re
from types import SimpleNamespace
from datetime import datetime, timedelta, timezone
from bson import ObjectId

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.main import app
from app.core import database
from app.services.auth import pwd_context

@pytest_asyncio.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

class _Cursor:
    def __init__(self, items):
        self.items = items
        self._skip = 0
        self._limit = None
    def sort(self, key, direction):
        reverse = direction == -1
        self.items = sorted(self.items, key=lambda d: d.get(key), reverse=reverse)
        return self
    def skip(self, n):
        self._skip = n; return self
    def limit(self, n):
        self._limit = n; return self
    def __aiter__(self):
        start = self._skip
        end = None if self._limit is None else start + self._limit
        data = self.items[start:end]
        async def gen():
            for doc in data:
                yield doc
        return gen()

class FakeCollection:
    def __init__(self):
        self.data = {}  # str(_id) -> doc
    def _match(self, doc, query):
        def cond(k, v, d):
            if isinstance(v, dict):
                if "$gte" in v and not (d.get(k) is not None and d[k] >= v["$gte"]): return False
                if "$lte" in v and not (d.get(k) is not None and d[k] <= v["$lte"]): return False
                if "$ne"  in v and not (d.get(k) != v["$ne"]): return False
                if "$regex" in v:
                    import re as _re
                    flags = _re.I if v.get("$options") == "i" else 0
                    return _re.search(v["$regex"], str(d.get(k, "")), flags) is not None
                return True
            return d.get(k) == v
        if "$or" in query:
            if any(self._match(doc, q) for q in query["$or"]):
                q2 = {k: v for k, v in query.items() if k != "$or"}
                return all(cond(k, v, doc) for k, v in q2.items())
            return False
        return all(cond(k, v, doc) for k, v in query.items())
    async def find_one(self, query):
        for doc in self.data.values():
            if self._match(doc, query): return doc
        return None
    async def insert_one(self, doc):
        _id = ObjectId()
        doc["_id"] = _id
        self.data[str(_id)] = doc
        return SimpleNamespace(inserted_id=_id)
    async def update_one(self, filtro, update):
        for _id, doc in self.data.items():
            if self._match(doc, filtro):
                if "$set" in update: doc.update(update["$set"])
                return SimpleNamespace(modified_count=1)
        return SimpleNamespace(modified_count=0)
    async def update_many(self, filtro, update):
        n = 0
        for _id, doc in self.data.items():
            if self._match(doc, filtro):
                if "$set" in update: doc.update(update["$set"])
                n += 1
        return SimpleNamespace(modified_count=n)
    def find(self, query=None):
        items = [doc for doc in self.data.values() if self._match(doc, query or {})]
        return _Cursor(items)
    async def count_documents(self, query):
        return sum(1 for doc in self.data.values() if self._match(doc, query))

class FakeDB:
    def __init__(self):
        self.collections = {"usuarios": FakeCollection(),
                            "agentes": FakeCollection(),
                            "solicitudes_cdt": FakeCollection()}
    def __getitem__(self, name):
        return self.collections[name]

@pytest_asyncio.fixture(autouse=True)
async def fake_database_dependency():
    fake_db = FakeDB()

    # Exponerla para otros tests
    app.state.test_db = fake_db

    # Datos semilla
    u1_id = ObjectId(); a1_id = ObjectId()
    fake_db["usuarios"].data[str(u1_id)] = {
        "_id": u1_id, "nombre": "Jorge Medina",
        "correo": "jorge_andres.medina@uao.edu.co",
        "contraseña": pwd_context.hash("MedinaInge519"),
        "rol": "cliente", "activo": True,
        "fechaCreacion": datetime.now(timezone.utc),
    }
    fake_db["agentes"].data[str(a1_id)] = {
        "_id": a1_id, "nombre": "Admin Agente",
        "correo": "admin@neocdt.banco.com",
        "contraseña": pwd_context.hash("admin"),
        "rol": "agente", "activo": True,
        "fechaCreacion": datetime.now(timezone.utc),
    }
    now = datetime.now(timezone.utc)
    for estado, delta, key in [
        ("borrador", timedelta(days=2), "s1"),
        ("en_validacion", timedelta(hours=1), "s2"),
        ("cancelada", timedelta(days=10), "s3"),
    ]:
        _id = ObjectId()
        fake_db["solicitudes_cdt"].data[str(_id)] = {
            "_id": _id, "usuario_id": u1_id, "monto": 200000,
            "plazo_meses": 6, "tasa": 6.5 if estado!="cancelada" else 6.0,
            "estado": estado, "fechaCreacion": now - delta,
            "fechaActualizacion": now - delta, "eliminada": False,
        }

    # Sustituir dependencia de FastAPI
    app.dependency_overrides[database.get_database] = lambda: fake_db
    app.router.on_startup.clear()
    app.router.on_shutdown.clear()

    yield

    app.dependency_overrides.clear()
    if hasattr(app.state, "test_db"):
        del app.state.test_db

@pytest_asyncio.fixture
async def client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
