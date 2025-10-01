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
  timeout: 15000,
  domain: 'www.easyeats.com',
  
  // Updated to use production server URL
  socket: 'https://mazadclick-server.onrender.com/',
  route: "https://mazadclick-server.onrender.com",
  baseURL: "https://mazadclick-server.onrender.com/",

  apiKey: '8f2a61c94d7e3b5f9c0a8d2e6b4f1c7a',
  
  // Export storage key function for auth isolation
  getStorageKey,
};

export { getStorageKey };
export default app;