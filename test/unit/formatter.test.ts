import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PrettierBladeFormattingEngine } from "../../src/blade/formatter.js";

const engine = new PrettierBladeFormattingEngine();
const options = { filepath: undefined, tabWidth: 4, useTabs: false, printWidth: 120, singleQuote: true, formatPhpBlocks: false, formatEmbeddedCss: true, formatEmbeddedJavaScript: true, formatEmbeddedTypeScript: true, wrapAttributes: "auto" as const, preserveAttributeOrder: true, endOfLine: "lf" as const };
for (const fixture of ["basic", "directives", "components", "alpine", "livewire", "scripts", "styles", "verbatim", "broken"]) {
  describe(`formatter fixture: ${fixture}`, () => {
    it("matches expected output and is idempotent", async () => {
      const root = join(process.cwd(), "test", "fixtures", fixture);
      const input = await readFile(join(root, "input.blade.php"), "utf8"); const expected = await readFile(join(root, "expected.blade.php"), "utf8");
      const formatted = await engine.format(input, options);
      expect(formatted).toBe(expected); expect(await engine.format(formatted, options)).toBe(expected);
    });
  });
}
it("formats a large Blade document responsively", async () => {
  const source = Array.from({ length: 500 }, (_, index) => `@if($item${index})<div>{{$item${index}}}</div>@endif`).join("\n");
  const started = performance.now(); await engine.format(source, options); expect(performance.now() - started).toBeLessThan(5000);
});
it("formats TypeScript script regions while preserving Blade expressions", async () => {
  const formatted = await engine.format('<script type="text/typescript">const id:number={{$user->id}};</script>\n', options);
  expect(formatted).toContain("const id: number = {{ $user->id }};");
});
