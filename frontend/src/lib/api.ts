import axios from 'axios';

// Default to the live Render backend URL if NEXT_PUBLIC_API_URL environment variable is not defined
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://advanced-rag-backend-00he.onrender.com';

const api = axios.create({
  baseURL: baseURL,
});

export const uploadDocuments = async (files: File[]) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const queryRAG = async (query: string) => {
  const response = await api.post('/query', { query });
  return response.data;
};

export const clearDatabase = async () => {
  const response = await api.post('/clear-db');
  return response.data;
};

export const getDocuments = async () => {
  const response = await api.get('/documents');
  return response.data.documents;
};

export const deleteDocument = async (filename: string) => {
  const response = await api.delete(`/documents/${encodeURIComponent(filename)}`);
  return response.data;
};
