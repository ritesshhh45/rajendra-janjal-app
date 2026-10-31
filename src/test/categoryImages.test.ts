import { describe, expect, it } from "vitest";
import { resolveCategoryPhoto } from "@/components/app/Icon";

describe("category photo mapping", () => {
  it("maps Marathi and English service names to relevant photography", () => {
    expect(resolveCategoryPhoto("पाणीपुरवठा")).toContain("images.unsplash.com");
    expect(resolveCategoryPhoto("Road repair")).toContain("images.unsplash.com");
    expect(resolveCategoryPhoto("LED Street Light")).toContain("images.unsplash.com");
    expect(resolveCategoryPhoto("गटार / Drainage")).toContain("images.unsplash.com");
  });

  it("returns null for unknown categories so the semantic fallback can render", () => {
    expect(resolveCategoryPhoto("Something new")).toBeNull();
  });
});
