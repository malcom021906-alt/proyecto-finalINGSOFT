import pytest

@pytest.mark.asyncio
async def test_root_health(client):
    r = await client.get("/")
    assert r.status_code == 200
    js = r.json()
    assert "NeoCDT" in js["message"]
    assert "database" in js
