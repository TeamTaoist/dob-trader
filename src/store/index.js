import {configureStore} from "@reduxjs/toolkit";
import mainReducer from "./reducer";
import storage from 'redux-persist/lib/storage'
import {
    persistStore,
    persistReducer,
} from 'redux-persist'

const persistConfig = {
  key: "root",
  storage,
  blacklist: ["loading"],
};
const persistedReducer = persistReducer(persistConfig, mainReducer)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        }),
})

export const persistor = persistStore(store)
export default store;
