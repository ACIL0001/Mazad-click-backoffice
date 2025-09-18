import { useContext } from "react";
import {authStore} from '@/contexts/authStore';

// const useAuth = () => useContext(AuthContext);
const useAuth = authStore
export default useAuth;
