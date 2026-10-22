import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  if (online) return null;
  return (
    <div className="pt-safe fixed inset-x-0 top-0 z-[90] mx-auto flex max-w-[430px] items-center justify-center gap-2 bg-foreground/90 px-3 py-1.5 text-xs font-semibold text-background">
      <WifiOff className="h-3.5 w-3.5" /> ऑफलाइन मोड / Offline mode
    </div>
  );
}
