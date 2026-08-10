import { DirectiveRegistry } from "./directives.js";
import type { BladeToken } from "./tokenizer.js";

export interface BladeBlock { name: string; start: number; end: number; children: BladeBlock[] }
interface OpenBlock extends BladeBlock { contentEnd: number }

export function parseDirectiveBlocks(tokens: readonly BladeToken[], registry: DirectiveRegistry): BladeBlock[] {
  const roots: BladeBlock[] = []; const stack: OpenBlock[] = [];
  for (const token of tokens) {
    if (token.kind === "verbatimRegion" || token.kind === "phpRegion") continue;
    if (token.kind !== "directive" || !token.name) continue;
    const role = registry.classify(token.name);
    if (role === "open") {
      const block: OpenBlock = { name: token.name.toLowerCase(), start: token.start, end: token.end, contentEnd: token.end, children: [] };
      const parent = stack.at(-1); if (parent) parent.children.push(block); else roots.push(block); stack.push(block);
    } else if (role === "close") {
      const expected = registry.matchingStart(token.name); let index = stack.length - 1;
      while (index >= 0 && stack[index]?.name !== expected) index--;
      if (index >= 0) { const block = stack[index]; if (block) block.end = token.end; stack.length = index; }
    }
  }
  return roots;
}
