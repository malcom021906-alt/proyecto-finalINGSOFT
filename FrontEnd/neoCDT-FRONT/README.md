# 🖥️ NeoCDT Bank – FrontEnd (React + Vite + Js)

Este módulo implementa la interfaz web del sistema **NeoCDT Bank**, permitiendo a clientes y agentes gestionar CDTs (Certificados de Depósito a Término) en tiempo real.

---

## 🚀 Tecnologías principales

- **React 19 + Vite** — Framework y bundler modernos.
- **React Router DOM** — Enrutamiento y protección de rutas.
- **JavaScript** — Parte Logica.
- **Axios** — Comunicación HTTP con el backend FastAPI.
- **Lottie React** — Animaciones en la página principal.
- **Vitest + React Testing Library** — Pruebas unitarias.
- **ESLint** — Linter y estandarización de código.
- **CSS modular / Tailwind** — Estilos limpios y responsivos.

---

## 📂 Estructura del proyecto

```
neoCDT-FRONT/
├── coverage/
├── e2e/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── css/
│   ├── mocks/
│   ├── pages/
│   ├── router/
│   ├── services/
│   ├── tests/
│   ├── utils/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   ├── main.jsx
│   └── setupTests.js
│
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── playwright.config.js
├── README.md
└── vite.config.js
```

---

## ⚙️ Variables de entorno

El archivo `.env` debe contener:

```
VITE_API_URL=http://localhost:8000
```

---

## ▶️ Scripts principales

| Comando                 | Descripción |
|-------------------------|-------------|
| `npm install`           | Instala dependencias |
| `npm run dev`           | Inicia el servidor de desarrollo |
| `npm run build`         | Genera el build de producción |
| `npm run preview`       | Previsualiza el build generado |
| `npm run lint`          | Ejecuta ESLint |
| `npm run test:coverage` | Corre todas las pruebas unitarias con Vitest |

---

## 🔐 Control de acceso y roles

- **Clientes:** acceden a `/solicitudes` para crear, editar o cancelar CDTs.
- **Agentes:** acceden a `/agente` donde validan y aprueban solicitudes.
- El rol se obtiene dinámicamente desde el backend vía `/auth/me`.

---

## 🧪 Pruebas unitarias

Incluye más de **20 tests** con **Vitest + React Testing Library**, cubriendo componentes, formularios, páginas y flujo de autenticación.

```bash
npm run test:coverage
```

---

## 🌐 Integración con backend

El frontend se conecta con FastAPI en `http://localhost:8000` mediante Axios.

Un Ejemplo:
```js
export async function loginRequest(credentials) {
  const res = await api.post("/auth/login", credentials);
  localStorage.setItem("token", res.data.access_token);
  return res.data;
}
```

---

## 👥 Autores

- **Rafael Plazas Ramirez**
- **Jhon Dairon Zuluaga**

Proyecto académico — *Ingeniería de Software II, Universidad Autónoma de Occidente (UAO)*

---

## 📜 Licencia

Licencia **MIT**.
