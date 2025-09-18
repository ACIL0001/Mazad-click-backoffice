//------------------------------------------------------------------------------
// <copyright file="checkout.tsx" Author="Abdelhamid Larachi">
//     Copyright (c) Abdelhamid Larachi.  All rights reserved.
// </copyright>
//------------------------------------------------------------------------------

import { createSlice } from "@reduxjs/toolkit";


export const loaderSlice = createSlice({
  name: "loader",
  initialState: false,
  reducers: {
    set: (state: any) => state = true,
    end: (state: any) => state = false
  },
});

// Action creators are generated for each case reducer function
export const { set, end } = loaderSlice.actions;

export default loaderSlice.reducer;
