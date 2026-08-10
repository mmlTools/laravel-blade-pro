import * as vscode from "vscode";
import { tokenizeBlade } from "./tokenizer.js";
import { DirectiveRegistry } from "./directives.js";

interface OpenDirective { name: string; line: number }
export class BladeFoldingProvider implements vscode.FoldingRangeProvider {
  provideFoldingRanges(document: vscode.TextDocument): vscode.FoldingRange[] {
    const settings = vscode.workspace.getConfiguration("laravelBlade", document.uri);
    const registry = new DirectiveRegistry(settings.get("customDirectivePairs", []), settings.get("customStandaloneDirectives", []));
    const stack: OpenDirective[] = []; const ranges: vscode.FoldingRange[] = [];
    for (const token of tokenizeBlade(document.getText())) {
      if (token.kind === "verbatimRegion" || token.kind === "phpRegion") {
        const start = document.positionAt(token.start).line; const end = document.positionAt(token.end).line;
        if (end > start) ranges.push(new vscode.FoldingRange(start, end - 1, vscode.FoldingRangeKind.Region));
        continue;
      }
      if (token.kind !== "directive" || !token.name) continue;
      const role = registry.classify(token.name);
      if (role === "open") stack.push({ name: token.name.toLowerCase(), line: document.positionAt(token.start).line });
      if (role === "close") {
        const expected = registry.matchingStart(token.name); let index = stack.length - 1;
        while (index >= 0 && stack[index]?.name !== expected) index--;
        if (index >= 0) { const open = stack[index]; const end = document.positionAt(token.start).line; if (open && end > open.line) ranges.push(new vscode.FoldingRange(open.line, end - 1)); stack.length = index; }
      }
    }
    return ranges;
  }
}
