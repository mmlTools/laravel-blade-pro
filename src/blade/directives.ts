export interface CustomDirectivePair { start: string; middle?: readonly string[]; end: string }
export type DirectiveRole = "open" | "middle" | "close" | "standalone";

const PAIRS: readonly CustomDirectivePair[] = [
  { start: "if", middle: ["elseif", "else"], end: "endif" },
  { start: "unless", middle: ["else"], end: "endunless" },
  { start: "foreach", end: "endforeach" }, { start: "forelse", middle: ["empty"], end: "endforelse" },
  { start: "for", end: "endfor" }, { start: "while", end: "endwhile" },
  { start: "switch", middle: ["case", "default"], end: "endswitch" },
  { start: "isset", end: "endisset" }, { start: "empty", end: "endempty" },
  { start: "auth", end: "endauth" }, { start: "guest", end: "endguest" },
  { start: "can", end: "endcan" }, { start: "cannot", end: "endcannot" }, { start: "canany", end: "endcanany" },
  { start: "env", end: "endenv" }, { start: "production", end: "endproduction" },
  { start: "section", middle: ["show"], end: "endsection" }, { start: "push", end: "endpush" },
  { start: "pushonce", end: "endpushonce" }, { start: "prepend", end: "endprepend" },
  { start: "once", end: "endonce" }, { start: "component", end: "endcomponent" },
  { start: "slot", end: "endslot" }, { start: "php", end: "endphp" }, { start: "verbatim", end: "endverbatim" }
];

const STANDALONE = new Set(["extends", "yield", "include", "includeif", "includewhen", "includeunless", "includefirst", "break", "continue", "csrf", "method", "vite", "vitereactrefresh", "stack", "props", "aware", "class", "style", "checked", "selected", "disabled", "readonly", "required", "json", "js"]);

export class DirectiveRegistry {
  private readonly roles = new Map<string, DirectiveRole>();
  private readonly closers = new Map<string, string>();
  constructor(customPairs: readonly CustomDirectivePair[] = [], customStandalone: readonly string[] = []) {
    for (const pair of [...PAIRS, ...customPairs]) {
      this.roles.set(pair.start.toLowerCase(), "open");
      this.roles.set(pair.end.toLowerCase(), "close");
      this.closers.set(pair.end.toLowerCase(), pair.start.toLowerCase());
      for (const middle of pair.middle ?? []) this.roles.set(middle.toLowerCase(), "middle");
    }
    for (const name of [...STANDALONE, ...customStandalone]) this.roles.set(name.toLowerCase(), "standalone");
  }
  classify(name: string): DirectiveRole { return this.roles.get(name.toLowerCase()) ?? "standalone"; }
  matchingStart(end: string): string | undefined { return this.closers.get(end.toLowerCase()); }
}
