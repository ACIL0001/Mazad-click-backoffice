//------------------------------------------------------------------------------
// <copyright file="cartStore.ts" Author="MazadClick Team">
//     Copyright (c) MazadClick.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { create } from 'zustand';

interface CartItem {
  id: string;
  quantity: number;
}

interface CartStore {
  items: Record<string, CartItem>;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  reset: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: {},
  increment: (id) =>
    set((state) => ({
      items: {
        ...state.items,
        [id]: {
          id,
          quantity: Math.min((state.items[id]?.quantity || 0) + 1, 100),
        },
      },
    })),
  decrement: (id) =>
    set((state) => ({
      items: {
        ...state.items,
        [id]: {
          id,
          quantity: Math.max((state.items[id]?.quantity || 0) - 1, 0),
        },
      },
    })),
  reset: () => set({ items: {} }),
}));
