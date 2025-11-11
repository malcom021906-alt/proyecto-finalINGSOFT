import pytest
from app.core import database

class DummyClient:
    def __init__(self, url): self.url = url
    def __getitem__(self, name): return {"_db_name": name}
    def close(self): self.closed = True

@pytest.mark.asyncio
async def test_get_client_and_database_caching(monkeypatch):
    # parchea el cliente motor
    monkeypatch.setattr(database, "AsyncIOMotorClient", DummyClient)

    # limpia caché interna
    database._client = None
    database._db = None

    c1 = await database.get_client()
    c2 = await database.get_client()
    assert c1 is c2  # cache

    agen = database.get_database()
    db = await agen.__anext__()
    assert isinstance(db, dict)
    assert db["_db_name"]  # existe
