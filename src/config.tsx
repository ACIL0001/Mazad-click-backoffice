const getStorageKey = () => {
  if (typeof window === 'undefined') return 'auth';
  
  const port = window.location.port;
  // Use different storage keys for different ports
  if (port === '3002') return 'auth_admin';
  if (port === '3003') return 'auth_seller';
  return 'auth'; // fallback
};

const app = {
  name: 'MazadClick',
  pole: 'NotEasy',
  timeout: 15000,
  domain: 'www.easyeats.com',
  // route: 'https://api.easyeats.dz/static/',
  // baseURL: 'https://api.easyeats.dz/v1/',
  // socket: 'wss://api.easyeats.dz/',
  
  socket: 'http://localhost:3000/',
  route: "http://localhost:3000",
  baseURL: "http://localhost:3000/",

  apiKey: '8f2a61c94d7e3b5f9c0a8d2e6b4f1c7a',
};

export default app;
