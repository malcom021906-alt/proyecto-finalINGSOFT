# tests/conftest.py
import sys, os, asyncio, pytest_asyncio, httpx
from types import SimpleNamespace

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.main import app
from app.core import database

# === 1. Mantener un solo event loop global ===
@pytest_asyncio.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


# === 2. Implementación simulada de la base de datos ===
class FakeCollection:
    def __init__(self):
        self.data = {}

    async def find_one(self, query):
        for doc in self.data.values():
            if all(doc.get(k) == v for k, v in query.items()):
                return doc
        return None

    async def insert_one(self, doc):
        from bson import ObjectId
        _id = str(ObjectId())
        doc["_id"] = _id
        self.data[_id] = doc
        return SimpleNamespace(inserted_id=_id)

    async def update_one(self, filtro, update):
        for _id, doc in self.data.items():
            if all(doc.get(k) == v for k, v in filtro.items()):
                doc.update(update.get("$set", {}))
                return SimpleNamespace(modified_count=1)
        return SimpleNamespace(modified_count=0)

    def find(self, query=None):
        query = query or {}
        async def _cursor():
            for doc in self.data.values():
                if all(doc.get(k) == v for k, v in query.items()):
                    yield doc
        return _cursor()


class FakeDB:
    def __init__(self):
        self.collections = {
            "usuarios": FakeCollection(),
            "agentes": FakeCollection(),
            "solicitudes_cdt": FakeCollection(),
        }

    def __getitem__(self, name):
        return self.collections[name]


# === 3. Dependencia falsa ===
@pytest_asyncio.fixture(autouse=True)
async def fake_database_dependency():
    from app.services.auth import pwd_context

    fake_db = FakeDB()

    # --- Insertar datos de prueba ---
    fake_db["usuarios"].data["u1"] = {
        "_id": "u1",
        "nombre": "Jorge Medina",
        "correo": "jorge_andres.medina@uao.edu.co",
        "contraseña": pwd_context.hash("MedinaInge519"),
        "rol": "cliente"
    }

    fake_db["agentes"].data["a1"] = {
        "_id": "a1",
        "nombre": "Admin Agente",
        "correo": "admin@neocdt.banco.com",
        "contraseña": pwd_context.hash("admin"),
        "rol": "agente"
    }

    app.dependency_overrides[database.get_database] = lambda: fake_db
    app.router.on_startup.clear()
    app.router.on_shutdown.clear()

    yield
    app.dependency_overrides.clear()


# === 4. Cliente HTTP en memoria ===
@pytest_asyncio.fixture
async def client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
