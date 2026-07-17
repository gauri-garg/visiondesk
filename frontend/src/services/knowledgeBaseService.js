import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export async function uploadDocument(file, category) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  const response = await axios.post(
    `${API_URL}/api/documents/upload`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
}

export async function listDocuments(page = 1, pageSize = 20) {
  const response = await axios.get(`${API_URL}/api/documents`, {
    params: { page, page_size: pageSize },
  });
  return response.data;
}

export async function deleteDocument(documentId) {
  const response = await axios.delete(
    `${API_URL}/api/documents/${documentId}`
  );
  return response.data;
}

export async function searchKnowledgeBase(query, topK = 5) {
  const response = await axios.post(`${API_URL}/api/documents/search`, {
    query,
    top_k: topK,
  });
  return response.data;
}
