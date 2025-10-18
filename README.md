# 🏦 NeoCDT Bank – Backend (FastAPI + MongoDB)

Este repositorio contiene el **backend del sistema NeoCDT Bank**, una plataforma desarrollada con **FastAPI** que gestiona usuarios, agentes, solicitudes de CDT y validaciones automáticas.  
El backend expone una API REST segura con autenticación **JWT** y conexión a **MongoDB**.

---

## 🚀 Tecnologías principales

- **Python 3.11+**
- **FastAPI** — framework principal para la API
- **MongoDB (Motor Async)** — base de datos NoSQL
- **Passlib (bcrypt)** — encriptación de contraseñas
- **PyJWT** — autenticación mediante tokens
- **HTTPX / Pytest-AsyncIO** — pruebas automatizadas

---

## 📂 Estructura del proyecto

```
backend/
│
├── app/
│   ├── main.py                  # Punto de entrada del servidor
│   ├── api/                     # Rutas (endpoints)
│   │   ├── auth.py              # Login, registro, tokens JWT
│   │   ├── solicitudes_cdt.py   # Operaciones cliente
│   │   └── solicitudes_cdt_agente.py  # Operaciones agente
│   │
│   ├── core/                    # Configuración base
│   │   ├── config.py            # Variables de entorno (.env)
│   │   └── database.py          # Conexión MongoDB (Motor)
│   │
│   ├── services/                # Lógica de negocio
│   │   ├── auth.py
│   │   ├── solicitudes_cdt.py
│   │   └── solicitudes_cdt_agente.py
│   │
│   ├── schemas/                 # Modelos y validaciones Pydantic
│   │   ├── auth.py
│   │   ├── soliticudes_cdt.py
│   │   └── solicitudes_cdt_agente.py
│   │
│   └── tests/                   # Pruebas automatizadas
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_solicitudes_agente.py
│   │   └── test_solicitudes_cliente.py
│
├── .env                         # Variables de entorno
└── requirements.txt             # Dependencias del backend
```

---

## ⚙️ Configuración del entorno

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/malcom021906-alt/proyecto-finalINGSOFT.git
cd proyecto-finalINGSOFT/backend
```

### 2️⃣ Crear entorno virtual

```bash
python -m venv .venv
source .venv/bin/activate   # En Linux/Mac
.venv\Scripts\activate      # En Windows
```

### 3️⃣ Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4️⃣ Configurar variables de entorno

Crea un archivo `.env` en la raíz del backend con:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=neocdt_bank
SECRET_KEY=supersecret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## ▶️ Ejecución del servidor

Inicia el backend con **Uvicorn**:

```bash
uvicorn app.main:app --reload
```

El servidor se ejecutará en:
```
http://127.0.0.1:8000
```

Documentación interactiva:
- **Swagger UI:** http://127.0.0.1:8000/docs  
- **ReDoc:** http://127.0.0.1:8000/redoc  

---

## 🧪 Pruebas unitarias

Las pruebas usan **pytest + httpx + pytest-asyncio** con una base de datos simulada (FakeDB).

Ejecuta:

```bash
pytest -v
```

Resultado esperado:
```
5 passed in ~1.50s
```

---

## 🔐 Funcionalidades principales

| Módulo | Descripción |
|--------|-------------|
| **/auth/** | Registro, login, emisión y verificación de tokens JWT. |
| **/solicitudes/** | CRUD de solicitudes CDT para clientes. |
| **/solicitudes/agente/** | Validación, aprobación y rechazo de solicitudes por parte de agentes. |

---

## 🧱 Arquitectura

El backend sigue una arquitectura modular:

- **API Layer** → Define rutas y dependencias (`FastAPI Routers`)
- **Service Layer** → Lógica de negocio independiente del framework
- **Schema Layer** → Validación y tipado (`Pydantic Models`)
- **Persistence Layer** → MongoDB (colecciones: usuarios, agentes, solicitudes, kyc, historial_estados)

---

## 🧰 Scripts útiles

| Acción | Comando |
|--------|----------|
| Iniciar servidor local | `uvicorn app.main:app --reload` |
| Ejecutar pruebas | `pytest -v` |
| Instalar dependencias | `pip install -r requirements.txt` |
| Formatear código | `black .` |
| Revisar tipado | `mypy app` |

---

## 👥 Autores del backend

Proyecto académico (backend) desarrollado por **Jorge Medina** y **Malcom Alexis**,  
como parte del curso **Ingeniería de Software II – Universidad Autónoma de Occidente (UAO)**.

---

## 📜 Licencia

Este proyecto se distribuye bajo la licencia **MIT**.  
Puedes usarlo, modificarlo y redistribuirlo libremente, manteniendo los créditos originales.

---
