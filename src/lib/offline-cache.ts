// Persist React Query data (settings, schemes, updates, gallery...) so screens open offline.
import type { QueryClient } from "@tanstack/react-query";
import { persistQueryClient as persist } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export function persistQueryClient(queryClient: QueryClient): () => void {
  if (typeof window === "undefined") return () => {};
  try {
    const persister = createSyncStoragePersister({ storage: window.localStorage, key: "dw_query_cache", throttleTime: 1000 });
    const [unsub] = persist({ queryClient, persister, maxAge: 1000 * 60 * 60 * 24 * 7 });
    return unsub;
  } catch {
    return () => {};
  }
}
