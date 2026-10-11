import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { Capacitor } from "@capacitor/core";

const ROOT_ROUTES = ["/home", "/register", "/"];
const TAB_ROUTES = ["/services", "/schemes", "/updates", "/profile"];

export function useAndroidBackButton() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let lastBack = 0;
    let remove: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const { App } = await import("@capacitor/app");
      const handle = await App.addListener("backButton", () => {
        // 1) close any open dialog / bottom sheet
        const overlay = document.querySelector(
          '[role="dialog"][data-state="open"], [data-vaul-drawer][data-state="open"]'
        );
        if (overlay) {
          document.dispatchEvent(
            new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
          );
          return;
        }

        const path = router.state.location.pathname;

        // 2) tab page -> Home
        if (TAB_ROUTES.some((p) => path.startsWith(p)) && path.split("/").length <= 2) {
          router.navigate({ to: "/home", replace: true });
          return;
        }

        // 3) root page -> press twice to exit
        if (ROOT_ROUTES.includes(path)) {
          const now = Date.now();
          if (now - lastBack < 2000) {
            App.exitApp();
          } else {
            lastBack = now;
            import("sonner").then(({ toast }) =>
              toast("बाहेर पडण्यासाठी पुन्हा मागे दाबा / Press back again to exit")
            );
          }
          return;
        }

        // 4) inner page -> go back, or Home if no history
        if (window.history.length > 1) router.history.back();
        else router.navigate({ to: "/home", replace: true });
      });
      if (cancelled) handle.remove();
      else remove = () => handle.remove();
    })();

    return () => {
      cancelled = true;
      remove?.();
    };
  }, [router]);
}