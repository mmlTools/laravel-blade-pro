import type { BladeToken, BladeTokenKind } from "./tokenizer.js";
export const PROTECTED_REGION_KINDS = new Set<BladeTokenKind>(["verbatimRegion", "phpRegion", "scriptRegion", "styleRegion"]);
export function protectedRegions(tokens: readonly BladeToken[]): BladeToken[] { return tokens.filter((token) => PROTECTED_REGION_KINDS.has(token.kind)); }
