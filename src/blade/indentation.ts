import type { BladeToken } from "./tokenizer.js";
import { DirectiveRegistry } from "./directives.js";

export function directiveDepths(tokens: readonly BladeToken[], registry: DirectiveRegistry): Map<number, number> {
  const result = new Map<number, number>(); let depth = 0;
  for (const token of tokens) {
    if (token.kind !== "directive" || !token.name) continue;
    const role = registry.classify(token.name);
    if (role === "close" || role === "middle") depth = Math.max(0, depth - 1);
    result.set(token.start, depth);
    if (role === "open" || role === "middle") depth++;
  }
  return result;
}
