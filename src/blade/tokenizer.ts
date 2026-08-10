export type BladeTokenKind = "directive" | "echo" | "rawEcho" | "legacyEcho" | "comment" | "htmlTag" | "phpRegion" | "scriptRegion" | "styleRegion" | "verbatimRegion" | "text";
export interface BladeToken { kind: BladeTokenKind; start: number; end: number; text: string; name?: string }

const REGION_TAG = /<(script|style)\b[^>]*>/iy;
const HTML_TAG = /<\/?[A-Za-z][^>]*>/y;
const DIRECTIVE = /@([A-Za-z_][A-Za-z0-9_]*)\b/y;

export function tokenizeBlade(source: string): BladeToken[] {
  const tokens: BladeToken[] = []; let cursor = 0;
  const push = (kind: BladeTokenKind, start: number, end: number, name?: string): void => {
    const token: BladeToken = { kind, start, end, text: source.slice(start, end) };
    if (name !== undefined) token.name = name;
    tokens.push(token); cursor = end;
  };
  const until = (needle: string, from: number): number => { const found = source.indexOf(needle, from); return found < 0 ? source.length : found + needle.length; };
  while (cursor < source.length) {
    if (source.startsWith("{{--", cursor)) { push("comment", cursor, until("--}}", cursor + 4)); continue; }
    if (source.startsWith("{!!", cursor)) { push("rawEcho", cursor, until("!!}", cursor + 3)); continue; }
    if (source.startsWith("{{{", cursor)) { push("legacyEcho", cursor, until("}}}", cursor + 3)); continue; }
    if (source.startsWith("{{", cursor)) { push("echo", cursor, until("}}", cursor + 2)); continue; }
    DIRECTIVE.lastIndex = cursor; const directive = DIRECTIVE.exec(source);
    if (directive?.index === cursor && !isEmailContext(source, cursor)) {
      const name = directive[1] ?? "";
      if (name.toLowerCase() === "verbatim") { const endMatch = /@endverbatim\b/gi; endMatch.lastIndex = DIRECTIVE.lastIndex; const end = endMatch.exec(source); push("verbatimRegion", cursor, end ? end.index + end[0].length : source.length, "verbatim"); continue; }
      if (name.toLowerCase() === "php" && !/^\s*\(/.test(source.slice(DIRECTIVE.lastIndex))) { const end = until("@endphp", DIRECTIVE.lastIndex); push("phpRegion", cursor, end, "php"); continue; }
      push("directive", cursor, DIRECTIVE.lastIndex, name); continue;
    }
    REGION_TAG.lastIndex = cursor; const region = REGION_TAG.exec(source);
    if (region?.index === cursor) { const tag = (region[1] ?? "").toLowerCase(); const close = new RegExp(`</${tag}\\s*>`, "ig"); close.lastIndex = REGION_TAG.lastIndex; const end = close.exec(source); push(tag === "script" ? "scriptRegion" : "styleRegion", cursor, end ? end.index + end[0].length : source.length, tag); continue; }
    HTML_TAG.lastIndex = cursor; const html = HTML_TAG.exec(source); if (html?.index === cursor) { push("htmlTag", cursor, HTML_TAG.lastIndex); continue; }
    const next = nextSpecial(source, cursor + 1); push("text", cursor, next);
  }
  return tokens;
}

function isEmailContext(source: string, at: number): boolean { return at > 0 && /[\w.+-]/.test(source[at - 1] ?? ""); }
function nextSpecial(source: string, from: number): number { const positions = [source.indexOf("@", from), source.indexOf("<", from), source.indexOf("{{", from)].filter((value) => value >= 0); return positions.length ? Math.min(...positions) : source.length; }
