import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', // Update this for production
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
