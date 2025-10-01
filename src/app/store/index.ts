import { combineReducers, configureStore } from '@reduxjs/toolkit'
import cartReducer from '../slices/cart'
import loaderReducer from '../slices/loader'
import storage from 'redux-persist/lib/storage'
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
//import thunk from 'redux-thunk';

const reducers = combineReducers({
  cart: cartReducer,
  loader: loaderReducer,
});
 
 const persistConfig = {
     key: 'root',
     storage,
     // FIXED: Add whitelist to only persist specific reducers
     whitelist: ['cart', 'loader']
 };
 
 const persistedReducer = persistReducer(persistConfig, reducers);
 
 const store = configureStore({
     reducer: persistedReducer,
     devTools: process.env.NODE_ENV !== 'production',
     // FIXED: Add middleware configuration to ignore non-serializable values
     middleware: (getDefaultMiddleware) =>
       getDefaultMiddleware({
         serializableCheck: {
           ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
         },
       }),
 });
 
export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch