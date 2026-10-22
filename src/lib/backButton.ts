import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { Capacitor } from "@capacitor/core";

const ROOT_ROUTES = ["/home", "/register", "/"];
const TAB_ROUTES = ["/services", "/schemes", "/updates", "/profile"];

export type BackAction = "home" | "prompt" | "exit" | "back";

/** Pure decision for the Android hardware back button. */
export function backAction(path: string, hasHistory: boolean, sinceLastBackMs: number): BackAction {
  const clean = path.length > 1 ? path.replace(/\/+$/, "") : path;
  if (TAB_ROUTES.includes(clean)) return "home";
  if (ROOT_ROUTES.includes(clean)) return sinceLastBackMs < 2000 ? "exit" : "prompt";
  return hasHistory ? "back" : "home";
}

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
        // 1) close any open dialog / bottom sheet / lightbox first
        const overlay = document.querySelector(
          '[role="dialog"][data-state="open"], [data-vaul-drawer][data-state="open"]',
        );
        if (overlay) {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
          return;
        }

        const action = backAction(
          router.state.location.pathname,
          window.history.length > 1,
          Date.now() - lastBack,
        );
        if (action === "home") router.navigate({ to: "/home", replace: true });
        else if (action === "back") router.history.back();
        else if (action === "exit") void App.exitApp();
        else {
          lastBack = Date.now();
          import("sonner").then(({ toast }) =>
            toast("बाहेर पडण्यासाठी पुन्हा मागे दाबा / Press back again to exit"),
          );
        }
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
