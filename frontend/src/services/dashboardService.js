import axios from "axios";

const API = "http://127.0.0.1:8000";

export async function getDashboardSummary() {
  const response = await axios.get(
    `${API}/api/dashboard/summary`
  );

  return response.data;
}