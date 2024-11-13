import { uploadFileForScanning as mockUpload, getScanStatus as mockStatus } from './mockApi';

// Switch between real API and mock based on environment
const USE_MOCK_API = true;

export async function uploadFileForScanning(file: File) {
  if (USE_MOCK_API) {
    return mockUpload(file);
  }
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:8000/scan', {
    method: 'POST',
    body: formData,
  });
  return response.json();
}

export async function getScanStatus(scanId: string) {
  if (USE_MOCK_API) {
    return mockStatus(scanId);
  }
  const response = await fetch(`http://localhost:8000/scan/${scanId}`);
  return response.json();
}