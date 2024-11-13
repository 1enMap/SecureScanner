import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export async function uploadFileForScanning(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_BASE_URL}/scan`, formData);
  return response.data;
}

export async function getScanStatus(scanId: string) {
  const response = await axios.get(`${API_BASE_URL}/scan/${scanId}`);
  return response.data;
}