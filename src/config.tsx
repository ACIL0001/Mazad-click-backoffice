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
  
  // FIXED: Based on your logs, your backend API is actually on port 3000, not 3003
  socket: 'http://localhost:3000/',
  route: "http://localhost:3000",
  baseURL: "http://localhost:3000/",

  apiKey: '8f2a61c94d7e3b5f9c0a8d2e6b4f1c7a',
  
  // Export storage key function for auth isolation
  getStorageKey,
};

export { getStorageKey };
export default app;