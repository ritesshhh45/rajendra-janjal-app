import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as api from './api';
const K = 'session_v1';
const A = createContext();
export const useAuth = () => useContext(A);
export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading
  useEffect(() => { (async () => {
    try { const s = JSON.parse((await SecureStore.getItemAsync(K)) || 'null'); setSession(s && s.token ? s : null); }
    catch { setSession(null); }
  })(); }, []);
  const login = async (s) => { await SecureStore.setItemAsync(K, JSON.stringify(s)); setSession(s); };
  const logout = async () => { await SecureStore.deleteItemAsync(K); setSession(null); };
  const remove = async () => { try { await api.deleteAccount(session?.token); } finally { await logout(); } };
  return <A.Provider value={{ session, login, logout, remove }}>{children}</A.Provider>;
}
