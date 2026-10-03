import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CitizenSession = { id: string; token: string };
const KEY = "dw_citizen";

const Ctx = createContext<{
  session: CitizenSession | null;
  ready: boolean;
  setSession: (s: CitizenSession | null) => void;
}>({ session: null, ready: false, setSession: () => {} });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, set] = useState<CitizenSession | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) set(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);
  const setSession = (s: CitizenSession | null) => {
    set(s);
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  };
  return <Ctx.Provider value={{ session, ready, setSession }}>{children}</Ctx.Provider>;
}

export const useSession = () => useContext(Ctx);

export function getDeviceId() {
  let id = localStorage.getItem("dw_device");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("dw_device", id);
  }
  return id;
}
