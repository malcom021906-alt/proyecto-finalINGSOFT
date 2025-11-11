# 🏦 NeoCDT Bank – Backend (FastAPI + MongoDB)

Este repositorio contiene el **backend del sistema NeoCDT Bank**, una plataforma desarrollada con **FastAPI** que gestiona usuarios, agentes, solicitudes de CDT y validaciones automáticas.  
El backend expone una API REST segura con autenticación **JWT** y conexión a **MongoDB**.

---

## 🚀 Tecnologías principales

- **Python 3.11+**
- **FastAPI** — framework principal para la API
- **MongoDB (Motor Async)** — base de datos NoSQL
- **Passlib (bcrypt)** — encriptación de contraseñas
- **Python-JOSE** — Autenticación mediante JWT 
- **HTTPX / Pytest-AsyncIO** — pruebas automatizadas y cobertura 
- **Uvicorn** — Servidor ASGI

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
│
├── .env                         # Variables de entorno
└── requirements.txt             # Dependencias del backend
└── pytest.ini                    # Configuración de pytest y cobertura
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

## 🧪 Pruebas y cobertura

El proyecto incluye **más de 30 pruebas unitarias y de integración**, con base de datos simulada (`FakeDB`) y fixtures automáticas.

### Ejecutar todas las pruebas:

```bash
pytest
```

### Ejecutar con cobertura:

```bash
pytest --cov=app --cov-report=term-missing
```

### Configuración de cobertura (pytest.ini)

```ini
[pytest]
addopts = -q --maxfail=1 --disable-warnings --cov=app --cov-report=term-missing --cov-fail-under=61
asyncio_mode = auto
python_files = tests/test_*.py
```

Resultados esperados:

```
36 passed, 0 failed
---------- coverage ----------
TOTAL  > 90%
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

El backend sigue una arquitectura **modular y en capas**:

| Capa | Descripción |
|------|--------------|
| **API Layer** | Define rutas y controladores (`FastAPI Routers`) |
| **Service Layer** | Lógica de negocio independiente del framework |
| **Schema Layer** | Validación y tipado (`Pydantic Models`) |
| **Core Layer** | Configuración, seguridad y conexión a MongoDB |
| **Persistence** | Colecciones: `usuarios`, `agentes`, `solicitudes_cdt`, `historial_estados` |


---

## 🧰 Scripts útiles

| Acción | Comando |
|--------|----------|
| Iniciar servidor local | `uvicorn app.main:app --reload` |
| Ejecutar pruebas | `pytest -v` |
| Instalar dependencias | `pip install -r requirements.txt` |

---

## 🔒 Atributos de calidad garantizados

| Atributo | Escenario | Métrica |
|-----------|------------|---------|
| **Seguridad** | Bloqueo tras 5 intentos fallidos | ≤ 1 min |
| **Disponibilidad** | Conmutación automática DB | ≤ 5 s |
| **Usabilidad** | Formulario con validaciones en tiempo real | Éxito > 95% |
| **Rendimiento** | Login y CRUD | Login < 1 s, CRUD < 2 s |

---

## 👥 Autores del backend

Proyecto académico (backend) desarrollado por **Jorge Medina** y **Malcom Alexis**,  
como parte del curso **Ingeniería de Software II – Universidad Autónoma de Occidente (UAO)**.

---

## 📜 Licencia

Este proyecto se distribuye bajo la licencia **MIT**.  
Puedes usarlo, modificarlo y redistribuirlo libremente, manteniendo los créditos originales.

---
