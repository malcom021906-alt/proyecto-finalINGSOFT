import pytest
from app import main as main_mod

class DummyClient:
    def close(self): self.closed = True

@pytest.mark.asyncio
async def test_manual_lifecycle(monkeypatch):
    async def fake_get_client():
        return DummyClient()
    monkeypatch.setattr(main_mod, "get_client", fake_get_client)

    await main_mod.startup_db_client()
    assert hasattr(main_mod.app, "mongodb_client")

    await main_mod.shutdown_db_client()
