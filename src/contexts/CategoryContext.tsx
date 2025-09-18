/** @format */

import { useState, useEffect, createContext } from 'react';
import useAuth from '../hooks/useAuth';
import ICategory from '@/types/Category';
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
    const { isReady, isLogged } = useAuth();

    const updateCategory = async () => {

    CategoryAPI.getCategories().then(({ data }: { data: ICategory[] }) => {

      setCategories(data)

    });
  };

  useEffect(() => {
    if (!isReady || !isLogged) return;
    updateCategory();
  }, [isLogged, isReady]);

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
