import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./features/ui/uiSlice";
import { platformApi } from "./platformApi";

export function makeStore() {
  return configureStore({
    reducer: {
      ui: uiReducer,
      [platformApi.reducerPath]: platformApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(platformApi.middleware),
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
