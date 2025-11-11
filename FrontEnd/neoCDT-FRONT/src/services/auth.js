import api from "./api";

/**
 * Login: Public endpoint
 * Espera que el backend devuelva { access_token, token_type }
 */
export async function loginRequest(email, password) {
  const payload = { correo: email, contraseña: password };
  try {
    const { data } = await api.post("/auth/login", payload, {
      headers: { "Content-Type": "application/json" },
    });

    // Guardamos el token inmediatamente
    if (data?.access_token) {
      localStorage.setItem("token", data.access_token);
    }

    // Luego, pedimos los datos del usuario autenticado
    const meData = await meRequest(); // aquí viene { nombre, rol, correo, permisos, ... }

    // Guardamos el usuario en localStorage por conveniencia
    localStorage.setItem("user", JSON.stringify(meData));

    // Retornamos el usuario para el AuthContext
    return meData;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Me: Protected endpoint
 * Retorna los datos del usuario autenticado, incluyendo su rol
 */
export async function meRequest() {
  try {
    const { data } = await api.get("/auth/me");
    // Aseguramos que siempre tenga un campo 'rol'
    if (!data?.rol) {
      console.warn("⚠️ /auth/me no devolvió el campo 'rol'");
    }
    return data;
  } catch (error) {
    console.error("Me request error:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Register: Public endpoint
 */
export async function registerRequest({ nombre, correo, contraseña, telefono }) {
  try {
    const { data } = await api.post("/auth/register", {
      nombre,
      correo,
      contraseña,
      telefono,
    });
    return data;
  } catch (error) {
    console.error("Register error:", error.response?.data || error.message);
    throw error;
  }
}
