import { toast } from "sonner";

const tabs = new Set(["/services", "/schemes", "/updates", "/profile"]);
export function backAction(path: string, canGoBack: boolean, elapsed: number) {
  if (tabs.has(path) || path === "/") return "home";
  if (path !== "/home" && path !== "/register") return canGoBack ? "back" : "home";
  return elapsed < 2000 ? "exit" : "prompt";
}

/** Event handler to close non-Radix overlays before native navigation. */
export const CLOSE_OVERLAY_EVENT = "dw-close-overlay";

export async function initBackButton(router: {
  state: { location: { pathname: string } };
  history: { canGoBack: () => boolean; back: () => void };
  navigate: (options: { to: "/home"; replace: boolean }) => unknown;
}): Promise<() => void> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return () => {};
    const { App } = await import("@capacitor/app");
    let lastPress = -Infinity;
    const listener = await App.addListener("backButton", () => {
      const custom = new CustomEvent(CLOSE_OVERLAY_EVENT, { cancelable: true });
      window.dispatchEvent(custom);
      if (custom.defaultPrevented) { lastPress = -Infinity; return; }
      const dialog = document.querySelector('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [data-vaul-drawer][data-state="open"]');
      if (dialog) {
        const cancel = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button")).find((button) => /cancel|close|रद्द|बंद/i.test(`${button.getAttribute("aria-label") ?? ""} ${button.textContent ?? ""}`));
        if (cancel) cancel.click();
        else dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape", bubbles: true }));
        lastPress = -Infinity;
        return;
      }
      const now = Date.now();
      const action = backAction(router.state.location.pathname, router.history.canGoBack(), now - lastPress);
      if (action === "exit") { void App.exitApp(); return; }
      if (action === "prompt") {
        lastPress = now;
        toast("बाहेर पडण्यासाठी पुन्हा मागे दाबा / Press back again to exit", { duration: 2000 });
        return;
      }
      lastPress = -Infinity;
      if (action === "back") router.history.back();
      else void router.navigate({ to: "/home", replace: true });
    });
    return () => { void listener.remove(); };
  } catch (error) {
    console.error("[back] setup failed", error);
    return () => {};
  }
}