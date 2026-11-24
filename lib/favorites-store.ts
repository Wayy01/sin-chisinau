"use client";

import { useSyncExternalStore } from "react";

type State = { ready: boolean; loggedIn: boolean; ids: Set<string> };

let state: State = { ready: false, loggedIn: false, ids: new Set() };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const favorites = {
  hydrate(ids: string[], loggedIn: boolean) {
    state = { ready: true, loggedIn, ids: new Set(ids) };
    emit();
  },
  set(id: string, on: boolean) {
    const ids = new Set(state.ids);
    if (on) ids.add(id);
    else ids.delete(id);
    state = { ...state, ids };
    emit();
  },
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const serverState: State = { ready: false, loggedIn: false, ids: new Set() };

export function useFavorites() {
  return useSyncExternalStore(subscribe, () => state, () => serverState);
}
