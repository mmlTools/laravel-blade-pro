import * as vscode from "vscode";
import type { BladeFormattingEngine } from "../blade/formatter.js";
import { readSettings } from "../configuration/settings.js";

export class LaravelBladeRangeFormattingProvider implements vscode.DocumentRangeFormattingEditProvider {
  constructor(private readonly engine: BladeFormattingEngine, private readonly output: vscode.OutputChannel) {}
  async provideDocumentRangeFormattingEdits(document: vscode.TextDocument, range: vscode.Range, options: vscode.FormattingOptions, token: vscode.CancellationToken): Promise<vscode.TextEdit[]> {
    if (token.isCancellationRequested || range.isEmpty) return [];
    const expanded = new vscode.Range(range.start.line, 0, range.end.line, document.lineAt(range.end.line).text.length);
    const source = document.getText(expanded);
    try {
      const formatted = await this.engine.format(source, readSettings(document, options).blade);
      if (token.isCancellationRequested || formatted.trimEnd() === source.trimEnd()) return [];
      return [vscode.TextEdit.replace(expanded, formatted.replace(/\r?\n$/, ""))];
    } catch (error) {
      this.output.appendLine(`Range formatting was skipped: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }
}
