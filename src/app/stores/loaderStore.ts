//------------------------------------------------------------------------------
// <copyright file="loaderStore.ts" Author="MazadClick Team">
//     Copyright (c) MazadClick.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { create } from 'zustand';

interface LoaderStore {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  startLoading: () => void;
  stopLoading: () => void;
}

export const useLoaderStore = create<LoaderStore>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  startLoading: () => set({ isLoading: true }),
  stopLoading: () => set({ isLoading: false }),
}));
