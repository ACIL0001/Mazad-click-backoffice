const getStorageKey = () => {
  if (typeof window === 'undefined') return 'auth';
  
  const port = window.location.port;
  console.log('🔑 Current port for storage key:', port);
  
  // Use different storage keys for different ports
  let key = 'auth'; // fallback
  
  if (port === '3002') {
    key = 'auth_seller';
  } else if (port === '3003') {
    key = 'auth_admin';
  }
  
  console.log('🔑 Selected storage key:', key);
  return key;
};

const app = {
  name: 'MazadClick',
  pole: 'NotEasy',
  timeout: 45000, // Increased to 45 seconds to handle slow responses
  domain: 'mazad.click',
  
  // Dynamic URLs based on environment
  socket: import.meta.env.VITE_SOCKET_URL || 'wss://mazad-click-server.onrender.com/',
  route: import.meta.env.VITE_STATIC_URL || "https://mazad-click-server.onrender.com/static/",
  baseURL: import.meta.env.VITE_API_URL || "https://mazad-click-server.onrender.com/",

  apiKey: '8f2a61c94d7e3b5f9c0a8d2e6b4f1c7a',
  
  // Retry configuration for failed requests
  retryAttempts: 3,
  retryDelay: 2000, // 2 seconds initial delay
  
  // Connection settings
  connectTimeout: 10000, // 10 seconds for initial connection
  maxRedirects: 5,
  
  // Request settings to handle Render.com limitations
  keepAlive: true,
  maxSockets: 10,
  
  // Export storage key function for auth isolation
  getStorageKey,
};

export { getStorageKey };
export default app;


