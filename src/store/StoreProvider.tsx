import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from "react";
import { reducer, type Action } from "./reducer";
import { loadState, saveState } from "./storage";
import type { AppState } from "./types";

interface Store {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children, initialState }: { children: ReactNode; initialState?: AppState }) {
  const [state, dispatch] = useReducer(reducer, initialState, init => init ?? loadState());
  useEffect(() => saveState(state), [state]);
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
