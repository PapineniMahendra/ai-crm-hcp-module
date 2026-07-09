import { configureStore } from '@reduxjs/toolkit';
import crmReducer from './formSlice';

export const store = configureStore({
  reducer: {
    crm: crmReducer
  }
});