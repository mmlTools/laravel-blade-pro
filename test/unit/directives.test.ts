import { describe, expect, it } from "vitest";
import { DirectiveRegistry } from "../../src/blade/directives.js";

describe("DirectiveRegistry", () => {
  it("classifies built-in block and inline directives", () => {
    const registry = new DirectiveRegistry();
    expect(registry.classify("if")).toBe("open"); expect(registry.classify("elseif")).toBe("middle");
    expect(registry.classify("endif")).toBe("close"); expect(registry.classify("csrf")).toBe("standalone");
  });
  it("supports validated custom pairs", () => {
    const registry = new DirectiveRegistry([{ start: "feature", middle: ["elsefeature"], end: "endfeature" }]);
    expect(registry.classify("feature")).toBe("open"); expect(registry.classify("elsefeature")).toBe("middle"); expect(registry.matchingStart("endfeature")).toBe("feature");
  });
});
