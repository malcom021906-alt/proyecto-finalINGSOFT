# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from .core.config import settings
from .core.database import get_client
from .api.auth import router as auth_router

app = FastAPI(
    title="NeoCDT Bank API",
    version="1.0.0",
    description="API para autenticación y gestión de usuarios de NeoCDT Bank.",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restringe en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)

# Eventos
@app.on_event("startup")
async def startup_db_client():
    app.mongodb_client = await get_client()
    print(f"✅ Conectado a MongoDB: {settings.MONGODB_DB_NAME}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client = getattr(app, "mongodb_client", None)
    if client:
        client.close()
        print("🛑 Conexión a MongoDB cerrada")

@app.get("/")
async def root():
    return {"message": "🚀 NeoCDT Bank API en ejecución", "database": settings.MONGODB_DB_NAME}
