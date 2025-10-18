import api from "./api";

// Login: Public endpoint
export async function loginRequest(email, password) {
  const payload = { correo: email, contraseña: password };
  try {
    const { data } = await api.post("/auth/login", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return data;  // { access_token, token_type }
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error;
  }
}

// Me: Protected endpoint (token added by interceptor)
export async function meRequest() {
  try {
    const { data } = await api.get("/auth/me");
    return data;  // User data
  } catch (error) {
    console.error("Me request error:", error.response?.data || error.message);
    throw error;
  }
}

// Register: Public endpoint
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