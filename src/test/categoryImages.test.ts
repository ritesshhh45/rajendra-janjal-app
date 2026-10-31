import { describe, expect, it } from "vitest";
import { resolveCategoryPhoto } from "@/components/app/Icon";
import { getServiceVisual, getSchemeVisual, getWorkVisual } from "@/lib/visuals";

describe("category photo mapping (local images)", () => {
  it("maps Marathi and English service names to bundled photos", () => {
    expect(resolveCategoryPhoto("पाणीपुरवठा")).toBe("/images/services/water.webp");
    expect(resolveCategoryPhoto("Road repair")).toBe("/images/services/road.webp");
    expect(resolveCategoryPhoto("LED Street Light")).toBe("/images/services/street-light.webp");
    expect(resolveCategoryPhoto("गटार / Drainage")).toBe("/images/services/drainage.webp");
  });

  it("every seeded service category gets its own matching photo", () => {
    expect(getServiceVisual("Water Supply").image).toContain("water");
    expect(getServiceVisual("Road Repair").image).toContain("road");
    expect(getServiceVisual("Drainage & Cleanliness").image).toContain("drainage");
    expect(getServiceVisual("Electricity").image).toContain("electricity");
    expect(getServiceVisual("Street Lights").image).toContain("street-light");
    expect(getServiceVisual("Health Help").image).toContain("health");
    expect(getServiceVisual("Education Help").image).toContain("education");
    expect(getServiceVisual("Garden & Trees").image).toContain("garden");
  });

  it("maps development works", () => {
    expect(getWorkVisual("New water pipeline").image).toContain("pipeline");
    expect(getWorkVisual("Concrete road - Lane 5").image).toContain("road");
    expect(getWorkVisual("LED street lights").image).toContain("street-light");
    expect(getWorkVisual("Garden beautification").image).toContain("garden");
  });

  it("maps government schemes", () => {
    expect(getSchemeVisual("Mukhyamantri Majhi Ladki Bahin Yojana").image).toContain("women");
    expect(getSchemeVisual("Pradhan Mantri Awas Yojana (Urban)").image).toContain("housing");
    expect(getSchemeVisual("Ayushman Bharat (PM-JAY)").image).toContain("health");
    expect(getSchemeVisual("Sanjay Gandhi Niradhar Anudan Yojana").image).toContain("pension");
    expect(getSchemeVisual("Mahatma Phule Jan Arogya Yojana").image).toContain("medical");
  });

  it("returns null / general fallback for unknown categories", () => {
    expect(resolveCategoryPhoto("Something new")).toBeNull();
    expect(getServiceVisual("Something new").image).toContain("general");
  });
});
