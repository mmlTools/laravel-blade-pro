import { describe, expect, it } from "vitest";
import { tokenizeBlade } from "../../src/blade/tokenizer.js";

describe("tokenizeBlade", () => {
  it("recognizes directives, echoes, comments, components, and embedded regions", () => {
    const tokens = tokenizeBlade("{{-- c --}} @if($x)<x-card>{{ $x }}</x-card><script>const x={{$x}};</script>@endif");
    expect(tokens.map((token) => token.kind)).toEqual(expect.arrayContaining(["comment", "directive", "htmlTag", "echo", "scriptRegion"]));
  });
  it("does not interpret email addresses as directives", () => expect(tokenizeBlade("mail a@example.com").some((token) => token.kind === "directive")).toBe(false));
  it("preserves verbatim as one opaque token", () => {
    const tokens = tokenizeBlade("@verbatim {{ nope }} @if(x) @endverbatim");
    expect(tokens).toHaveLength(1); expect(tokens[0]?.kind).toBe("verbatimRegion");
  });
  it("does not crash on malformed templates", () => expect(() => tokenizeBlade("@if($x) <div {{ broken")).not.toThrow());
});
