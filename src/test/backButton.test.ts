import { describe, expect, it } from "vitest";
import { backAction } from "@/lib/backButton";

describe("Android back rules", () => {
  it("requires a second press within two seconds to exit Home", () => {
    expect(backAction("/home", true, 2000)).toBe("prompt");
    expect(backAction("/home", true, 1999)).toBe("exit");
  });
  it("requires a second press to exit Register", () => {
    expect(backAction("/register", false, 2000)).toBe("prompt");
    expect(backAction("/register", false, 1000)).toBe("exit");
  });
  it("returns all bottom tabs to Home", () => {
    for (const path of ["/services", "/schemes", "/updates", "/profile"]) expect(backAction(path, true, 100)).toBe("home");
  });
  it("never exits an inner page on one press", () => {
    expect(backAction("/gallery", true, 100)).toBe("back");
    expect(backAction("/gallery", false, 100)).toBe("home");
  });
});