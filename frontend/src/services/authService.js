import axios from "axios";

const API = "http://127.0.0.1:8000";

export async function login(email, password) {
  const response = await axios.post(
    `${API}/api/auth/login`,
    {
      email,
      password,
    }
  );

  return response.data;
}

export async function register(
  full_name,
  email,
  password
) {
  const response = await axios.post(
    `${API}/api/auth/register`,
    {
      full_name,
      email,
      password,
    }
  );

  return response.data;
}