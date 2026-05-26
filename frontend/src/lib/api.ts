import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL && typeof window !== 'undefined') {
  console.warn(
    "⚠️ WARNING: NEXT_PUBLIC_API_URL environment variable is not defined! " +
    "The frontend is attempting to call relative routes, which will result in 404 errors. " +
    "Please define NEXT_PUBLIC_API_URL in your Vercel Dashboard pointing to your Render backend (e.g., https://your-app.onrender.com) and trigger a redeploy."
  );
}

const api = axios.create({
  baseURL: baseURL || 'http://localhost:8000', 
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
