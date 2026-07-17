import axios from "axios";

const API = "http://127.0.0.1:8000";

export async function generateReport() {
  const response = await axios.post(
    `${API}/api/report/generate`
  );

  return response.data;
}