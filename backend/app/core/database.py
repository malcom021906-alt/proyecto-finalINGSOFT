# core/database.py
from typing import AsyncGenerator
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import settings

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None

async def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.MONGODB_URL)
    return _client

async def get_database() -> AsyncGenerator[AsyncIOMotorDatabase, None]:
    global _db
    if _db is None:
        client = await get_client()
        _db = client[settings.MONGODB_DB_NAME]
    yield _db
