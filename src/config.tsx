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

const chooseUrl = (value: string | undefined, devFallback: string, prodFallback: string) =>
  value && value.trim() !== ''
    ? value.trim()
    : (import.meta.env.MODE === 'production' ? prodFallback : devFallback);

const app = {
  name: 'MazadClick',
  pole: 'NotEasy',
  timeout: 15000,
  domain: 'www.easyeats.com',
  
  // Updated to use production server URL
  // socket: 'https://mazadclick-server.onrender.com/',
  socket: chooseUrl(import.meta.env.VITE_SOCKET_URL, 'http://localhost:3000/', 'https://mazadclick-server.onrender.com/'),
  // route: "https://mazadclick-server.onrender.com",
  route: chooseUrl(import.meta.env.VITE_STATIC_URL, 'http://localhost:3000', 'https://mazadclick-server.onrender.com'),
  // baseURL: "https://mazadclick-server.onrender.com/",
  baseURL: chooseUrl(import.meta.env.VITE_API_URL, 'http://localhost:3000/', 'https://mazadclick-server.onrender.com/'),

  apiKey: '8f2a61c94d7e3b5f9c0a8d2e6b4f1c7a',
  
  // Export storage key function for auth isolation
  getStorageKey,
};

export { getStorageKey };
export default app;