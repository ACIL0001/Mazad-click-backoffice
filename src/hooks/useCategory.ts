import { useContext } from 'react';
import { CategoryContext } from '@/contexts/CategoryContextStore';

const useCategory = () => useContext(CategoryContext);
// eslint-disable-next-line react-refresh/only-export-components
export default useCategory;
