import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { registerPush } from "@/lib/push";

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
  useEffect(() => {
    if (session) void registerPush(session);
  }, [session?.id]);
  const setSession = (s: CitizenSession | null) => {
    set(s);
    try {
      if (s) localStorage.setItem(KEY, JSON.stringify(s));
      else localStorage.removeItem(KEY);
    } catch {
      /* storage blocked: session lives in memory for this visit */
    }
  };
  return <Ctx.Provider value={{ session, ready, setSession }}>{children}</Ctx.Provider>;
}

export const useSession = () => useContext(Ctx);

let memDevice: string | null = null;
export function getDeviceId() {
  try {
    let id = localStorage.getItem("dw_device");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("dw_device", id);
    }
    return id;
  } catch {
    return (memDevice ??= crypto.randomUUID());
  }
}
