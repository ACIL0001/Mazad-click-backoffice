/** @format */

import { useState, useEffect, createContext } from 'react';
import useAuth from '../hooks/useAuth';
import { ICategory } from '@/types/Category';
import { CategoryAPI } from '@/api/category';

interface ICategoryContext {
  categories: ICategory[]
  updateCategory: () => Promise<void>;
}

export const CategoryContext = createContext<ICategoryContext>({
  categories: [] as ICategory[],
  updateCategory: async () => {},
});

const CategoryProvider = ({ children }: any) => {

    const [categories, setCategories] = useState<ICategory[]>([]) 
    const [lastFetchTime, setLastFetchTime] = useState<number>(0);
    const { isReady, isLogged, tokens } = useAuth();

    const updateCategory = async () => {
        // Prevent fetching more than once every 5 seconds
        const now = Date.now();
        if (now - lastFetchTime < 5000) {
            console.log('CategoryContext: Skipping fetch - too soon since last fetch');
            return;
        }
        
        // Prevent re-fetching if data is cached
        if (categories.length > 0 && now - lastFetchTime < 180000) {
            return;
        }
        
        setLastFetchTime(now);
        CategoryAPI.getCategories().then((data: ICategory[]) => {
            setCategories(data)
        }).catch((error) => {
            console.error('CategoryContext: Failed to fetch categories:', error);
        });
    };

  useEffect(() => {
    if (!isReady || !isLogged || !tokens?.accessToken) return;
    updateCategory();
  }, [isLogged, isReady, tokens?.accessToken]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        updateCategory,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryProvider;