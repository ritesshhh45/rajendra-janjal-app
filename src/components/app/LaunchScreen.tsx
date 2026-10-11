import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import shivSenaLogo from "@/assets/shiv-sena-logo.png";
import { useSession } from "@/lib/session";
import { hideNativeSplash } from "@/lib/push";

export const SPLASH_HOLD_MS = 2000;
export const SPLASH_EXIT_MS = 500;

/** The document renders this logo before hydration; it survives the route replacement. */
export function LaunchScreen() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [phase, setPhase] = useState<"holding" | "exiting" | "done">(
    pathname === "/" ? "holding" : "done",
  );
  const [held, setHeld] = useState(false);
  const { ready, session } = useSession();
  const navigate = useNavigate();
  const logo = useRef<HTMLImageElement>(null);
  const started = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    // Do not hide the native screen until the bundled image is decoded and painted.
    const paint = async () => {
      await logo.current?.decode?.().catch(() => {});
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (!cancelled) void hideNativeSplash();
        });
      });
    };
    void paint();
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    if (phase !== "holding") return;
    const timer = setTimeout(() => setHeld(true), SPLASH_HOLD_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!held || !ready || phase !== "holding" || started.current) return;
    started.current = true;
    void navigate({ to: session ? "/home" : "/register", replace: true });
    setPhase("exiting");
  }, [held, ready, phase, session, navigate]);

  useEffect(() => {
    if (phase !== "exiting") return;
    const timer = setTimeout(() => setPhase("done"), SPLASH_EXIT_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <>
      <div className={phase === "exiting" ? "splash-destination" : undefined}>
        <Outlet />
      </div>
      {phase !== "done" && (
        <main className={`launch-splash${phase === "exiting" ? " launch-splash-exit" : ""}`} aria-label="Shiv Sena">
          <img ref={logo} src={shivSenaLogo} alt="Shiv Sena" width={160} height={160} className="launch-splash-logo" fetchPriority="high" />
        </main>
      )}
    </>
  );
}