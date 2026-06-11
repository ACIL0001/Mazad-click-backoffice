import { createContext } from 'react';
import { ICategory } from '@/types/Category';

export interface ICategoryContext {
  categories: ICategory[]
  updateCategory: () => Promise<void>;
}

export const CategoryContext = createContext<ICategoryContext>({
  categories: [] as ICategory[],
  updateCategory: async () => {},
});
