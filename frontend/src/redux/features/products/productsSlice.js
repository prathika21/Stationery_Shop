// productsSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  products: [], // Initial state for products
};

export const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    updateProductStock: (state, action) => {
      const { id, qty } = action.payload;
      const product = state.products.find((product) => product._id === id);
      if (product) {
        product.countInStock -= qty;
      }
    },
  },
});

export const { setProducts, updateProductStock } = productsSlice.actions;

export const selectProducts = (state) => state.products.products;

export default productsSlice.reducer;
