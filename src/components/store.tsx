"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { products } from "@/data/products";
import { ToastNotification } from "./ui";
type State = { wishlist: string[]; bag: Record<string, number> };
const empty: State = { wishlist: [], bag: {} };
const key = "aurel-shopping-v1";
let snapshot: State | null = null;
const listeners = new Set<() => void>();
function validate(raw: unknown): State {
  if (!raw || typeof raw !== "object") return empty;
  const value = raw as Partial<State>;
  const valid = new Set(products.map((p) => p.slug));
  return {
    wishlist: Array.isArray(value.wishlist)
      ? [
          ...new Set(
            value.wishlist.filter(
              (id) => typeof id === "string" && valid.has(id),
            ),
          ),
        ]
      : [],
    bag: Object.fromEntries(
      Object.entries(value.bag || {})
        .filter(
          ([id, n]) =>
            valid.has(id) &&
            typeof n === "number" &&
            Number.isFinite(n) &&
            n >= 1,
        )
        .map(([id, n]) => [id, Math.min(99, Math.floor(n))]),
    ),
  };
}
function getSnapshot() {
  if (snapshot === null) {
    try {
      snapshot = validate(JSON.parse(localStorage.getItem(key) || "null"));
    } catch {
      snapshot = empty;
    }
  }
  return snapshot;
}
function subscribe(callback: () => void) {
  listeners.add(callback);
  const sync = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      snapshot = null;
      callback();
    }
  };
  window.addEventListener("storage", sync);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", sync);
  };
}
function update(next: State) {
  snapshot = next;
  let stored = true;
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    stored = false;
  }
  listeners.forEach((fn) => fn());
  return stored;
}
const Context = createContext<{
  state: State;
  ready: boolean;
  toggle: (id: string) => void;
  quantity: (id: string, n: number) => void;
  add: (id: string, n: number) => void;
} | null>(null);
export function Store({ children }: { children: React.ReactNode }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [message]);
  const save = (next: State, success = "") => {
    const stored = update(next);
    setMessage(
      stored
        ? success
        : "Browser storage is unavailable. Your selection is saved for this visit.",
    );
  };
  const toggle = (id: string) => {
    const s = getSnapshot();
    save({
      ...s,
      wishlist: s.wishlist.includes(id)
        ? s.wishlist.filter((x) => x !== id)
        : [...s.wishlist, id],
    });
  };
  const quantity = (id: string, n: number) => {
    const s = getSnapshot();
    const bag = { ...s.bag };
    if (n <= 0) delete bag[id];
    else bag[id] = Math.max(1, Math.min(99, Math.floor(n)));
    save({ ...s, bag });
  };
  const add = (id: string, n: number) => {
    const s = getSnapshot();
    save(
      { ...s, bag: { ...s.bag, [id]: Math.min(99, (s.bag[id] || 0) + n) } },
      "Added to your shopping bag.",
    );
  };
  return (
    <Context.Provider
      value={{
        state: current || empty,
        ready: current !== null,
        toggle,
        quantity,
        add,
      }}
    >
      {children}
      <ToastNotification message={message} />
    </Context.Provider>
  );
}
export function useStore() {
  const value = useContext(Context);
  if (!value) throw new Error("Store is required");
  return value;
}
