import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# --- Configuración ---
MONGODB_URL = "mongodb+srv://josecastillo_db_user:MR12feB7xz7VaG16@cluster0.tqtjowi.mongodb.net/"
DB_NAME = "neocdt_bank"

# --- Hash de la contraseña ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd_context.hash("admin")

async def main():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]

    agente = {
        "nombre": "Administrador Sistema",
        "rol": "administrador",
        "correo": "admin@neocdt.banco.com",
        "contraseña": hashed,
        "fechaCreacion": datetime.now(timezone.utc),
        "activo": True,
        "permisos": [
            "crear_agentes",
            "gestionar_solicitudes",
            "ver_reportes",
            "configurar_sistema",
        ],
    }

    res = await db["agentes"].insert_one(agente)
    print(f"✅ Agente creado con _id: {res.inserted_id}")
    client.close()

asyncio.run(main())
