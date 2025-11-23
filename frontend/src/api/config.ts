// Configuración de la API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper para hacer requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // Manejar respuestas vacías o no-JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }
    
    if (!response.ok) {
      throw new Error(data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', {
      url,
      method: options.method || 'GET',
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
};
