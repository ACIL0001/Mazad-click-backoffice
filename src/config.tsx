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
  timeout: 30000,
  domain: 'mazad.click',
  
  // Dynamic URLs based on environment
  socket: import.meta.env.VITE_SOCKET_URL || 'wss://mazad-click-server.onrender.com/',
  route: import.meta.env.VITE_STATIC_URL || "https://mazad-click-server.onrender.com/static/",
  baseURL: import.meta.env.VITE_API_URL || "https://mazad-click-server.onrender.com/",

  apiKey: '64d2e8b7c3a9f1e5d8b2a4c6e9f0d3a5',
  
  // Export storage key function for auth isolation
  getStorageKey,
};

export { getStorageKey };
export default app;