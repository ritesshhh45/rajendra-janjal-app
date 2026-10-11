import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LaunchScreen } from "@/components/app/LaunchScreen";

const state = vi.hoisted(() => ({ pathname: "/", session: null as { id: string; token: string } | null, navigate: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
  Outlet: () => null,
  useNavigate: () => state.navigate,
  useRouterState: () => state.pathname,
}));
vi.mock("@/lib/session", () => ({ useSession: () => ({ ready: true, session: state.session }) }));
vi.mock("@/lib/push", () => ({ hideNativeSplash: vi.fn() }));

describe("Cold-launch splash navigation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    state.pathname = "/";
    state.session = null;
    state.navigate.mockClear();
  });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it("starts Register replacement at 2 seconds, allowing a 500ms transition", () => {
    render(<LaunchScreen />);
    act(() => vi.advanceTimersByTime(1999));
    expect(state.navigate).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(state.navigate).toHaveBeenCalledExactlyOnceWith({ to: "/register", replace: true });
  });

  it("replaces the launch route with Home for a saved citizen", () => {
    state.session = { id: "citizen", token: "test-token" };
    render(<LaunchScreen />);
    act(() => vi.advanceTimersByTime(2000));
    expect(state.navigate).toHaveBeenCalledExactlyOnceWith({ to: "/home", replace: true });
  });

  it("does not run again when opening a bottom tab directly", () => {
    state.pathname = "/services";
    render(<LaunchScreen />);
    act(() => vi.advanceTimersByTime(3000));
    expect(state.navigate).not.toHaveBeenCalled();
  });
});