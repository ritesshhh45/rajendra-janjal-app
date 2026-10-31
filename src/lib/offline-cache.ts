// Persist React Query data (settings, schemes, updates, gallery...) so screens open offline.
import type { QueryClient } from "@tanstack/react-query";
import { persistQueryClient as persist } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export function persistQueryClient(queryClient: QueryClient): () => void {
  if (typeof window === "undefined") return () => {};
  try {
    const persister = createSyncStoragePersister({ storage: window.localStorage, key: "dw_query_cache", throttleTime: 1000 });
    // Personal data (citizen profile, complaints) and the whole admin panel (all citizens' details)
    // must never be written to localStorage. Only public content is cached for offline use.
    const PRIVATE = new Set(["me", "complaints", "admin"]);
    const [unsub] = persist({
      queryClient,
      persister,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      dehydrateOptions: {
        shouldDehydrateQuery: (q) => q.state.status === "success" && !PRIVATE.has(String(q.queryKey[0])),
      },
    });
    return unsub;
  } catch {
    return () => {};
  }
}
