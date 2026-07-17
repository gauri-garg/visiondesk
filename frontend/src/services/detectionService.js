import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export async function detectLatest() {
  const response = await axios.post(
    `${API_URL}/api/detect/latest`
  );

  return response.data;
}