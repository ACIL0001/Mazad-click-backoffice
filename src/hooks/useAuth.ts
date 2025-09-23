// Try relative path instead of @ alias
import { authStore } from '../contexts/authStore';

console.log('USEAUTH: File loaded, authStore imported:', typeof authStore);

const useAuth = () => {
  console.log('USEAUTH: Hook called');
  const store = authStore();
  console.log('USEAUTH: Store result:', { set: typeof store.set, isLogged: store.isLogged });
  return store;
};

export default useAuth;