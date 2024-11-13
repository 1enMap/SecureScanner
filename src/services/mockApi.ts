// Simulated API responses for demonstration
const MOCK_DELAY = 1500;

export async function uploadFileForScanning(file: File): Promise<{
  scan_id: string;
  status: string;
  message: string;
}> {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  return {
    scan_id: Math.random().toString(36).substring(7),
    status: 'accepted',
    message: 'File scan initiated'
  };
}

export async function getScanStatus(scanId: string): Promise<{
  status: string;
  results: {
    threats_found: string[];
    is_malicious: boolean;
    scan_time: string;
  };
}> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  
  // Simulate different scan results
  const randomResult = Math.random();
  
  if (randomResult > 0.7) {
    return {
      status: 'completed',
      results: {
        threats_found: ['Suspicious executable pattern detected'],
        is_malicious: true,
        scan_time: new Date().toISOString()
      }
    };
  }
  
  return {
    status: 'completed',
    results: {
      threats_found: [],
      is_malicious: false,
      scan_time: new Date().toISOString()
    }
  };
}